import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request); if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await context.params, body = await request.json()
    const { data, error } = await supabaseAdmin.rpc('admin_transfer_resident', { p_society_id: session.societyId, p_admin_id: session.accountId, p_resident_id: id, p_assignment_id: String(body.assignmentId || ''), p_target_unit_id: String(body.targetUnitId || ''), p_assignment_role: String(body.assignmentRole || '') })
    if (error) { if (error.code === '23505') return response.conflict(error.message); if (error.code === 'P0002') return response.notFound(error.message); return response.error(error.message, 400) }
    return response.success(data)
  } catch (error) { console.error('[Resident transfer] POST failed:', error); return response.serverError() }
}
