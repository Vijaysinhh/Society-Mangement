import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/db'

export const SESSION_COOKIE = 'vms_session'
const SESSION_TTL_SECONDS = 60 * 60 * 12

export type AccountType = 'superadmin' | 'society_admin' | 'resident' | 'watchman'

export interface AppSession {
  id: string
  accountType: AccountType
  accountId: string
  societyId: string | null
  expiresAt: string
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createSession(
  accountType: AccountType,
  accountId: string,
  societyId: string | null = null,
) {
  if (!supabaseAdmin) throw new Error('Database not configured')

  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
  const { error } = await supabaseAdmin.from('auth_sessions').insert({
    token_hash: hashToken(token),
    account_type: accountType,
    account_id: accountId,
    society_id: societyId,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw error
  return { token, expiresAt }
}

export async function getSessionByToken(token?: string | null): Promise<AppSession | null> {
  if (!token || !supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('auth_sessions')
    .select('id, account_type, account_id, society_id, expires_at')
    .eq('token_hash', hashToken(token))
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null

  if (data.account_type === 'superadmin') {
    const { data: account } = await supabaseAdmin
      .from('superadmins')
      .select('id, is_active')
      .eq('id', data.account_id)
      .eq('is_active', true)
      .maybeSingle()
    if (!account) return null
  }

  if (data.account_type === 'society_admin') {
    const { data: account } = await supabaseAdmin
      .from('society_admins')
      .select('id, status, societies(status)')
      .eq('id', data.account_id)
      .eq('status', 'active')
      .maybeSingle()
    const society = Array.isArray(account?.societies) ? account.societies[0] : account?.societies
    if (!account || society?.status !== 'active') return null
  }

  if (data.account_type === 'resident') {
    const { data: account } = await supabaseAdmin
      .from('residents')
      .select('id, status, societies(status)')
      .eq('id', data.account_id)
      .eq('status', 'active')
      .maybeSingle()
    const society = Array.isArray(account?.societies) ? account.societies[0] : account?.societies
    if (!account || society?.status !== 'active') return null
  }

  if (data.account_type === 'watchman') {
    const { data: account } = await supabaseAdmin
      .from('watchmen')
      .select('id, status, societies(status)')
      .eq('id', data.account_id)
      .eq('status', 'active')
      .maybeSingle()
    const society = Array.isArray(account?.societies) ? account.societies[0] : account?.societies
    if (!account || society?.status !== 'active') return null
  }

  return {
    id: data.id,
    accountType: data.account_type as AccountType,
    accountId: data.account_id,
    societyId: data.society_id,
    expiresAt: data.expires_at,
  }
}

export async function getRequestSession(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  return getSessionByToken(token)
}

export async function revokeSession(token?: string | null) {
  if (!token || !supabaseAdmin) return
  await supabaseAdmin
    .from('auth_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', hashToken(token))
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  }
}

