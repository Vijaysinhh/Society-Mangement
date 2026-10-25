import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { data, error } = await supabaseAdmin.from('resident_role_change_requests').select('id, assignment_id, resident_id, requested_role, status, created_at, residents(name), unit_assignments(unit_id, assignment_role, units(unit_number))').eq('society_id', session.societyId).eq('status', 'pending').order('created_at')
    if (error) return response.error(error.message, 400)
    return response.success(data || [])
  } catch (error) { console.error('[Role requests] GET failed:', error); return response.serverError() }
}
