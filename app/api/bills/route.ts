import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const selection = 'id, unit_id, billing_period, title, amount, due_date, status, paid_at, created_at, units(unit_number), bill_payments(id, resident_id, amount, payment_method, payment_reference, proof_path, status, review_note, submitted_at, reviewed_at, residents(name), society_admins!bill_payments_reviewed_by_fkey(holder_name, post_name))'
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
function serialize(row: any) { const unit = Array.isArray(row.units) ? row.units[0] : row.units; return { id: row.id, unitId: row.unit_id, unitNumber: unit?.unit_number || '', billingPeriod: row.billing_period, title: row.title, amount: Number(row.amount), dueDate: row.due_date, status: row.status, paidAt: row.paid_at, createdAt: row.created_at, payments: (row.bill_payments || []).map((payment: any) => { const resident = Array.isArray(payment.residents) ? payment.residents[0] : payment.residents; const admin = Array.isArray(payment.society_admins) ? payment.society_admins[0] : payment.society_admins; return { id: payment.id, residentId: payment.resident_id, amount: Number(payment.amount), paymentMethod: payment.payment_method, paymentReference: payment.payment_reference, status: payment.status, reviewNote: payment.review_note, submittedAt: payment.submitted_at, reviewedAt: payment.reviewed_at, residentName: resident?.name || '', reviewedByName: admin?.holder_name || admin?.post_name || null, proofUrl: payment.proof_path ? `/api/bills/payments/${payment.id}/proof` : null } }).sort((a: any, b: any) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt)) } }

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['resident', 'society_admin'].includes(session.accountType)) return response.unauthorized()
    let query = supabaseAdmin.from('maintenance_bills').select(selection).eq('society_id', session.societyId).order('billing_period', { ascending: false }).limit(200)
    if (session.accountType === 'resident') { const { data: assignments, error } = await supabaseAdmin.from('unit_assignments').select('unit_id').eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active'); if (error) return response.error(error.message, 400); const unitIds = (assignments || []).map((item) => item.unit_id); if (!unitIds.length) return response.success([]); query = query.in('unit_id', unitIds) }
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    const bills = (data || []).map(serialize)
    if (session.accountType === 'resident') for (const bill of bills) bill.payments = bill.payments.filter((payment: any) => payment.residentId === session.accountId)
    return response.success(bills)
  } catch (error) { console.error('[Bills] GET failed:', error); return response.serverError() }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const body = await request.json(), unitId = clean(body.unitId), period = clean(body.billingPeriod), title = clean(body.title) || 'Monthly maintenance', amount = Number(body.amount), dueDate = clean(body.dueDate), allOccupied = body.allOccupied === true
    if (!/^\d{4}-\d{2}$/.test(period) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !Number.isFinite(amount) || amount <= 0) return response.error('Valid billing month, amount, and due date are required', 400)
    const billingPeriod = `${period}-01`
    let unitIds: string[] = []
    if (allOccupied) { const { data, error } = await supabaseAdmin.from('unit_assignments').select('unit_id').eq('society_id', session.societyId).eq('status', 'active'); if (error) return response.error(error.message, 400); unitIds = [...new Set((data || []).map((item) => item.unit_id))] }
    else if (unitId) { const { data } = await supabaseAdmin.from('unit_assignments').select('id').eq('society_id', session.societyId).eq('unit_id', unitId).eq('status', 'active').limit(1); if (data?.length) unitIds = [unitId] }
    if (!unitIds.length) return response.error('Select an occupied property', 400)
    const { data: existing } = await supabaseAdmin.from('maintenance_bills').select('unit_id').eq('society_id', session.societyId).eq('billing_period', billingPeriod).in('unit_id', unitIds)
    const existingIds = new Set((existing || []).map((item) => item.unit_id)), targets = unitIds.filter((id) => !existingIds.has(id))
    if (!targets.length) return response.conflict('Bills already exist for the selected properties and month')
    const { data, error } = await supabaseAdmin.from('maintenance_bills').insert(targets.map((id) => ({ society_id: session.societyId, unit_id: id, created_by: session.accountId, billing_period: billingPeriod, title, amount, due_date: dueDate }))).select(selection)
    if (error) return response.error(error.message, 400)
    for (const bill of data || []) await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'bill.created', entity_type: 'maintenance_bill', entity_id: bill.id, metadata: { unit_id: bill.unit_id, amount, billing_period: billingPeriod } })
    return response.created({ bills: (data || []).map(serialize), skipped: existingIds.size })
  } catch (error) { console.error('[Bills] POST failed:', error); return response.serverError() }
}
