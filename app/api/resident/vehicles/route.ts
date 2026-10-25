import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'resident' || !session.societyId) return response.unauthorized()
    const body = await request.json()
    const unitId = typeof body.unitId === 'string' ? body.unitId : ''
    const registrationNumber = typeof body.registrationNumber === 'string' ? body.registrationNumber.trim().toUpperCase().replace(/\s+/g, '') : ''
    if (!/^[A-Z0-9-]{4,20}$/.test(registrationNumber)) return response.error('Enter a valid registration number', 400)
    if (!['car', 'bike', 'scooter', 'other'].includes(body.vehicleType)) return response.error('Choose a valid vehicle type', 400)
    const { data: assignment } = await supabaseAdmin.from('unit_assignments').select('id').eq('society_id', session.societyId).eq('unit_id', unitId).eq('resident_id', session.accountId).eq('status', 'active').maybeSingle()
    if (!assignment) return response.error('You do not have active access to this property', 403)
    const { data, error } = await supabaseAdmin.from('vehicles').insert({ society_id: session.societyId, unit_id: unitId, resident_id: session.accountId, registration_number: registrationNumber, vehicle_type: body.vehicleType, make_model: String(body.makeModel || '').trim().slice(0, 100) || null, color: String(body.color || '').trim().slice(0, 50) || null, parking_slot: String(body.parkingSlot || '').trim().slice(0, 50) || null, status: 'active' }).select('id, unit_id, registration_number, vehicle_type, make_model, color, parking_slot, status').single()
    if (error) { if (error.code === '23505') return response.conflict('This vehicle is already registered in the society'); return response.error(error.message, 400) }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'vehicle.created', entity_type: 'vehicle', entity_id: data.id, metadata: { unit_id: unitId, registration_number: registrationNumber } })
    return response.created(data)
  } catch (error) { console.error('[Resident vehicles] POST failed:', error); return response.serverError() }
}
