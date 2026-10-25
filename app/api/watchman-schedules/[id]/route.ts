import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
const overlaps = (a: string, ae: string, b: string, be: string) => { const as = minutes(a), bs = minutes(b); let aend = minutes(ae), bend = minutes(be); if (aend <= as) aend += 1440; if (bend <= bs) bend += 1440; return as < bend && bs < aend }
const displayTime = (value: string) => { const [h, m] = value.slice(0, 5).split(':'); const hour = Number(h); return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}` }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const { id } = await params, body = await request.json(), watchmanId = clean(body.watchmanId), dayIndex = DAYS.indexOf(clean(body.dayOfWeek)), startTime = clean(body.startTime), endTime = clean(body.endTime)
    if (!watchmanId || dayIndex < 0 || !timePattern.test(startTime) || !timePattern.test(endTime)) return response.error('Watchman, day, start time, and end time are required', 400)
    if (startTime === endTime) return response.error('Start and end time cannot be the same', 400)
    const { data: watchman } = await supabaseAdmin.from('watchmen').select('id').eq('id', watchmanId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
    if (!watchman) return response.notFound('Active watchman not found')
    const { data: existing } = await supabaseAdmin.from('watchman_weekly_schedules').select('id, start_time, end_time').eq('society_id', session.societyId).eq('watchman_id', watchmanId).eq('day_of_week', dayIndex).neq('id', id)
    if ((existing || []).some(item => overlaps(startTime, endTime, item.start_time.slice(0, 5), item.end_time.slice(0, 5)))) return response.conflict('This duty overlaps another shift for the watchman')
    const { data, error } = await supabaseAdmin.from('watchman_weekly_schedules').update({ watchman_id: watchmanId, day_of_week: dayIndex, start_time: startTime, end_time: endTime }).eq('id', id).eq('society_id', session.societyId).select('*, watchmen(name, phone)').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Duty schedule not found')
    const linked = Array.isArray(data.watchmen) ? data.watchmen[0] : data.watchmen
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'watchman_schedule.updated', entity_type: 'watchman_weekly_schedule', entity_id: id })
    return response.success({ id: data.id, watchmanId: data.watchman_id, watchmanName: linked?.name || '', watchmanPhone: linked?.phone || '', dayOfWeek: DAYS[data.day_of_week], startTime: displayTime(data.start_time), endTime: displayTime(data.end_time), createdAt: data.created_at })
  } catch (error) { console.error('[Watchman schedule] PATCH failed:', error); return response.serverError() }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const { id } = await params
    const { data, error } = await supabaseAdmin.from('watchman_weekly_schedules').delete().eq('id', id).eq('society_id', session.societyId).select('id').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Duty schedule not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'watchman_schedule.deleted', entity_type: 'watchman_weekly_schedule', entity_id: id })
    return response.success({ id })
  } catch (error) { console.error('[Watchman schedule] DELETE failed:', error); return response.serverError() }
}
