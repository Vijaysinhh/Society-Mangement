import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function PATCH(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const body = await request.json(), paymentId = typeof body.paymentId === 'string' ? body.paymentId : '', decision = body.decision === 'confirmed' ? 'confirmed' : body.decision === 'rejected' ? 'rejected' : '', note = typeof body.note === 'string' ? body.note.trim() : ''
    if (!paymentId || !decision) return response.error('Payment and decision are required', 400)
    if (decision === 'rejected' && !note) return response.error('A rejection reason is required', 400)
    const { data: payment } = await supabaseAdmin.from('bill_payments').select('id, bill_id, status').eq('id', paymentId).eq('society_id', session.societyId).maybeSingle()
    if (!payment) return response.notFound('Payment not found')
    const { error } = await supabaseAdmin.rpc('review_bill_payment', { p_payment_id: paymentId, p_society_id: session.societyId, p_admin_id: session.accountId, p_decision: decision, p_note: note })
    if (error) return response.conflict(error.message)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: `payment.${decision}`, entity_type: 'bill_payment', entity_id: paymentId, metadata: { bill_id: payment.bill_id, note } })
    return response.success({ paymentId, billId: payment.bill_id, status: decision })
  } catch (error) { console.error('[Payment review] PATCH failed:', error); return response.serverError() }
}
