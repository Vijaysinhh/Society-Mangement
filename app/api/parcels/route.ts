import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const PARCEL_TYPES = new Set(['small', 'medium', 'large', 'package', 'food'])
const selection = 'id, unit_id, recipient_name, sender_name, parcel_type, notes, status, received_at, collected_at, collected_by_type, units(unit_number), watchmen(name, phone)'
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
function serialize(row: any) { const unit = Array.isArray(row.units) ? row.units[0] : row.units; const watchman = Array.isArray(row.watchmen) ? row.watchmen[0] : row.watchmen; return { id: row.id, unitId: row.unit_id, unitNumber: unit?.unit_number || '', recipientName: row.recipient_name, senderName: row.sender_name, parcelType: row.parcel_type, notes: row.notes, status: row.status, receivedAt: row.received_at, collectedAt: row.collected_at, collectedByType: row.collected_by_type, watchmanName: watchman?.name || '', watchmanPhone: watchman?.phone || '' } }

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['watchman', 'resident', 'society_admin'].includes(session.accountType)) return response.unauthorized()
    let query = supabaseAdmin.from('parcels').select(selection).eq('society_id', session.societyId).order('received_at', { ascending: false }).limit(100)
    if (session.accountType === 'resident') {
      const { data: assignments, error } = await supabaseAdmin.from('unit_assignments').select('unit_id').eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active')
      if (error) return response.error(error.message, 400)
      const unitIds = (assignments || []).map((item) => item.unit_id)
      if (!unitIds.length) return response.success([])
      query = query.in('unit_id', unitIds)
    }
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) { console.error('[Parcels] GET failed:', error); return response.serverError() }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'watchman') return response.unauthorized()
    const body = await request.json()
    const unitId = clean(body.unitId), recipientName = clean(body.recipientName), senderName = clean(body.senderName), notes = clean(body.notes), parcelType = clean(body.parcelType) || 'package'
    if (!unitId || !recipientName || !senderName) return response.error('Property, recipient, and sender are required', 400)
    if (!PARCEL_TYPES.has(parcelType)) return response.error('Invalid parcel type', 400)
    const { data: unit } = await supabaseAdmin.from('units').select('id').eq('id', unitId).eq('society_id', session.societyId).eq('lifecycle_status', 'active').maybeSingle()
    if (!unit) return response.notFound('Property not found')
    const { count } = await supabaseAdmin.from('unit_assignments').select('id', { count: 'exact', head: true }).eq('unit_id', unitId).eq('society_id', session.societyId).eq('status', 'active')
    if (!count) return response.error('This property has no active resident', 409)
    const { data, error } = await supabaseAdmin.from('parcels').insert({ society_id: session.societyId, unit_id: unitId, watchman_id: session.accountId, recipient_name: recipientName, sender_name: senderName, parcel_type: parcelType, notes }).select(selection).single()
    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'watchman', actor_id: session.accountId, action: 'parcel.received', entity_type: 'parcel', entity_id: data.id, metadata: { unit_id: unitId } })
    return response.created(serialize(data))
  } catch (error) { console.error('[Parcels] POST failed:', error); return response.serverError() }
}

export async function PATCH(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['watchman', 'resident'].includes(session.accountType)) return response.unauthorized()
    const body = await request.json(), parcelId = clean(body.parcelId)
    if (!parcelId) return response.error('Parcel is required', 400)
    const { data: parcel } = await supabaseAdmin.from('parcels').select('id, unit_id, status').eq('id', parcelId).eq('society_id', session.societyId).maybeSingle()
    if (!parcel) return response.notFound('Parcel not found')
    if (parcel.status !== 'stored') return response.conflict('This parcel has already been collected')
    if (session.accountType === 'resident') {
      const { data: assignment } = await supabaseAdmin.from('unit_assignments').select('id').eq('unit_id', parcel.unit_id).eq('resident_id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
      if (!assignment) return response.error('You cannot collect this parcel', 403)
    }
    const { data, error } = await supabaseAdmin.from('parcels').update({ status: 'collected', collected_at: new Date().toISOString(), collected_by_type: session.accountType, collected_by: session.accountId }).eq('id', parcelId).eq('society_id', session.societyId).eq('status', 'stored').select(selection).single()
    if (error) return response.conflict('Parcel status changed. Refresh and try again.')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: session.accountType, actor_id: session.accountId, action: 'parcel.collected', entity_type: 'parcel', entity_id: parcelId, metadata: { unit_id: parcel.unit_id } })
    return response.success(serialize(data))
  } catch (error) { console.error('[Parcels] PATCH failed:', error); return response.serverError() }
}
