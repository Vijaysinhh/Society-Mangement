import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')

const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const password = `Duty-${crypto.randomBytes(8).toString('hex')}`
const username = `duty_${suffix.replaceAll('-', '_')}`.slice(0, 50)
const ids = { superadmin: '', society: '', admin: '', watchman: '', unit: '', visitor: '' }

const assert = (value, message) => { if (!value) throw new Error(message) }
async function one(table, values) {
  const { data, error } = await db.from(table).insert(values).select().single()
  if (error) throw new Error(`${table} insert: ${error.message}`)
  return data
}
async function login(path, body) {
  const result = await fetch(`${baseUrl}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  const payload = await result.json().catch(() => ({}))
  const cookie = result.headers.get('set-cookie')?.match(/vms_session=([^;]+)/)?.[1]
  assert(result.ok && cookie, `${path} failed (${result.status}): ${JSON.stringify(payload)}`)
  return cookie
}
async function api(path, method, token, body) {
  const result = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: result.status, payload: await result.json().catch(() => ({})) }
}
async function cleanup() {
  if (ids.society) {
    for (const table of ['audit_events', 'visitor_requests', 'watchman_duty_logs', 'auth_sessions', 'watchman_shifts', 'watchmen', 'units', 'society_admins']) {
      await db.from(table).delete().eq('society_id', ids.society)
    }
    await db.from('societies').delete().eq('id', ids.society)
  }
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(password, 8)
  const superadmin = await one('superadmins', { email: `duty-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Duty Test', is_active: true })
  ids.superadmin = superadmin.id
  const society = await one('societies', { name: `Duty Test ${suffix}`, slug: `duty-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' })
  ids.society = society.id
  const admin = await one('society_admins', { society_id: ids.society, username: `admin_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Duty Admin', is_primary: true, created_by: ids.superadmin })
  ids.admin = admin.id
  const watchman = await one('watchmen', { society_id: ids.society, username, password_hash: passwordHash, name: 'Duty Watchman', phone: `9${Date.now().toString().slice(-9)}`, assigned_area: 'Main Gate', status: 'active', created_by: ids.admin })
  ids.watchman = watchman.id
  await one('watchman_shifts', { society_id: ids.society, watchman_id: ids.watchman, shift_start: '08:00', shift_end: '20:00' })
  const unit = await one('units', { society_id: ids.society, unit_number: 'DUTY-101', unit_type: 'flat', floor: 1, bedroom_count: 2, lifecycle_status: 'active', created_by: ids.admin })
  ids.unit = unit.id
  const visitor = await one('visitor_requests', { society_id: ids.society, unit_id: ids.unit, watchman_id: ids.watchman, visitor_name: 'Duty Visitor', visitor_phone: '9999999999', purpose: 'Integration test', status: 'pending' })
  ids.visitor = visitor.id

  const watchmanToken = await login('/api/auth/watchman-login', { username, password })
  const adminToken = await login('/api/auth/admin-login', { username: admin.username, password })
  console.log('PASS real admin and watchman login')

  let result = await api('/api/watchmen/duty', 'GET', watchmanToken)
  assert(result.status === 200 && result.payload.data.length === 0, 'Initial duty history should be empty')

  result = await api('/api/watchmen/duty', 'POST', watchmanToken)
  assert(result.status === 201 && result.payload.data.status === 'on_duty', `Clock-in failed: ${JSON.stringify(result.payload)}`)
  const logId = result.payload.data.id
  result = await api('/api/watchmen', 'GET', adminToken)
  const summary = result.payload.data?.find((item) => item.id === ids.watchman)
  assert(result.status === 200 && summary?.isOnDuty === true && summary?.visitorsLogged === 1, `Watchman summary is incorrect: ${JSON.stringify(result.payload)}`)
  console.log('PASS watchman clock-in')
  console.log('PASS current-duty indicator and visitor count')

  result = await api('/api/watchmen/duty', 'POST', watchmanToken)
  assert(result.status === 409, `Duplicate clock-in expected 409, received ${result.status}`)
  console.log('PASS duplicate clock-in protection')

  result = await api('/api/watchmen/duty', 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.some((log) => log.id === logId && log.watchmanId === ids.watchman), 'Admin logbook did not receive active duty record')
  result = await api('/api/watchmen/duty', 'POST', adminToken)
  assert(result.status === 401, `Admin clock-in must be rejected, received ${result.status}`)
  console.log('PASS admin logbook and role authorization')

  result = await api('/api/watchmen/duty', 'PATCH', watchmanToken)
  assert(result.status === 200 && result.payload.data.status === 'completed' && result.payload.data.checkOutAt, `Clock-out failed: ${JSON.stringify(result.payload)}`)
  result = await api(`/api/watchmen/duty?watchmanId=${ids.watchman}`, 'GET', adminToken)
  assert(result.status === 200 && result.payload.data[0].status === 'completed', 'Completed duty record missing from admin logbook')
  console.log('PASS watchman clock-out and completed admin history')

  result = await api('/api/watchmen/duty', 'PATCH', watchmanToken)
  assert(result.status === 404, `Second clock-out expected 404, received ${result.status}`)
  console.log('PASS duplicate clock-out protection')

  result = await api(`/api/watchmen/${ids.watchman}`, 'PATCH', adminToken, { status: 'suspended' })
  assert(result.status === 200 && result.payload.data.status === 'suspended', 'Watchman suspension failed')
  result = await api('/api/watchman/context', 'GET', watchmanToken)
  assert(result.status === 401, `Suspended watchman session should be revoked, received ${result.status}`)
  result = await api(`/api/watchmen/${ids.watchman}`, 'PATCH', adminToken, { status: 'active', shiftStart: '09:00', shiftEnd: '21:00' })
  assert(result.status === 200 && result.payload.data.status === 'active' && result.payload.data.shiftStart === '09:00', 'Reactivation or shift update failed')
  console.log('PASS suspension, session revocation, reactivation, and shift editing')

  const secondToken = await login('/api/auth/watchman-login', { username, password })
  const newPassword = `Reset-${crypto.randomBytes(8).toString('hex')}`
  result = await api(`/api/watchmen/${ids.watchman}`, 'PATCH', adminToken, { password: newPassword })
  assert(result.status === 200, `Password reset failed: ${JSON.stringify(result.payload)}`)
  result = await api('/api/watchman/context', 'GET', secondToken)
  assert(result.status === 401, `Password reset should revoke the old session, received ${result.status}`)
  await login('/api/auth/watchman-login', { username, password: newPassword })
  console.log('PASS password reset, old-session revocation, and new-password login')
  console.log('WATCHMAN_DUTY_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
