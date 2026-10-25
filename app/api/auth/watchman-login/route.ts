import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { comparePassword } from '@/lib/crypto'
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!username || !password) return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    if (!supabaseAdmin) return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
    const { data: watchman, error } = await supabaseAdmin.from('watchmen').select('id, society_id, username, name, password_hash, status, societies(name, slug, status)').eq('username', username).maybeSingle()
    const society = Array.isArray(watchman?.societies) ? watchman.societies[0] : watchman?.societies
    const passwordMatches = watchman ? comparePassword(password, watchman.password_hash) : false
    if (error || !watchman || !passwordMatches || watchman.status !== 'active' || society?.status !== 'active') {
      console.warn('[Watchman login] rejected', {
        username,
        accountFound: Boolean(watchman),
        passwordMatches,
        accountActive: watchman?.status === 'active',
        societyActive: society?.status === 'active',
      })
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }
    const session = await createSession('watchman', watchman.id, watchman.society_id)
    await supabaseAdmin.from('watchmen').update({ last_login: new Date().toISOString() }).eq('id', watchman.id)
    const result = NextResponse.json({ success: true, watchman: { id: watchman.id, username: watchman.username, name: watchman.name, societyId: watchman.society_id, societyName: society?.name } })
    result.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt))
    return result
  } catch (error) {
    console.error('[Watchman login] failed:', error)
    return NextResponse.json({ error: 'Unable to sign in right now' }, { status: 500 })
  }
}
