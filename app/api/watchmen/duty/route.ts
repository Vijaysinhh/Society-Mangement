import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function mapDutyLog(log: any) {
  const started = new Date(log.check_in_at)
  const ended = log.check_out_at ? new Date(log.check_out_at) : null
  const durationMinutes = Math.max(0, Math.round(((ended?.getTime() ?? Date.now()) - started.getTime()) / 60000))
  return {
    id: log.id,
    watchmanId: log.watchman_id,
    watchmanName: log.watchmen?.name || '',
    date: log.duty_date,
    checkInAt: log.check_in_at,
    checkOutAt: log.check_out_at,
    durationMinutes,
    status: log.status,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'watchman'].includes(session.accountType)) return response.unauthorized()

    const requestedWatchmanId = request.nextUrl.searchParams.get('watchmanId')
    if (session.accountType === 'watchman' && requestedWatchmanId && requestedWatchmanId !== session.accountId) {
      return response.error('You can only view your own duty history', 403)
    }

    let query = supabaseAdmin
      .from('watchman_duty_logs')
      .select('id, watchman_id, duty_date, check_in_at, check_out_at, status, watchmen(name)')
      .eq('society_id', session.societyId)
      .order('check_in_at', { ascending: false })
      .limit(100)
    const watchmanId = session.accountType === 'watchman' ? session.accountId : requestedWatchmanId
    if (watchmanId) query = query.eq('watchman_id', watchmanId)

    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(mapDutyLog))
  } catch (error) {
    console.error('[Watchman duty] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'watchman' || !session.societyId) return response.unauthorized()

    const { data: existing } = await supabaseAdmin.from('watchman_duty_logs').select('id')
      .eq('watchman_id', session.accountId).eq('status', 'on_duty').maybeSingle()
    if (existing) return response.conflict('You are already clocked in')

    const now = new Date()
    const { data, error } = await supabaseAdmin.from('watchman_duty_logs').insert({
      society_id: session.societyId,
      watchman_id: session.accountId,
      duty_date: now.toISOString().slice(0, 10),
      check_in_at: now.toISOString(),
    }).select('id, watchman_id, duty_date, check_in_at, check_out_at, status, watchmen(name)').single()
    if (error) return response.error(error.message, 400)

    await supabaseAdmin.from('audit_events').insert({
      society_id: session.societyId, actor_type: 'watchman', actor_id: session.accountId,
      action: 'watchman.clocked_in', entity_type: 'watchman_duty_log', entity_id: data.id,
    })
    return response.created(mapDutyLog(data))
  } catch (error) {
    console.error('[Watchman duty] POST failed:', error)
    return response.serverError()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'watchman' || !session.societyId) return response.unauthorized()

    const { data: active } = await supabaseAdmin.from('watchman_duty_logs').select('id')
      .eq('society_id', session.societyId).eq('watchman_id', session.accountId)
      .eq('status', 'on_duty').maybeSingle()
    if (!active) return response.notFound('No active duty session found')

    const { data, error } = await supabaseAdmin.from('watchman_duty_logs')
      .update({ check_out_at: new Date().toISOString(), status: 'completed' })
      .eq('id', active.id).eq('society_id', session.societyId)
      .select('id, watchman_id, duty_date, check_in_at, check_out_at, status, watchmen(name)').single()
    if (error) return response.error(error.message, 400)

    await supabaseAdmin.from('audit_events').insert({
      society_id: session.societyId, actor_type: 'watchman', actor_id: session.accountId,
      action: 'watchman.clocked_out', entity_type: 'watchman_duty_log', entity_id: data.id,
    })
    return response.success(mapDutyLog(data))
  } catch (error) {
    console.error('[Watchman duty] PATCH failed:', error)
    return response.serverError()
  }
}
