import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function indiaDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()

    const { id: residentId } = await context.params
    const body = await request.json().catch(() => ({}))
    const unitId = typeof body.unitId === 'string' ? body.unitId : ''
    if (!unitId) return response.error('Property is required', 400)

    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('unit_assignments')
      .select('id, assignment_role, start_date')
      .eq('society_id', session.societyId)
      .eq('unit_id', unitId)
      .eq('resident_id', residentId)
      .eq('status', 'active')
      .maybeSingle()
    if (assignmentError) return response.error(assignmentError.message, 400)
    if (!assignment) return response.notFound('Active resident access was not found for this property')

    const endedAt = indiaDate()
    const { error: endError } = await supabaseAdmin.from('unit_assignments')
      .update({ status: 'ended', end_date: endedAt })
      .eq('id', assignment.id).eq('society_id', session.societyId).eq('status', 'active')
    if (endError) return response.error(endError.message, 400)

    const { count, error: countError } = await supabaseAdmin.from('unit_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('society_id', session.societyId).eq('resident_id', residentId).eq('status', 'active')
    if (countError) return response.error(countError.message, 400)

    const accountDeactivated = (count || 0) === 0
    if (accountDeactivated) {
      const { error: residentError } = await supabaseAdmin.from('residents')
        .update({ status: 'deactivated' })
        .eq('id', residentId).eq('society_id', session.societyId).eq('status', 'active')
      if (residentError) {
        await supabaseAdmin.from('unit_assignments').update({ status: 'active', end_date: null }).eq('id', assignment.id)
        return response.error(residentError.message, 400)
      }
      await supabaseAdmin.from('auth_sessions').update({ revoked_at: new Date().toISOString() })
        .eq('account_type', 'resident').eq('account_id', residentId).is('revoked_at', null)
    }

    const { error: vehicleError } = await supabaseAdmin.from('vehicles')
      .update({ status: 'inactive' })
      .eq('society_id', session.societyId).eq('unit_id', unitId).eq('resident_id', residentId).eq('status', 'active')
    if (vehicleError) return response.error(vehicleError.message, 400)

    await supabaseAdmin.from('audit_events').insert({
      society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId,
      action: 'resident.access_revoked', entity_type: 'resident', entity_id: residentId,
      metadata: { unit_id: unitId, assignment_id: assignment.id, assignment_role: assignment.assignment_role, account_deactivated: accountDeactivated, vehicles_deactivated: true },
    })

    return response.success({ residentId, unitId, endedAt, accountDeactivated })
  } catch (error) {
    console.error('[Resident access] DELETE failed:', error)
    return response.serverError()
  }
}
