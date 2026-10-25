import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')

const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const password = `Schedule-${crypto.randomBytes(8).toString('hex')}`
const ids = { superadmin: '', society: '', otherSociety: '', admin: '', otherAdmin: '', watchman: '', otherWatchman: '', schedule: '' }
const assert = (value, message) => { if (!value) throw new Error(message) }

async function one(table, values) {
  const { data, error } = await db.from(table).insert(values).select().single()
  if (error) throw new Error(`${table} insert: ${error.message}`)
  return data
}
async function login(username) {
  const result = await fetch(`${baseUrl}/api/auth/admin-login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) })
  const payload = await result.json().catch(() => ({}))
  const cookie = result.headers.get('set-cookie')?.match(/vms_session=([^;]+)/)?.[1]
  assert(result.ok && cookie, `Admin login failed (${result.status}): ${JSON.stringify(payload)}`)
  return cookie
}
async function api(path, method, token, body) {
  const result = await fetch(`${baseUrl}${path}`, { method, headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: result.status, payload: await result.json().catch(() => ({})) }
}
async function cleanupSociety(societyId) {
  if (!societyId) return
  for (const table of ['audit_events', 'watchman_weekly_schedules', 'auth_sessions', 'watchman_shifts', 'watchmen', 'society_admins']) await db.from(table).delete().eq('society_id', societyId)
  await db.from('societies').delete().eq('id', societyId)
}
async function cleanup() {
  await cleanupSociety(ids.society)
  await cleanupSociety(ids.otherSociety)
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(password, 8)
  const superadmin = await one('superadmins', { email: `schedule-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Schedule Test', is_active: true })
  ids.superadmin = superadmin.id
  const society = await one('societies', { name: `Schedule Test ${suffix}`, slug: `schedule-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' })
  ids.society = society.id
  const otherSociety = await one('societies', { name: `Other Schedule ${suffix}`, slug: `other-schedule-${suffix}`, address: 'Other address', city: 'Other city', status: 'active' })
  ids.otherSociety = otherSociety.id
  const admin = await one('society_admins', { society_id: ids.society, username: `schedule_admin_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Schedule Admin', is_primary: true, created_by: ids.superadmin })
  ids.admin = admin.id
  const otherAdmin = await one('society_admins', { society_id: ids.otherSociety, username: `other_schedule_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Other Admin', is_primary: true, created_by: ids.superadmin })
  ids.otherAdmin = otherAdmin.id
  const watchman = await one('watchmen', { society_id: ids.society, username: `schedule_watchman_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, name: 'Schedule Watchman', phone: `6${Date.now().toString().slice(-9)}`, assigned_area: 'Main Gate', status: 'active', created_by: ids.admin })
  ids.watchman = watchman.id
  await one('watchman_shifts', { society_id: ids.society, watchman_id: ids.watchman, shift_start: '08:00', shift_end: '20:00' })
  const otherWatchman = await one('watchmen', { society_id: ids.otherSociety, username: `other_watchman_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, name: 'Other Watchman', phone: `5${Date.now().toString().slice(-9)}`, assigned_area: 'Other Gate', status: 'active', created_by: ids.otherAdmin })
  ids.otherWatchman = otherWatchman.id
  await one('watchman_shifts', { society_id: ids.otherSociety, watchman_id: ids.otherWatchman, shift_start: '08:00', shift_end: '20:00' })

  const adminToken = await login(admin.username)
  const otherAdminToken = await login(otherAdmin.username)
  console.log('PASS real society-admin login')

  let result = await api('/api/watchman-schedules', 'POST', adminToken, { watchmanId: ids.watchman, dayOfWeek: 'Monday', startTime: '06:00', endTime: '14:00' })
  assert(result.status === 201 && result.payload.data.watchmanName === 'Schedule Watchman' && result.payload.data.startTime === '6:00 AM', `Schedule creation failed: ${JSON.stringify(result.payload)}`)
  ids.schedule = result.payload.data.id
  result = await api('/api/watchman-schedules', 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.some(item => item.id === ids.schedule && item.watchmanPhone === watchman.phone), 'Created schedule missing from admin list')
  console.log('PASS schedule creation and persistent listing')

  result = await api('/api/watchman-schedules', 'POST', adminToken, { watchmanId: ids.watchman, dayOfWeek: 'Monday', startTime: '12:00', endTime: '16:00' })
  assert(result.status === 409, `Overlapping schedule expected 409, received ${result.status}`)
  result = await api('/api/watchman-schedules', 'POST', adminToken, { watchmanId: ids.otherWatchman, dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '12:00' })
  assert(result.status === 404, `Cross-society watchman expected 404, received ${result.status}`)
  console.log('PASS overlap prevention and watchman society isolation')

  result = await api(`/api/watchman-schedules/${ids.schedule}`, 'PATCH', otherAdminToken, { watchmanId: ids.otherWatchman, dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '12:00' })
  assert(result.status === 404, `Cross-society schedule update expected 404, received ${result.status}`)
  result = await api(`/api/watchman-schedules/${ids.schedule}`, 'PATCH', adminToken, { watchmanId: ids.watchman, dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '22:00' })
  assert(result.status === 200 && result.payload.data.dayOfWeek === 'Wednesday' && result.payload.data.startTime === '2:00 PM', `Schedule update failed: ${JSON.stringify(result.payload)}`)
  console.log('PASS schedule editing and cross-society update protection')

  result = await api(`/api/watchman-schedules/${ids.schedule}`, 'DELETE', otherAdminToken)
  assert(result.status === 404, `Cross-society schedule deletion expected 404, received ${result.status}`)
  result = await api(`/api/watchman-schedules/${ids.schedule}`, 'DELETE', adminToken)
  assert(result.status === 200, `Schedule deletion failed: ${JSON.stringify(result.payload)}`)
  result = await api('/api/watchman-schedules', 'GET', adminToken)
  assert(result.status === 200 && !result.payload.data.some(item => item.id === ids.schedule), 'Deleted schedule remains in admin list')
  console.log('PASS schedule deletion and society isolation')
  console.log('WATCHMAN_SCHEDULE_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
