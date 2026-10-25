import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const PHOTO_BUCKET = 'issue-photos'
const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const CATEGORIES = new Set(['maintenance', 'water', 'plumbing', 'electrical', 'cleaning', 'noise', 'security', 'other'])
const PRIORITIES = new Set(['low', 'medium', 'high', 'urgent'])
const STATUSES = new Set(['open', 'in_progress', 'resolved', 'closed'])
const selection = 'id, unit_id, resident_id, category, title, description, priority, status, photo_path, admin_note, created_at, resolved_at, updated_at, units(unit_number), residents(name, phone), society_admins!issues_handled_by_fkey(holder_name, post_name)'
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
function serialize(row: any) { const unit = Array.isArray(row.units) ? row.units[0] : row.units; const resident = Array.isArray(row.residents) ? row.residents[0] : row.residents; const admin = Array.isArray(row.society_admins) ? row.society_admins[0] : row.society_admins; return { id: row.id, unitId: row.unit_id, unitNumber: unit?.unit_number || '', residentName: resident?.name || '', residentPhone: resident?.phone || '', category: row.category, title: row.title, description: row.description, priority: row.priority, status: row.status, adminNote: row.admin_note, createdAt: row.created_at, resolvedAt: row.resolved_at, updatedAt: row.updated_at, handledByName: admin?.holder_name || admin?.post_name || null, photoUrl: row.photo_path ? `/api/complaints/${row.id}/photo` : null } }

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['resident', 'society_admin'].includes(session.accountType)) return response.unauthorized()
    let query = supabaseAdmin.from('issues').select(selection).eq('society_id', session.societyId).order('created_at', { ascending: false }).limit(100)
    if (session.accountType === 'resident') query = query.eq('resident_id', session.accountId)
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) { console.error('[Issues] GET failed:', error); return response.serverError() }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'resident') return response.unauthorized()
    const body = await request.formData(), unitId = clean(body.get('unitId')), category = clean(body.get('category')), title = clean(body.get('title')), description = clean(body.get('description')), priority = clean(body.get('priority')) || 'medium', photo = body.get('photo')
    if (!unitId || title.length < 3 || description.length < 10) return response.error('Property, title, and a detailed description are required', 400)
    if (!CATEGORIES.has(category) || !PRIORITIES.has(priority)) return response.error('Invalid category or priority', 400)
    const { data: assignment } = await supabaseAdmin.from('unit_assignments').select('id').eq('unit_id', unitId).eq('resident_id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
    if (!assignment) return response.error('You cannot report an issue for this property', 403)
    let photoPath: string | null = null
    if (photo instanceof File && photo.size > 0) {
      if (!PHOTO_TYPES[photo.type]) return response.error('Photo must be a JPEG, PNG, or WebP image', 400)
      if (photo.size > 5 * 1024 * 1024) return response.error('Photo must be smaller than 5 MB', 400)
      photoPath = `${session.societyId}/${crypto.randomUUID()}.${PHOTO_TYPES[photo.type]}`
      const { error: uploadError } = await supabaseAdmin.storage.from(PHOTO_BUCKET).upload(photoPath, photo, { contentType: photo.type, upsert: false })
      if (uploadError) return response.error(`Could not save issue photo: ${uploadError.message}`, 400)
    }
    const { data, error } = await supabaseAdmin.from('issues').insert({ society_id: session.societyId, unit_id: unitId, resident_id: session.accountId, category, title, description, priority, photo_path: photoPath }).select(selection).single()
    if (error) { if (photoPath) await supabaseAdmin.storage.from(PHOTO_BUCKET).remove([photoPath]); return response.error(error.message, 400) }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'issue.created', entity_type: 'issue', entity_id: data.id, metadata: { unit_id: unitId, priority } })
    return response.created(serialize(data))
  } catch (error) { console.error('[Issues] POST failed:', error); return response.serverError() }
}

export async function PATCH(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const body = await request.json(), issueId = clean(body.issueId), status = clean(body.status), adminNote = clean(body.adminNote)
    if (!issueId || !STATUSES.has(status)) return response.error('Issue and valid status are required', 400)
    if (['resolved', 'closed'].includes(status) && !adminNote) return response.error('A resolution note is required', 400)
    const { data: current } = await supabaseAdmin.from('issues').select('id, status').eq('id', issueId).eq('society_id', session.societyId).maybeSingle()
    if (!current) return response.notFound('Issue not found')
    if (current.status === 'closed') return response.conflict('Closed issues cannot be changed')
    const updates = { status, admin_note: adminNote || null, handled_by: session.accountId, resolved_at: ['resolved', 'closed'].includes(status) ? new Date().toISOString() : null }
    const { data, error } = await supabaseAdmin.from('issues').update(updates).eq('id', issueId).eq('society_id', session.societyId).eq('status', current.status).select(selection).single()
    if (error) return response.conflict('Issue status changed. Refresh and try again.')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: `issue.${status}`, entity_type: 'issue', entity_id: issueId, metadata: { previous_status: current.status } })
    return response.success(serialize(data))
  } catch (error) { console.error('[Issues] PATCH failed:', error); return response.serverError() }
}
