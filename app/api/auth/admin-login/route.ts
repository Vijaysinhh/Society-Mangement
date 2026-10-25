import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { comparePassword } from '@/lib/crypto'
import { createSession, getSessionByToken, revokeSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
    }

    const normalizedUsername = username.toLowerCase()
    const { data: adminData, error: lookupError } = await supabaseAdmin
      .from('society_admins')
      .select('id, society_id, username, post_name, holder_name, password_hash, status, societies(status)')
      .ilike('username', normalizedUsername)
      .maybeSingle()

    if (lookupError || !adminData) {
      if (lookupError) console.error('[API] Admin lookup failed:', lookupError.message)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Compare password with stored hash using bcrypt
    const society = Array.isArray(adminData.societies) ? adminData.societies[0] : adminData.societies
    const passwordMatch = comparePassword(password, adminData.password_hash)
    if (!passwordMatch || adminData.status !== 'active' || society?.status !== 'active') {
      const reason = !passwordMatch
        ? 'password_mismatch'
        : adminData.status !== 'active'
          ? 'account_inactive'
          : 'society_inactive'
      console.warn('[Society admin login] rejected', {
        username: normalizedUsername,
        adminId: adminData.id,
        reason,
      })
      await supabaseAdmin.from('audit_events').insert({
        society_id: adminData.society_id,
        actor_type: 'system',
        actor_id: null,
        action: 'auth.login_failed',
        entity_type: 'society_admin',
        entity_id: adminData.id,
        metadata: { reason },
      })
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const session = await createSession('society_admin', adminData.id, adminData.society_id)
    const verifiedSession = await getSessionByToken(session.token)
    if (!verifiedSession || verifiedSession.accountType !== 'society_admin' || verifiedSession.accountId !== adminData.id) {
      await revokeSession(session.token)
      console.error('[Society admin login] Created session failed immediate verification', { adminId: adminData.id })
      return NextResponse.json({ error: 'Could not establish a login session. Please try again.' }, { status: 500 })
    }

    await supabaseAdmin.from('society_admins').update({ last_login: new Date().toISOString() }).eq('id', adminData.id)
    const { password_hash, societies, ...safeAdminData } = adminData
    const response = NextResponse.json(
      {
        success: true,
        admin: safeAdminData,
      },
      { status: 200 }
    )
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt))
    console.log('[Society admin login] successful', { adminId: adminData.id, societyId: adminData.society_id })
    return response
  } catch (error) {
    console.error('[API] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
