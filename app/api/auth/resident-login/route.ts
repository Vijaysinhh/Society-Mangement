import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { comparePassword } from '@/lib/crypto'
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
    const body = await request.json()
    const societyCode = String(body.societyCode || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim()
    const password = String(body.password || '')
    if (!societyCode || !phone || !password) return NextResponse.json({ error: 'Society code, phone, and password are required' }, { status: 400 })

    const { data } = await supabaseAdmin.from('residents')
      .select('id, society_id, phone, name, password_hash, status, societies!inner(slug, status)')
      .eq('phone', phone).eq('societies.slug', societyCode).maybeSingle()
    const society = Array.isArray(data?.societies) ? data.societies[0] : data?.societies
    if (!data || data.status !== 'active' || society?.status !== 'active' || !comparePassword(password, data.password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const session = await createSession('resident', data.id, data.society_id)
    await supabaseAdmin.from('residents').update({ last_login: new Date().toISOString() }).eq('id', data.id)
    const result = NextResponse.json({ success: true, resident: { id: data.id, societyId: data.society_id, name: data.name, phone: data.phone } })
    result.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt))
    return result
  } catch (error) {
    console.error('[Resident login] POST failed:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
