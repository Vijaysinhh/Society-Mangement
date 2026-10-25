import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id: residentId } = await context.params, body = await request.json()
    const assignmentId = String(body.assignmentId || ''), role = String(body.assignmentRole || '')
    if (!['owner', 'tenant'].includes(role)) return response.error('Choose owner or tenant', 400)
    const { data, error } = await supabaseAdmin.from('unit_assignments').update({ assignment_role: role }).eq('id', assignmentId).eq('resident_id', residentId).eq('society_id', session.societyId).eq('status', 'active').select('id, unit_id, assignment_role').single()
    if (error) return error.code === '23505' ? response.conflict('This property already has an active owner') : response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'resident.assignment_role_updated', entity_type: 'unit_assignment', entity_id: assignmentId, metadata: { resident_id: residentId, role } })
    return response.success(data)
  } catch (error) { console.error('[Resident assignment] PATCH failed:', error); return response.serverError() }
}
