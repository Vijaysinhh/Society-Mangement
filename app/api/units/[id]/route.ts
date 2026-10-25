import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

async function admin(request: Request) {
  const session = await getRequestSession(request)
  return session?.accountType === 'society_admin' && session.societyId ? session : null
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await admin(request); if (!session) return response.unauthorized()
    const { id } = await context.params; const body = await request.json()
    const unitNumber = String(body.unitNumber || '').trim(), unitType = String(body.unitType || '')
    const bedroomCount = Number(body.bedroomCount), status = String(body.status || '')
    const floor = unitType === 'flat' ? Number(body.floor) : null
    if (!unitNumber) return response.error('Unit number is required', 400)
    if (!['flat', 'villa', 'bungalow'].includes(unitType)) return response.error('Invalid property type', 400)
    if (!Number.isInteger(bedroomCount) || bedroomCount < 1 || bedroomCount > 5) return response.error('Choose a valid BHK value', 400)
    if (unitType === 'flat' && (!Number.isInteger(floor) || Number(floor) < 0)) return response.error('Floor is required for flats', 400)
    if (!['active', 'maintenance', 'inactive'].includes(status)) return response.error('Invalid property status', 400)
    if (status === 'inactive') {
      const { count } = await supabaseAdmin.from('unit_assignments').select('id', { count: 'exact', head: true }).eq('society_id', session.societyId).eq('unit_id', id).eq('status', 'active')
      if (count) return response.conflict('Move out all active residents before archiving this property')
    }
    const { data, error } = await supabaseAdmin.from('units').update({ unit_number: unitNumber, unit_type: unitType, bedroom_count: bedroomCount, floor, lifecycle_status: status }).eq('id', id).eq('society_id', session.societyId).select('id, unit_number, unit_type, floor, bedroom_count, lifecycle_status').single()
    if (error) return error.code === '23505' ? response.conflict('A unit with this number already exists') : response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: status === 'inactive' ? 'unit.archived' : 'unit.updated', entity_type: 'unit', entity_id: id, metadata: data })
    return response.success(data)
  } catch (error) { console.error('[Unit] PATCH failed:', error); return response.serverError() }
}
