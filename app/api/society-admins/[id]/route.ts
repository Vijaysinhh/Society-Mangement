import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'superadmin') return response.error('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()
    const { data: existing } = await supabaseAdmin
      .from('society_admins')
      .select('id, society_id, is_primary, status')
      .eq('id', id)
      .maybeSingle()
    if (!existing) return response.error('Society administrator not found', 404)

    const updates: Record<string, unknown> = {}
    if (typeof body.holderName === 'string') updates.holder_name = body.holderName.trim()
    if (typeof body.postName === 'string' && body.postName.trim()) updates.post_name = body.postName.trim()
    if (typeof body.phone === 'string') updates.phone = body.phone.trim()
    if (body.status !== undefined) {
      if (!['active', 'suspended', 'deactivated'].includes(body.status)) return response.error('Invalid admin status', 400)
      if (existing.is_primary && body.status === 'deactivated') return response.error('Transfer the primary role before deactivating this account', 409)
      updates.status = body.status
    }
    if (body.newPassword !== undefined) {
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) return response.error('Password must be at least 8 characters', 400)
      updates.password_hash = hashPassword(body.newPassword)
    }
    if (Object.keys(updates).length === 0) return response.error('No supported changes provided', 400)

    const { data, error } = await supabaseAdmin
      .from('society_admins')
      .update(updates)
      .eq('id', id)
      .select('id, society_id, username, post_name, holder_name, phone, is_primary, status, last_login, created_at')
      .single()
    if (error) return response.error('Could not update society administrator', 400)

    if (body.status && body.status !== 'active') {
      await supabaseAdmin.from('auth_sessions').update({ revoked_at: new Date().toISOString() })
        .eq('account_type', 'society_admin').eq('account_id', id).is('revoked_at', null)
    }
    await supabaseAdmin.from('audit_events').insert({
      society_id: existing.society_id,
      actor_type: 'superadmin',
      actor_id: session.accountId,
      action: body.newPassword ? 'society_admin.password_reset' : 'society_admin.updated',
      entity_type: 'society_admin',
      entity_id: id,
      metadata: { changed_fields: Object.keys(updates).filter((key) => key !== 'password_hash') },
    })
    return response.success(data)
  } catch (error) {
    console.error('[Society admin] PATCH failed:', error)
    return response.serverError()
  }
}
