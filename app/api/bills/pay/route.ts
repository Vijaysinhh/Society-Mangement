import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }
const METHODS = new Set(['upi', 'bank_transfer', 'cash', 'cheque'])
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'resident') return response.unauthorized()
    const body = await request.formData(), billId = clean(body.get('billId')), method = clean(body.get('paymentMethod')), reference = clean(body.get('paymentReference')), proof = body.get('proof')
    if (!billId || !METHODS.has(method) || reference.length < 3) return response.error('Bill, payment method, and reference are required', 400)
    const { data: bill } = await supabaseAdmin.from('maintenance_bills').select('id, unit_id, amount, status').eq('id', billId).eq('society_id', session.societyId).maybeSingle()
    if (!bill) return response.notFound('Bill not found')
    if (bill.status !== 'unpaid') return response.conflict('This bill is not available for payment')
    const { data: assignment } = await supabaseAdmin.from('unit_assignments').select('id').eq('unit_id', bill.unit_id).eq('resident_id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
    if (!assignment) return response.error('You cannot pay this bill', 403)
    let proofPath: string | null = null
    if (proof instanceof File && proof.size > 0) { if (!TYPES[proof.type]) return response.error('Proof must be JPEG, PNG, WebP, or PDF', 400); if (proof.size > 5 * 1024 * 1024) return response.error('Proof must be smaller than 5 MB', 400); proofPath = `${session.societyId}/${crypto.randomUUID()}.${TYPES[proof.type]}`; const { error } = await supabaseAdmin.storage.from('payment-proofs').upload(proofPath, proof, { contentType: proof.type }); if (error) return response.error(`Could not save proof: ${error.message}`, 400) }
    const { data: payment, error } = await supabaseAdmin.from('bill_payments').insert({ society_id: session.societyId, bill_id: billId, resident_id: session.accountId, amount: bill.amount, payment_method: method, payment_reference: reference, proof_path: proofPath }).select('id, amount, payment_method, payment_reference, status, submitted_at').single()
    if (error) { if (proofPath) await supabaseAdmin.storage.from('payment-proofs').remove([proofPath]); return response.error(error.code === '23505' ? 'A payment is already awaiting review' : error.message, error.code === '23505' ? 409 : 400) }
    const { error: billError } = await supabaseAdmin.from('maintenance_bills').update({ status: 'payment_pending' }).eq('id', billId).eq('society_id', session.societyId).eq('status', 'unpaid')
    if (billError) { await supabaseAdmin.from('bill_payments').delete().eq('id', payment.id); if (proofPath) await supabaseAdmin.storage.from('payment-proofs').remove([proofPath]); return response.conflict('Bill status changed. Refresh and try again.') }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'payment.submitted', entity_type: 'bill_payment', entity_id: payment.id, metadata: { bill_id: billId, amount: bill.amount } })
    return response.created(payment)
  } catch (error) { console.error('[Bill payment] POST failed:', error); return response.serverError() }
}
