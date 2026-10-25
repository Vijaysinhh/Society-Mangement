import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await context.params; const body = await request.json(); const decision = String(body.decision || '')
    if (!['approved', 'rejected'].includes(decision)) return response.error('Choose approve or reject', 400)
    const { data, error } = await supabaseAdmin.rpc('review_resident_role_change', {
      p_society_id: session.societyId, p_request_id: id, p_admin_id: session.accountId,
      p_decision: decision, p_note: String(body.note || '').trim(),
    })
    if (error) {
      if (error.code === '23505') return response.conflict('This property already has an active owner')
      if (error.code === 'P0002') return response.notFound(error.message)
      return response.error(error.message, 400)
    }
    return response.success(data)
  } catch (error) { console.error('[Role request] PATCH failed:', error); return response.serverError() }
}
