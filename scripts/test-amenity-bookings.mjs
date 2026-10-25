import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')

const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const password = `Amenity-${crypto.randomBytes(8).toString('hex')}`
const ids = { superadmin: '', society: '', otherSociety: '', admin: '', otherAdmin: '', resident: '', unit: '', assignment: '', amenity: '', booking: '', cancelBooking: '' }
const assert = (value, message) => { if (!value) throw new Error(message) }

async function one(table, values) {
  const { data, error } = await db.from(table).insert(values).select().single()
  if (error) throw new Error(`${table} insert: ${error.message}`)
  return data
}
async function login(path, body) {
  const result = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const payload = await result.json().catch(() => ({}))
  const cookie = result.headers.get('set-cookie')?.match(/vms_session=([^;]+)/)?.[1]
  assert(result.ok && cookie, `${path} failed (${result.status}): ${JSON.stringify(payload)}`)
  return cookie
}
async function api(path, method, token, body) {
  const result = await fetch(`${baseUrl}${path}`, { method, headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: result.status, payload: await result.json().catch(() => ({})) }
}
async function cleanupSociety(societyId) {
  if (!societyId) return
  for (const table of ['audit_events', 'amenity_bookings', 'amenities', 'auth_sessions', 'unit_assignments', 'residents', 'units', 'society_admins']) await db.from(table).delete().eq('society_id', societyId)
  await db.from('societies').delete().eq('id', societyId)
}
async function cleanup() {
  await cleanupSociety(ids.society)
  await cleanupSociety(ids.otherSociety)
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(password, 8)
  const superadmin = await one('superadmins', { email: `amenity-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Amenity Test', is_active: true })
  ids.superadmin = superadmin.id
  const society = await one('societies', { name: `Amenity Test ${suffix}`, slug: `amenity-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' })
  ids.society = society.id
  const otherSociety = await one('societies', { name: `Other Amenity ${suffix}`, slug: `other-amenity-${suffix}`, address: 'Other address', city: 'Other city', status: 'active' })
  ids.otherSociety = otherSociety.id
  const admin = await one('society_admins', { society_id: ids.society, username: `amenity_admin_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Amenity Admin', is_primary: true, created_by: ids.superadmin })
  ids.admin = admin.id
  const otherAdmin = await one('society_admins', { society_id: ids.otherSociety, username: `other_amenity_${suffix.replaceAll('-', '_')}`.slice(0, 50), password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Other Admin', is_primary: true, created_by: ids.superadmin })
  ids.otherAdmin = otherAdmin.id
  const resident = await one('residents', { society_id: ids.society, phone: `7${Date.now().toString().slice(-9)}`, email: `amenity-resident-${suffix}@example.invalid`, password_hash: passwordHash, name: 'Amenity Resident', status: 'active' })
  ids.resident = resident.id
  const unit = await one('units', { society_id: ids.society, unit_number: 'AMENITY-101', unit_type: 'flat', floor: 1, bedroom_count: 2, lifecycle_status: 'active', created_by: ids.admin })
  ids.unit = unit.id
  ids.assignment = (await one('unit_assignments', { society_id: ids.society, unit_id: ids.unit, resident_id: ids.resident, assignment_role: 'owner' })).id

  const adminToken = await login('/api/auth/admin-login', { username: admin.username, password })
  const otherAdminToken = await login('/api/auth/admin-login', { username: otherAdmin.username, password })
  const residentToken = await login('/api/auth/resident-login', { societyCode: society.slug, phone: resident.phone, password })
  console.log('PASS real admin and resident login')

  let result = await api('/api/amenities', 'POST', adminToken, { name: 'Integration Hall', description: 'Integration test amenity', timing: '8 AM - 10 PM', price: 1500, capacity: 100, availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] })
  assert(result.status === 201 && result.payload.data.name === 'Integration Hall', `Amenity creation failed: ${JSON.stringify(result.payload)}`)
  ids.amenity = result.payload.data.id
  result = await api('/api/amenities', 'GET', residentToken)
  assert(result.status === 200 && result.payload.data.some(item => item.id === ids.amenity), 'Resident cannot see active amenity')
  console.log('PASS admin amenity creation and resident visibility')

  const date = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  result = await api('/api/amenity-bookings', 'POST', residentToken, { amenityId: ids.amenity, unitId: ids.unit, bookingDate: date, timeSlot: '6 PM - 8 PM' })
  assert(result.status === 201 && result.payload.data.status === 'pending' && result.payload.data.cost === 1500, `Booking creation failed: ${JSON.stringify(result.payload)}`)
  ids.booking = result.payload.data.id
  result = await api('/api/amenity-bookings', 'POST', residentToken, { amenityId: ids.amenity, unitId: ids.unit, bookingDate: date, timeSlot: '6 PM - 8 PM' })
  assert(result.status === 409, `Duplicate slot expected 409, received ${result.status}`)
  console.log('PASS resident booking and duplicate-slot protection')

  result = await api('/api/amenity-bookings', 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.some(item => item.id === ids.booking && item.property === 'AMENITY-101'), 'Admin cannot see resident booking')
  result = await api(`/api/amenity-bookings/${ids.booking}`, 'PATCH', otherAdminToken, { status: 'approved' })
  assert(result.status === 404, `Cross-society update expected 404, received ${result.status}`)
  result = await api(`/api/amenity-bookings/${ids.booking}`, 'PATCH', adminToken, { status: 'approved' })
  assert(result.status === 200 && result.payload.data.status === 'awaiting-payment', `Approval failed: ${JSON.stringify(result.payload)}`)
  result = await api(`/api/amenity-bookings/${ids.booking}`, 'PATCH', adminToken, { paymentStatus: 'paid' })
  assert(result.status === 200 && result.payload.data.status === 'paid', `Payment update failed: ${JSON.stringify(result.payload)}`)
  result = await api('/api/amenity-bookings', 'GET', residentToken)
  assert(result.status === 200 && result.payload.data.some(item => item.id === ids.booking && item.status === 'paid'), 'Resident did not receive paid booking status')
  console.log('PASS approval, payment, resident update, and society isolation')

  result = await api('/api/amenity-bookings', 'POST', residentToken, { amenityId: ids.amenity, unitId: ids.unit, bookingDate: date, timeSlot: '8 PM - 9 PM' })
  assert(result.status === 201, `Second booking creation failed: ${JSON.stringify(result.payload)}`)
  ids.cancelBooking = result.payload.data.id
  result = await api(`/api/amenity-bookings/${ids.cancelBooking}`, 'PATCH', residentToken, { action: 'cancel' })
  assert(result.status === 200 && result.payload.data.status === 'cancelled', 'Resident cancellation failed')
  console.log('PASS resident booking cancellation')

  result = await api(`/api/amenities/${ids.amenity}`, 'PATCH', adminToken, { status: 'inactive' })
  assert(result.status === 200 && result.payload.data.status === 'inactive', 'Amenity deactivation failed')
  result = await api('/api/amenities', 'GET', residentToken)
  assert(result.status === 200 && !result.payload.data.some(item => item.id === ids.amenity), 'Inactive amenity remains visible to resident')
  result = await api(`/api/amenities/${ids.amenity}`, 'DELETE', adminToken)
  assert(result.status === 409, `Amenity with history deletion expected 409, received ${result.status}`)
  console.log('PASS deactivation visibility and booking-history protection')
  console.log('AMENITY_BOOKING_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
