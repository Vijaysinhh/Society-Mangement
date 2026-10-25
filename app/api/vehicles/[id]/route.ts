import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const allowedTypes = ['car', 'bike', 'scooter', 'other']

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await context.params
    const body = await request.json()
    const registrationNumber = typeof body.registrationNumber === 'string' ? body.registrationNumber.trim().toUpperCase().replace(/\s+/g, '') : ''
    const vehicleType = typeof body.vehicleType === 'string' ? body.vehicleType : ''
    if (!/^[A-Z0-9-]{4,20}$/.test(registrationNumber)) return response.error('Enter a valid registration number', 400)
    if (!allowedTypes.includes(vehicleType)) return response.error('Choose a valid vehicle type', 400)

    const { data, error } = await supabaseAdmin.from('vehicles').update({
      registration_number: registrationNumber, vehicle_type: vehicleType,
      make_model: String(body.makeModel || '').trim().slice(0, 100) || null,
      color: String(body.color || '').trim().slice(0, 50) || null,
      parking_slot: String(body.parkingSlot || '').trim().slice(0, 50) || null,
    }).eq('id', id).eq('society_id', session.societyId).eq('status', 'active')
      .select('id, unit_id, resident_id, registration_number, vehicle_type, make_model, color, parking_slot, status').maybeSingle()
    if (error) {
      if (error.code === '23505') return response.conflict('This vehicle is already registered in the society')
      return response.error(error.message, 400)
    }
    if (!data) return response.notFound('Active vehicle not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'vehicle.updated', entity_type: 'vehicle', entity_id: id, metadata: { unit_id: data.unit_id, registration_number: data.registration_number } })
    return response.success(data)
  } catch (error) {
    console.error('[Vehicles] PATCH failed:', error)
    return response.serverError()
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await context.params
    const { data: vehicle, error: findError } = await supabaseAdmin.from('vehicles')
      .select('id, unit_id, registration_number, status').eq('id', id).eq('society_id', session.societyId).maybeSingle()
    if (findError) return response.error(findError.message, 400)
    if (!vehicle || vehicle.status !== 'active') return response.notFound('Active vehicle not found')

    const { error } = await supabaseAdmin.from('vehicles').update({ status: 'inactive' })
      .eq('id', id).eq('society_id', session.societyId).eq('status', 'active')
    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'vehicle.deactivated', entity_type: 'vehicle', entity_id: id, metadata: { unit_id: vehicle.unit_id, registration_number: vehicle.registration_number } })
    return response.success({ id, unitId: vehicle.unit_id })
  } catch (error) {
    console.error('[Vehicles] DELETE failed:', error)
    return response.serverError()
  }
}
