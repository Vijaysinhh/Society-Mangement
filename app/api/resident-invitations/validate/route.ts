import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import * as response from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const token = request.nextUrl.searchParams.get('token') || ''
    if (!token) return response.error('Invitation token is required', 400)
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    const { data, error } = await supabaseAdmin.from('resident_invitations')
      .select('id, expires_at, redeemed_at, revoked_at, invitation_mode, societies!inner(name, slug, status)')
      .eq('token_hash', hash).maybeSingle()
    if (error) return response.error('Resident onboarding is not configured', 503)
    const society = Array.isArray(data?.societies) ? data.societies[0] : data?.societies
    if (!data || data.invitation_mode !== 'society' || data.redeemed_at || data.revoked_at || new Date(data.expires_at) <= new Date() || society?.status !== 'active') {
      return response.error('This invitation is invalid, expired, or already used', 410)
    }
    return response.success({ societyName: society.name, societyCode: society.slug, expiresAt: data.expires_at })
  } catch (error) {
    console.error('[Resident invitations] validation failed:', error)
    return response.serverError()
  }
}
