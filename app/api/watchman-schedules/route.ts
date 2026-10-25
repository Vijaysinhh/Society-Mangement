import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
  const aStart = minutes(startA), bStart = minutes(startB)
  let aEnd = minutes(endA), bEnd = minutes(endB)
  if (aEnd <= aStart) aEnd += 1440
  if (bEnd <= bStart) bEnd += 1440
  return aStart < bEnd && bStart < aEnd
}
const displayTime = (value: string) => {
  const [hourText, minute] = value.slice(0, 5).split(':'); const hour = Number(hourText)
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`
}
function serialize(row: any) {
  const watchman = Array.isArray(row.watchmen) ? row.watchmen[0] : row.watchmen
  return { id: row.id, watchmanId: row.watchman_id, watchmanName: watchman?.name || '', watchmanPhone: watchman?.phone || '', dayOfWeek: DAYS[row.day_of_week], startTime: displayTime(row.start_time), endTime: displayTime(row.end_time), createdAt: row.created_at }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const { data, error } = await supabaseAdmin.from('watchman_weekly_schedules').select('*, watchmen(name, phone)').eq('society_id', session.societyId).order('day_of_week').order('start_time')
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) { console.error('[Watchman schedules] GET failed:', error); return response.serverError() }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const body = await request.json(), watchmanId = clean(body.watchmanId), dayIndex = DAYS.indexOf(clean(body.dayOfWeek)), startTime = clean(body.startTime), endTime = clean(body.endTime)
    if (!watchmanId || dayIndex < 0 || !timePattern.test(startTime) || !timePattern.test(endTime)) return response.error('Watchman, day, start time, and end time are required', 400)
    if (startTime === endTime) return response.error('Start and end time cannot be the same', 400)
    const { data: watchman } = await supabaseAdmin.from('watchmen').select('id').eq('id', watchmanId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
    if (!watchman) return response.notFound('Active watchman not found')
    const { data: existing } = await supabaseAdmin.from('watchman_weekly_schedules').select('start_time, end_time').eq('society_id', session.societyId).eq('watchman_id', watchmanId).eq('day_of_week', dayIndex)
    if ((existing || []).some(item => overlaps(startTime, endTime, item.start_time.slice(0, 5), item.end_time.slice(0, 5)))) return response.conflict('This duty overlaps another shift for the watchman')
    const { data, error } = await supabaseAdmin.from('watchman_weekly_schedules').insert({ society_id: session.societyId, watchman_id: watchmanId, day_of_week: dayIndex, start_time: startTime, end_time: endTime, created_by: session.accountId }).select('*, watchmen(name, phone)').single()
    if (error) { if (error.code === '23505') return response.conflict('This duty already exists'); return response.error(error.message, 400) }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'watchman_schedule.created', entity_type: 'watchman_weekly_schedule', entity_id: data.id })
    return response.created(serialize(data))
  } catch (error) { console.error('[Watchman schedules] POST failed:', error); return response.serverError() }
}
