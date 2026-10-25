import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }

const PHOTO_BUCKET = 'visitor-photos'
const PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function serialize(row: any) {
  const unit = Array.isArray(row.units) ? row.units[0] : row.units
  const watchman = Array.isArray(row.watchmen) ? row.watchmen[0] : row.watchmen
  const resident = Array.isArray(row.residents) ? row.residents[0] : row.residents
  return {
    id: row.id, visitorName: row.visitor_name, visitorPhone: row.visitor_phone,
    purpose: row.purpose, status: row.status, unitId: row.unit_id,
    unitNumber: unit?.unit_number || '', watchmanName: watchman?.name || '',
    decisionByName: resident?.name || null, denialReason: row.denial_reason,
    requestedAt: row.requested_at, decisionAt: row.decision_at,
    checkedInAt: row.checked_in_at, checkedOutAt: row.checked_out_at,
    photoUrl: row.photo_path ? `/api/visitor-requests/${row.id}/photo` : null,
  }
}

const selection = 'id, unit_id, visitor_name, visitor_phone, purpose, status, denial_reason, requested_at, decision_at, checked_in_at, checked_out_at, photo_path, units(unit_number), watchmen(name), residents!visitor_requests_decision_by_fkey(name)'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['watchman', 'resident', 'society_admin'].includes(session.accountType)) return response.unauthorized()
    let unitIds: string[] | null = null
    if (session.accountType === 'resident') {
      const { data: assignments, error } = await supabaseAdmin.from('unit_assignments').select('unit_id').eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active')
      if (error) return response.error(error.message, 400)
      unitIds = (assignments || []).map((item) => item.unit_id)
      if (!unitIds.length) return response.success([])
    }
    let query = supabaseAdmin.from('visitor_requests').select(selection).eq('society_id', session.societyId).order('requested_at', { ascending: false }).limit(100)
    if (unitIds) query = query.in('unit_id', unitIds)
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) {
    console.error('[Visitor requests] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'watchman') return response.unauthorized()
    const contentType = request.headers.get('content-type') || ''
    const body = contentType.includes('multipart/form-data') ? await request.formData() : await request.json()
    const getValue = (key: string) => body instanceof FormData ? body.get(key) : body[key]
    const unitId = clean(getValue('unitId')), visitorName = clean(getValue('visitorName')), visitorPhone = clean(getValue('visitorPhone')), purpose = clean(getValue('purpose'))
    const photo = body instanceof FormData ? body.get('photo') : null
    if (!unitId || !visitorName || !visitorPhone) return response.error('Property, visitor name, and phone are required', 400)
    if (!/^\d{6,15}$/.test(visitorPhone.replace(/[+\s-]/g, ''))) return response.error('Enter a valid visitor phone number', 400)
    if (!(photo instanceof File) || photo.size === 0) return response.error('A visitor photo is required', 400)
    if (!PHOTO_TYPES[photo.type]) return response.error('Photo must be a JPEG, PNG, or WebP image', 400)
    if (photo.size > 5 * 1024 * 1024) return response.error('Photo must be smaller than 5 MB', 400)
    const { data: unit } = await supabaseAdmin.from('units').select('id').eq('id', unitId).eq('society_id', session.societyId).eq('lifecycle_status', 'active').maybeSingle()
    if (!unit) return response.notFound('Property not found')
    const { count } = await supabaseAdmin.from('unit_assignments').select('id', { count: 'exact', head: true }).eq('unit_id', unitId).eq('society_id', session.societyId).eq('status', 'active')
    if (!count) return response.error('This property has no active resident to approve the visitor', 409)
    const photoPath = `${session.societyId}/${crypto.randomUUID()}.${PHOTO_TYPES[photo.type]}`
    const { error: uploadError } = await supabaseAdmin.storage.from(PHOTO_BUCKET).upload(photoPath, photo, { contentType: photo.type, upsert: false })
    if (uploadError) return response.error(`Could not save visitor photo: ${uploadError.message}`, 400)
    const { data, error } = await supabaseAdmin.from('visitor_requests').insert({ society_id: session.societyId, unit_id: unitId, watchman_id: session.accountId, visitor_name: visitorName, visitor_phone: visitorPhone, purpose, photo_path: photoPath }).select(selection).single()
    if (error) {
      await supabaseAdmin.storage.from(PHOTO_BUCKET).remove([photoPath])
      return response.error(error.message, 400)
    }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'watchman', actor_id: session.accountId, action: 'visitor.requested', entity_type: 'visitor_request', entity_id: data.id, metadata: { unit_id: unitId } })
    return response.created(serialize(data))
  } catch (error) {
    console.error('[Visitor requests] POST failed:', error)
    return response.serverError()
  }
}
