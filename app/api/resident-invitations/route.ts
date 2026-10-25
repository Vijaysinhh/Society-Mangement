import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function tokenHash(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.error('Unauthorized', 401)

    const token = crypto.randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const { data, error } = await supabaseAdmin.from('resident_invitations').insert({
      society_id: session.societyId,
      unit_id: null,
      assignment_role: null,
      invitation_mode: 'society',
      token_hash: tokenHash(token),
      expires_at: expiresAt.toISOString(),
      created_by: session.accountId,
    }).select('id, created_at, expires_at').single()

    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({
      society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId,
      action: 'resident_invitation.created', entity_type: 'resident_invitation', entity_id: data.id,
      metadata: { expires_at: data.expires_at, invitation_mode: 'society' },
    })

    return response.created({
      id: data.id,
      link: `${request.nextUrl.origin}/resident-signup?token=${encodeURIComponent(token)}`,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    })
  } catch (error) {
    console.error('[Resident invitations] POST failed:', error)
    return response.serverError()
  }
}
