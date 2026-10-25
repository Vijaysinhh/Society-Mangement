import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')

const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const password = `Notify-${crypto.randomBytes(8).toString('hex')}`
const ids = { superadmin: '', society: '', otherSociety: '', admin: '', secondAdmin: '', otherAdmin: '', resident: '', units: [], assignments: [], bills: [], issue: '' }
const assert = (value, message) => { if (!value) throw new Error(message) }
const day = offset => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10) }
const monthStart = offset => { const date = new Date(); date.setMonth(date.getMonth() + offset, 1); return date.toISOString().slice(0, 10) }

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
async function api(method, token, body) {
  const result = await fetch(`${baseUrl}/api/society-admin/notifications`, { method, headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: result.status, payload: await result.json().catch(() => ({})) }
}
async function cleanupSociety(societyId) {
  if (!societyId) return
  for (const table of ['society_admin_notification_reads', 'audit_events', 'issues', 'maintenance_bills', 'auth_sessions', 'unit_assignments', 'residents', 'units', 'society_admins']) await db.from(table).delete().eq('society_id', societyId)
  await db.from('societies').delete().eq('id', societyId)
}
async function cleanup() {
  await cleanupSociety(ids.society)
  await cleanupSociety(ids.otherSociety)
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(password, 8)
  ids.superadmin = (await one('superadmins', { email: `notify-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Notification Test', is_active: true })).id
  const society = await one('societies', { name: `Notification Test ${suffix}`, slug: `notification-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' }); ids.society = society.id
  const otherSociety = await one('societies', { name: `Other Notification ${suffix}`, slug: `other-notification-${suffix}`, address: 'Other address', city: 'Other city', status: 'active' }); ids.otherSociety = otherSociety.id
  const admin = await one('society_admins', { society_id: ids.society, username: `notify_admin_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Notification Admin', is_primary: true, created_by: ids.superadmin }); ids.admin = admin.id
  const secondAdmin = await one('society_admins', { society_id: ids.society, username: `notify_second_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Treasurer', holder_name: 'Second Admin', is_primary: false, created_by: ids.superadmin }); ids.secondAdmin = secondAdmin.id
  const otherAdmin = await one('society_admins', { society_id: ids.otherSociety, username: `notify_other_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Other Admin', is_primary: true, created_by: ids.superadmin }); ids.otherAdmin = otherAdmin.id
  const resident = await one('residents', { society_id: ids.society, phone: `4${Date.now().toString().slice(-9)}`, email: `notify-resident-${suffix}@example.invalid`, password_hash: passwordHash, name: 'Notification Resident', status: 'active' }); ids.resident = resident.id
  for (let index = 1; index <= 4; index++) {
    const unit = await one('units', { society_id: ids.society, unit_number: `NOTIFY-${index}`, unit_type: 'flat', floor: index, bedroom_count: 2, lifecycle_status: 'active', created_by: ids.admin }); ids.units.push(unit.id)
    ids.assignments.push((await one('unit_assignments', { society_id: ids.society, unit_id: unit.id, resident_id: ids.resident, assignment_role: 'owner' })).id)
  }
  const billDefinitions = [
    { unit_id: ids.units[0], billing_period: monthStart(-2), title: 'Overdue maintenance', amount: 2100, due_date: day(-20), status: 'unpaid' },
    { unit_id: ids.units[1], billing_period: monthStart(-1), title: 'Payment verification', amount: 2200, due_date: day(-3), status: 'payment_pending' },
    { unit_id: ids.units[2], billing_period: monthStart(0), title: 'Upcoming maintenance', amount: 2300, due_date: day(3), status: 'unpaid' },
    { unit_id: ids.units[3], billing_period: monthStart(-1), title: 'Paid maintenance', amount: 2400, due_date: day(-5), status: 'paid', paid_at: new Date().toISOString() },
  ]
  for (const bill of billDefinitions) ids.bills.push((await one('maintenance_bills', { society_id: ids.society, created_by: ids.admin, ...bill })).id)
  ids.issue = (await one('issues', { society_id: ids.society, unit_id: ids.units[0], resident_id: ids.resident, category: 'security', title: 'Urgent gate light failure', description: 'The main gate security light is completely unavailable.', priority: 'urgent', status: 'open' })).id

  const adminToken = await login(admin.username), secondAdminToken = await login(secondAdmin.username), otherAdminToken = await login(otherAdmin.username)
  console.log('PASS real society-admin logins')

  let result = await api('GET', adminToken)
  assert(result.status === 200, `Notification load failed: ${JSON.stringify(result.payload)}`)
  const alerts = result.payload.data.alerts
  assert(alerts.some(item => item.id === `bill:${ids.bills[0]}:overdue` && item.daysOverdue >= 19), 'Overdue bill notification missing')
  assert(alerts.some(item => item.id === `bill:${ids.bills[1]}:payment_pending`), 'Payment-verification notification missing')
  assert(alerts.some(item => item.id === `bill:${ids.bills[2]}:upcoming`), 'Upcoming bill notification missing')
  assert(alerts.some(item => item.id === `bill:${ids.bills[3]}:paid`), 'Paid bill notification missing')
  assert(alerts.some(item => item.id === `issue:${ids.issue}:open` && item.severity === 'critical'), 'Urgent issue notification missing')
  assert(result.payload.data.unreadCount === 5, `Expected 5 unread notifications, got ${result.payload.data.unreadCount}`)
  console.log('PASS live bill, payment, and urgent-issue notifications')

  const firstId = alerts[0].id
  result = await api('PATCH', adminToken, { id: firstId })
  assert(result.status === 200 && result.payload.data.readIds.includes(firstId), 'Mark-one-as-read failed')
  result = await api('GET', adminToken)
  assert(result.status === 200 && result.payload.data.unreadCount === 4 && result.payload.data.alerts.find(item => item.id === firstId)?.read, 'Single read state did not persist')
  result = await api('GET', secondAdminToken)
  assert(result.status === 200 && result.payload.data.unreadCount === 5, 'Read state leaked to another admin')
  console.log('PASS persistent per-admin read state')

  result = await api('PATCH', adminToken, { all: true })
  assert(result.status === 200 && result.payload.data.readIds.length === 5, 'Mark-all-as-read failed')
  result = await api('GET', adminToken)
  assert(result.status === 200 && result.payload.data.unreadCount === 0, 'Mark-all state did not persist')
  result = await api('GET', otherAdminToken)
  assert(result.status === 200 && result.payload.data.alerts.length === 0, 'Cross-society notification data leaked')
  console.log('PASS mark-all persistence and society isolation')
  console.log('ADMIN_NOTIFICATION_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
