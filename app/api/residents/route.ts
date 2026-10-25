import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const url = new URL(request.url), search = (url.searchParams.get('search') || '').trim(), status = url.searchParams.get('status') || 'all'
    let query = supabaseAdmin.from('residents').select(`
      id, name, phone, email, status, created_at, last_login,
      unit_assignments(id, assignment_role, start_date, end_date, status, units(id, unit_number, unit_type, floor, bedroom_count, lifecycle_status))
    `).eq('society_id', session.societyId).order('created_at', { ascending: false }).limit(500)
    if (status !== 'all') query = query.eq('status', status)
    if (search) { const safe = search.replaceAll(',', ''); query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`) }
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success(data || [])
  } catch (error) { console.error('[Residents] GET failed:', error); return response.serverError() }
}
