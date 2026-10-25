import { NextResponse } from 'next/server'
import { comparePassword, hashPassword } from '@/lib/crypto'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    const session = await getRequestSession(request)
    if (!session || !['society_admin', 'resident'].includes(session.accountType)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Current password and a new password of at least 8 characters are required' }, { status: 400 })
    }

    const accountTable = session.accountType === 'resident' ? 'residents' : 'society_admins'
    const { data: account } = await supabaseAdmin
      .from(accountTable)
      .select('password_hash')
      .eq('id', session.accountId)
      .maybeSingle()
    if (!account || !comparePassword(currentPassword, account.password_hash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from(accountTable)
      .update({ password_hash: hashPassword(newPassword), updated_at: new Date().toISOString() })
      .eq('id', session.accountId)
    if (error) throw error

    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: session.accountType, actor_id: session.accountId, action: `${session.accountType}.password_changed`, entity_type: session.accountType, entity_id: session.accountId, metadata: {} })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Change password] Failed:', error)
    return NextResponse.json({ error: 'Could not change password' }, { status: 500 })
  }
}
