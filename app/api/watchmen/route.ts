import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()

    const { data, error } = await supabaseAdmin
      .from('watchmen')
      .select('id, username, name, phone, address, assigned_area, status, created_at, watchman_shifts(id, shift_start, shift_end, effective_from, status)')
      .eq('society_id', session.societyId)
      .order('created_at', { ascending: false })
    if (error) return response.error(error.message, 400)

    const watchmanIds = (data || []).map((watchman) => watchman.id)
    const visitorCounts = new Map<string, number>()
    const activeDutyByWatchman = new Map<string, string>()
    if (watchmanIds.length) {
      const [{ data: visitors, error: visitorError }, { data: activeDuty, error: dutyError }] = await Promise.all([
        supabaseAdmin.from('visitor_requests').select('watchman_id').eq('society_id', session.societyId).in('watchman_id', watchmanIds),
        supabaseAdmin.from('watchman_duty_logs').select('watchman_id, check_in_at').eq('society_id', session.societyId).eq('status', 'on_duty').in('watchman_id', watchmanIds),
      ])
      if (visitorError) return response.error(visitorError.message, 400)
      if (dutyError) return response.error(dutyError.message, 400)
      for (const visitor of visitors || []) visitorCounts.set(visitor.watchman_id, (visitorCounts.get(visitor.watchman_id) || 0) + 1)
      for (const duty of activeDuty || []) activeDutyByWatchman.set(duty.watchman_id, duty.check_in_at)
    }

    return response.success((data || []).map((watchman) => {
      const shifts = Array.isArray(watchman.watchman_shifts) ? watchman.watchman_shifts : []
      const activeShift = shifts.find((shift) => shift.status === 'active')
      return {
        id: watchman.id, username: watchman.username, name: watchman.name, phone: watchman.phone,
        address: watchman.address, assignedArea: watchman.assigned_area, status: watchman.status,
        shiftStart: activeShift?.shift_start?.slice(0, 5) || '',
        shiftEnd: activeShift?.shift_end?.slice(0, 5) || '', createdAt: watchman.created_at,
        visitorsLogged: visitorCounts.get(watchman.id) || 0,
        isOnDuty: activeDutyByWatchman.has(watchman.id),
        currentDutyStartedAt: activeDutyByWatchman.get(watchman.id) || null,
      }
    }))
  } catch (error) {
    console.error('[Watchmen] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  let createdWatchmanId: string | null = null
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()

    const body = await request.json()
    const name = clean(body.name)
    const phone = clean(body.phone)
    const username = clean(body.username).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''
    const address = clean(body.address)
    const assignedArea = clean(body.assignedArea)
    const shiftStart = clean(body.shiftStart) || '18:00'
    const shiftEnd = clean(body.shiftEnd) || '06:00'

    if (!name || !phone || !username || !password) return response.error('Name, phone, username, and password are required', 400)
    if (!USERNAME_PATTERN.test(username)) return response.error('Username must be 3-50 characters using letters, numbers, _ or -', 400)
    if (password.length < 8) return response.error('Password must be at least 8 characters', 400)
    if (password !== password.trim()) return response.error('Password cannot start or end with spaces', 400)
    if (!/^\d{10,15}$/.test(phone.replace(/[+\s-]/g, ''))) return response.error('Enter a valid phone number', 400)
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(shiftStart) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shiftEnd)) return response.error('Enter valid shift times', 400)

    const { data: existing } = await supabaseAdmin.from('watchmen').select('id').ilike('username', username).maybeSingle()
    if (existing) return response.conflict('That username is already in use')

    const { data: watchman, error: watchmanError } = await supabaseAdmin
      .from('watchmen')
      .insert({ society_id: session.societyId, username, password_hash: hashPassword(password), name, phone, address, assigned_area: assignedArea, status: 'active', created_by: session.accountId })
      .select('id, username, name, phone, address, assigned_area, status, created_at')
      .single()
    if (watchmanError || !watchman) {
      if (watchmanError?.code === '23505') return response.conflict('That username is already in use')
      return response.error(watchmanError?.message || 'Could not create watchman', 400)
    }
    createdWatchmanId = watchman.id

    const { error: shiftError } = await supabaseAdmin.from('watchman_shifts').insert({ society_id: session.societyId, watchman_id: watchman.id, shift_start: shiftStart, shift_end: shiftEnd })
    if (shiftError) {
      await supabaseAdmin.from('watchmen').delete().eq('id', watchman.id).eq('society_id', session.societyId)
      createdWatchmanId = null
      return response.error(shiftError.message, 400)
    }

    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'watchman.created', entity_type: 'watchman', entity_id: watchman.id, metadata: { username, assigned_area: assignedArea, shift_start: shiftStart, shift_end: shiftEnd } })
    return response.created({ id: watchman.id, username: watchman.username, name: watchman.name, phone: watchman.phone, address: watchman.address, assignedArea: watchman.assigned_area, status: watchman.status, shiftStart, shiftEnd, createdAt: watchman.created_at })
  } catch (error) {
    if (createdWatchmanId && supabaseAdmin) await supabaseAdmin.from('watchmen').delete().eq('id', createdWatchmanId)
    console.error('[Watchmen] POST failed:', error)
    return response.serverError()
  }
}
