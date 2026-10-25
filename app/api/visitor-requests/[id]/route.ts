import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['resident', 'watchman'].includes(session.accountType)) return response.unauthorized()
    const { id } = await params
    const body = await request.json()
    const action = typeof body.action === 'string' ? body.action : ''
    const { data: visitor } = await supabaseAdmin.from('visitor_requests').select('id, unit_id, status').eq('id', id).eq('society_id', session.societyId).maybeSingle()
    if (!visitor) return response.notFound('Visitor request not found')
    const now = new Date().toISOString()
    let updates: Record<string, string | null> = {}
    let auditAction = ''

    if (session.accountType === 'resident') {
      const { data: assignment } = await supabaseAdmin.from('unit_assignments').select('id').eq('unit_id', visitor.unit_id).eq('resident_id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
      if (!assignment) return response.error('You cannot decide visitors for this property', 403)
      if (visitor.status !== 'pending') return response.conflict('This visitor request has already been decided')
      if (action === 'approve') {
        updates = { status: 'approved', decision_by: session.accountId, decision_at: now, denial_reason: null }
        auditAction = 'visitor.approved'
      } else if (action === 'deny') {
        const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
        if (!reason) return response.error('A denial reason is required', 400)
        updates = { status: 'denied', decision_by: session.accountId, decision_at: now, denial_reason: reason }
        auditAction = 'visitor.denied'
      } else return response.error('Invalid resident action', 400)
    } else {
      if (action === 'check_in' && visitor.status === 'approved') {
        updates = { status: 'checked_in', checked_in_at: now }
        auditAction = 'visitor.checked_in'
      } else if (action === 'check_out' && visitor.status === 'checked_in') {
        updates = { status: 'checked_out', checked_out_at: now }
        auditAction = 'visitor.checked_out'
      } else if (action === 'cancel' && visitor.status === 'pending') {
        updates = { status: 'cancelled' }
        auditAction = 'visitor.cancelled'
      } else return response.conflict('That action is not allowed for the current visitor status')
    }

    const { data, error } = await supabaseAdmin.from('visitor_requests').update(updates).eq('id', id).eq('society_id', session.societyId).eq('status', visitor.status).select('id, unit_id, visitor_name, visitor_phone, purpose, status, denial_reason, requested_at, decision_at, checked_in_at, checked_out_at, photo_path, units(unit_number), watchmen(name), residents!visitor_requests_decision_by_fkey(name)').single()
    if (error) return response.conflict('Visitor status changed. Refresh and try again.')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: session.accountType, actor_id: session.accountId, action: auditAction, entity_type: 'visitor_request', entity_id: id, metadata: { unit_id: visitor.unit_id } })
    const unit = Array.isArray(data.units) ? data.units[0] : data.units
    const watchman = Array.isArray(data.watchmen) ? data.watchmen[0] : data.watchmen
    const resident = Array.isArray(data.residents) ? data.residents[0] : data.residents
    return response.success({ id: data.id, visitorName: data.visitor_name, visitorPhone: data.visitor_phone, purpose: data.purpose, status: data.status, unitId: data.unit_id, unitNumber: unit?.unit_number || '', watchmanName: watchman?.name || '', decisionByName: resident?.name || null, denialReason: data.denial_reason, requestedAt: data.requested_at, decisionAt: data.decision_at, checkedInAt: data.checked_in_at, checkedOutAt: data.checked_out_at, photoUrl: data.photo_path ? `/api/visitor-requests/${data.id}/photo` : null })
  } catch (error) {
    console.error('[Visitor request] PATCH failed:', error)
    return response.serverError()
  }
}
