import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await params
    const body = await request.json()
    const { data: existing } = await supabaseAdmin.from('watchmen').select('id').eq('id', id).eq('society_id', session.societyId).maybeSingle()
    if (!existing) return response.notFound('Watchman not found')

    const updates: Record<string, string> = {}
    if (body.name !== undefined) { const name = clean(body.name); if (!name) return response.error('Name is required', 400); updates.name = name }
    if (body.phone !== undefined) { const phone = clean(body.phone); if (!/^\d{10,15}$/.test(phone.replace(/[+\s-]/g, ''))) return response.error('Enter a valid phone number', 400); updates.phone = phone }
    if (body.address !== undefined) updates.address = clean(body.address)
    if (body.assignedArea !== undefined) updates.assigned_area = clean(body.assignedArea)
    if (body.status !== undefined) { if (!['active', 'suspended', 'deactivated'].includes(body.status)) return response.error('Invalid status', 400); updates.status = body.status }
    if (body.password) {
      if (typeof body.password !== 'string' || body.password.length < 8) return response.error('Password must be at least 8 characters', 400)
      if (body.password !== body.password.trim()) return response.error('Password cannot start or end with spaces', 400)
      updates.password_hash = hashPassword(body.password)
    }

    const { data: watchman, error: updateError } = await supabaseAdmin.from('watchmen').update(updates).eq('id', id).eq('society_id', session.societyId).select('id, username, name, phone, address, assigned_area, status, created_at').single()
    if (updateError) return response.error(updateError.message, 400)

    let shiftStart = clean(body.shiftStart)
    let shiftEnd = clean(body.shiftEnd)
    if (shiftStart && shiftEnd) {
      const { data: activeShift } = await supabaseAdmin.from('watchman_shifts').select('id').eq('watchman_id', id).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
      const shiftResult = activeShift
        ? await supabaseAdmin.from('watchman_shifts').update({ shift_start: shiftStart, shift_end: shiftEnd }).eq('id', activeShift.id)
        : await supabaseAdmin.from('watchman_shifts').insert({ society_id: session.societyId, watchman_id: id, shift_start: shiftStart, shift_end: shiftEnd })
      if (shiftResult.error) return response.error(shiftResult.error.message, 400)
    } else {
      const { data: activeShift } = await supabaseAdmin.from('watchman_shifts').select('shift_start, shift_end').eq('watchman_id', id).eq('status', 'active').maybeSingle()
      shiftStart = activeShift?.shift_start?.slice(0, 5) || ''
      shiftEnd = activeShift?.shift_end?.slice(0, 5) || ''
    }

    if (updates.status && updates.status !== 'active') await supabaseAdmin.from('auth_sessions').update({ revoked_at: new Date().toISOString() }).eq('account_type', 'watchman').eq('account_id', id).is('revoked_at', null)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'watchman.updated', entity_type: 'watchman', entity_id: id, metadata: { changed_fields: Object.keys(updates).filter((field) => field !== 'password_hash'), password_reset: Boolean(body.password) } })
    return response.success({ id: watchman.id, username: watchman.username, name: watchman.name, phone: watchman.phone, address: watchman.address, assignedArea: watchman.assigned_area, status: watchman.status, shiftStart, shiftEnd, createdAt: watchman.created_at })
  } catch (error) {
    console.error('[Watchmen] PATCH failed:', error)
    return response.serverError()
  }
}
