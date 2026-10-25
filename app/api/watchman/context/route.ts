import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'watchman' || !session.societyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabaseAdmin.from('watchmen').select('id, username, name, phone, address, assigned_area, status, societies(id, name, slug), watchman_shifts(shift_start, shift_end, status)').eq('id', session.accountId).eq('society_id', session.societyId).single()
    if (error || !data) return NextResponse.json({ error: 'Watchman account not found' }, { status: 404 })
    const society = Array.isArray(data.societies) ? data.societies[0] : data.societies
    const shifts = Array.isArray(data.watchman_shifts) ? data.watchman_shifts : []
    const shift = shifts.find((item) => item.status === 'active')
    return NextResponse.json({ watchman: { id: data.id, username: data.username, name: data.name, phone: data.phone, address: data.address, assignedArea: data.assigned_area, status: data.status, shiftStart: shift?.shift_start?.slice(0, 5) || '', shiftEnd: shift?.shift_end?.slice(0, 5) || '' }, society })
  } catch (error) {
    console.error('[Watchman context] failed:', error)
    return NextResponse.json({ error: 'Unable to load watchman account' }, { status: 500 })
  }
}
