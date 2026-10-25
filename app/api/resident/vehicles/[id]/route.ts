import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

async function residentSession(request: Request) {
  const session = await getRequestSession(request)
  return session?.accountType === 'resident' && session.societyId ? session : null
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await residentSession(request); if (!session) return response.unauthorized()
    const { id } = await context.params; const body = await request.json()
    const registrationNumber = typeof body.registrationNumber === 'string' ? body.registrationNumber.trim().toUpperCase().replace(/\s+/g, '') : ''
    if (!/^[A-Z0-9-]{4,20}$/.test(registrationNumber)) return response.error('Enter a valid registration number', 400)
    if (!['car', 'bike', 'scooter', 'other'].includes(body.vehicleType)) return response.error('Choose a valid vehicle type', 400)
    const { data, error } = await supabaseAdmin.from('vehicles').update({ registration_number: registrationNumber, vehicle_type: body.vehicleType, make_model: String(body.makeModel || '').trim().slice(0, 100) || null, color: String(body.color || '').trim().slice(0, 50) || null, parking_slot: String(body.parkingSlot || '').trim().slice(0, 50) || null }).eq('id', id).eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active').select('id, unit_id, registration_number, vehicle_type, make_model, color, parking_slot, status').maybeSingle()
    if (error) { if (error.code === '23505') return response.conflict('This vehicle is already registered in the society'); return response.error(error.message, 400) }
    if (!data) return response.notFound('Active vehicle not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'vehicle.updated', entity_type: 'vehicle', entity_id: id, metadata: { unit_id: data.unit_id, registration_number: data.registration_number } })
    return response.success(data)
  } catch (error) { console.error('[Resident vehicles] PATCH failed:', error); return response.serverError() }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await residentSession(request); if (!session) return response.unauthorized()
    const { id } = await context.params
    const { data, error } = await supabaseAdmin.from('vehicles').update({ status: 'inactive' }).eq('id', id).eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active').select('id, unit_id, registration_number').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Active vehicle not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'vehicle.deactivated', entity_type: 'vehicle', entity_id: id, metadata: { unit_id: data.unit_id, registration_number: data.registration_number } })
    return response.success({ id })
  } catch (error) { console.error('[Resident vehicles] DELETE failed:', error); return response.serverError() }
}
