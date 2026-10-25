import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'resident' || !session.societyId) return response.unauthorized()

    const { id } = await context.params
    const body = await request.json()
    const bedroomCount = Number(body.bedroomCount)
    const floor = body.floor === '' || body.floor === null || body.floor === undefined ? null : Number(body.floor)
    const assignmentRole = typeof body.assignmentRole === 'string' ? body.assignmentRole.trim().toLowerCase() : ''

    if (!Number.isInteger(bedroomCount) || bedroomCount < 1 || bedroomCount > 5) {
      return response.error('Choose a valid BHK value', 400)
    }
    if (floor !== null && (!Number.isInteger(floor) || floor < 0)) {
      return response.error('Enter a valid floor number', 400)
    }
    if (!['owner', 'tenant'].includes(assignmentRole)) return response.error('Choose owner or tenant', 400)

    const { data: assignment, error: findError } = await supabaseAdmin.from('unit_assignments').select('id, assignment_role, start_date, unit_id, units!inner(id, unit_number, unit_type, floor, bedroom_count, lifecycle_status)').eq('id', id).eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active').maybeSingle()
    if (findError) return response.error(findError.message, 400)
    if (!assignment) return response.notFound('Active property assignment not found')
    const unit = Array.isArray(assignment.units) ? assignment.units[0] : assignment.units
    if (unit.unit_type === 'flat' && floor === null) return response.error('Floor number is required for flats', 400)
    const { data: updatedUnit, error: unitError } = await supabaseAdmin.from('units').update({ bedroom_count: bedroomCount, floor: unit.unit_type === 'flat' ? floor : null }).eq('id', assignment.unit_id).eq('society_id', session.societyId).select('id, unit_number, unit_type, floor, bedroom_count, lifecycle_status').single()
    if (unitError) return response.error(unitError.message, 400)
    let roleChangePending = false
    if (assignmentRole !== assignment.assignment_role) {
      const { error: cancelError } = await supabaseAdmin.from('resident_role_change_requests').update({ status: 'cancelled' }).eq('assignment_id', assignment.id).eq('status', 'pending')
      if (cancelError) return response.error(cancelError.message, 400)
      const { error: requestError } = await supabaseAdmin.from('resident_role_change_requests').insert({ society_id: session.societyId, assignment_id: assignment.id, resident_id: session.accountId, requested_role: assignmentRole })
      if (requestError) return response.error(requestError.message, 400)
      roleChangePending = true
    }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'resident.property_updated', entity_type: 'unit_assignment', entity_id: assignment.id, metadata: { unit_id: assignment.unit_id, role_change_requested: roleChangePending, requested_role: assignmentRole } })
    return response.success({ assignment: { id: assignment.id, role: assignment.assignment_role, startDate: assignment.start_date, unit: updatedUnit }, roleChangePending })
  } catch (error) {
    console.error('[Resident properties] PATCH failed:', error)
    return response.serverError()
  }
}
