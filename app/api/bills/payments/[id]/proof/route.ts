import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { if (!supabaseAdmin) return response.error('Database not configured', 503); const session = await getRequestSession(request); if (!session?.societyId || !['resident', 'society_admin'].includes(session.accountType)) return response.unauthorized(); const { id } = await params; let query = supabaseAdmin.from('bill_payments').select('resident_id, proof_path').eq('id', id).eq('society_id', session.societyId); if (session.accountType === 'resident') query = query.eq('resident_id', session.accountId); const { data: payment } = await query.maybeSingle(); if (!payment?.proof_path) return response.notFound('Payment proof not found'); const { data: proof, error } = await supabaseAdmin.storage.from('payment-proofs').download(payment.proof_path); if (error || !proof) return response.notFound('Payment proof not found'); return new Response(proof, { headers: { 'Content-Type': proof.type || 'application/octet-stream', 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' } }) } catch (error) { console.error('[Payment proof] GET failed:', error); return response.serverError() }
}
