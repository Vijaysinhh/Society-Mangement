import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

async function admin(request: Request) { const session = await getRequestSession(request); return session?.accountType === 'society_admin' && session.societyId ? session : null }

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await admin(request); if (!session) return response.unauthorized()
    const { id } = await context.params
    const { data: resident, error } = await supabaseAdmin.from('residents').select(`id, name, phone, email, status, created_at, last_login, unit_assignments(id, unit_id, assignment_role, start_date, end_date, status, units(id, unit_number, unit_type, floor, bedroom_count, lifecycle_status))`).eq('id', id).eq('society_id', session.societyId).maybeSingle()
    if (error) return response.error(error.message, 400); if (!resident) return response.notFound('Resident not found')
    const unitIds = [...new Set((resident.unit_assignments || []).map((item: any) => item.unit_id))]
    const [vehicles, issues, visitors, bills, payments] = await Promise.all([
      supabaseAdmin.from('vehicles').select('id, unit_id, registration_number, vehicle_type, make_model, color, parking_slot, status').eq('society_id', session.societyId).eq('resident_id', id).order('created_at', { ascending: false }),
      supabaseAdmin.from('issues').select('id, unit_id, title, category, priority, status, created_at, resolved_at').eq('society_id', session.societyId).eq('resident_id', id).order('created_at', { ascending: false }).limit(50),
      unitIds.length ? supabaseAdmin.from('visitor_requests').select('id, unit_id, visitor_name, purpose, status, requested_at').eq('society_id', session.societyId).in('unit_id', unitIds).order('requested_at', { ascending: false }).limit(50) : Promise.resolve({ data: [], error: null }),
      unitIds.length ? supabaseAdmin.from('maintenance_bills').select('id, unit_id, title, amount, due_date, status, billing_period, paid_at').eq('society_id', session.societyId).in('unit_id', unitIds).order('billing_period', { ascending: false }).limit(50) : Promise.resolve({ data: [], error: null }),
      supabaseAdmin.from('bill_payments').select('id, bill_id, amount, payment_method, payment_reference, status, submitted_at, reviewed_at').eq('society_id', session.societyId).eq('resident_id', id).order('submitted_at', { ascending: false }).limit(50),
    ])
    const firstError = [vehicles.error, issues.error, visitors.error, bills.error, payments.error].find(Boolean)
    if (firstError) return response.error(firstError.message, 400)
    return response.success({ resident, vehicles: vehicles.data || [], issues: issues.data || [], visitors: visitors.data || [], bills: bills.data || [], payments: payments.data || [] })
  } catch (error) { console.error('[Resident detail] GET failed:', error); return response.serverError() }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await admin(request); if (!session) return response.unauthorized()
    const { id } = await context.params, body = await request.json()
    const name = String(body.name || '').trim(), phone = String(body.phone || '').trim(), email = String(body.email || '').trim().toLowerCase(), status = String(body.status || '')
    if (!name || phone.length < 6 || phone.length > 20) return response.error('Valid name and phone are required', 400)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.error('Enter a valid email address', 400)
    if (!['active', 'suspended', 'deactivated'].includes(status)) return response.error('Invalid account status', 400)
    if (status === 'active') {
      const { count } = await supabaseAdmin.from('unit_assignments').select('id', { count: 'exact', head: true }).eq('society_id', session.societyId).eq('resident_id', id).eq('status', 'active')
      if (!count) return response.conflict('Restore a property assignment before reactivating this resident')
    }
    const { data, error } = await supabaseAdmin.from('residents').update({ name, phone, email: email || null, status }).eq('id', id).eq('society_id', session.societyId).select('id, name, phone, email, status').single()
    if (error) return error.code === '23505' ? response.conflict('Phone or email already belongs to another resident') : response.error(error.message, 400)
    if (status !== 'active') await supabaseAdmin.from('auth_sessions').update({ revoked_at: new Date().toISOString() }).eq('account_type', 'resident').eq('account_id', id).is('revoked_at', null)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'resident.updated', entity_type: 'resident', entity_id: id, metadata: { status } })
    return response.success(data)
  } catch (error) { console.error('[Resident] PATCH failed:', error); return response.serverError() }
}
