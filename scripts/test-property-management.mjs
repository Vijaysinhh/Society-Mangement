import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')
const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const ids = { superadmin: '', society: '', admin: '', resident: '', unit: '', assignment: '', vehicle: '', bill: '', bulkUnits: [] }
const startedAt = new Date().toISOString()

function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex') }
function assert(value, message) { if (!value) throw new Error(message) }
async function one(table, values) {
  const { data, error } = await db.from(table).insert(values).select().single()
  if (error) throw new Error(`${table} insert: ${error.message}`)
  return data
}
async function api(path, method, token, body) {
  const response = await fetch(`${baseUrl}${path}`, { method, headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const payload = await response.json().catch(() => ({}))
  return { status: response.status, payload }
}
async function session(type, accountId) {
  const token = crypto.randomBytes(32).toString('base64url')
  await one('auth_sessions', { token_hash: tokenHash(token), account_type: type, account_id: accountId, society_id: ids.society, expires_at: new Date(Date.now() + 3600000).toISOString() })
  return token
}
async function cleanup() {
  if (!ids.society) {
    if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
    return
  }
  await db.from('audit_events').delete().eq('society_id', ids.society).gte('created_at', startedAt)
  await db.from('resident_role_change_requests').delete().eq('society_id', ids.society)
  await db.from('bill_payments').delete().eq('society_id', ids.society)
  await db.from('maintenance_bills').delete().eq('society_id', ids.society)
  await db.from('vehicles').delete().eq('society_id', ids.society)
  await db.from('unit_assignments').delete().eq('society_id', ids.society)
  await db.from('resident_invitations').delete().eq('society_id', ids.society)
  await db.from('auth_sessions').delete().eq('society_id', ids.society)
  await db.from('residents').delete().eq('society_id', ids.society)
  await db.from('units').delete().eq('society_id', ids.society)
  await db.from('society_admins').delete().eq('society_id', ids.society)
  await db.from('audit_events').delete().eq('society_id', ids.society)
  await db.from('societies').delete().eq('id', ids.society)
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(crypto.randomBytes(16).toString('hex'), 8)
  const superadmin = await one('superadmins', { email: `property-test-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Property Integration Test', is_active: true })
  ids.superadmin = superadmin.id
  const society = await one('societies', { name: `Property Test ${suffix}`, slug: `property-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' })
  ids.society = society.id
  const admin = await one('society_admins', { society_id: ids.society, username: `test_${suffix}`.replaceAll('-', '_').slice(0, 50), password_hash: passwordHash, post_name: 'Test Secretary', holder_name: 'Integration Test', is_primary: true, created_by: superadmin.id })
  ids.admin = admin.id
  const unit = await one('units', { society_id: ids.society, unit_number: 'TEST-A-101', unit_type: 'flat', floor: 1, bedroom_count: 2, lifecycle_status: 'active', created_by: ids.admin })
  ids.unit = unit.id
  const resident = await one('residents', { society_id: ids.society, phone: `9${Date.now().toString().slice(-9)}`, password_hash: passwordHash, name: 'Property Test Resident', status: 'active' })
  ids.resident = resident.id
  const assignment = await one('unit_assignments', { society_id: ids.society, unit_id: ids.unit, resident_id: ids.resident, assignment_role: 'tenant' })
  ids.assignment = assignment.id
  const vehicle = await one('vehicles', { society_id: ids.society, unit_id: ids.unit, resident_id: ids.resident, registration_number: `TST${Date.now().toString().slice(-7)}`, vehicle_type: 'car', status: 'active' })
  ids.vehicle = vehicle.id
  const bill = await one('maintenance_bills', { society_id: ids.society, unit_id: ids.unit, created_by: ids.admin, billing_period: '2026-09-01', title: 'Integration test bill', amount: 1250, due_date: '2026-09-10', status: 'unpaid' })
  ids.bill = bill.id
  const adminToken = await session('society_admin', ids.admin)
  const residentToken = await session('resident', ids.resident)

  let result = await api('/api/units', 'GET', adminToken)
  assert(result.status === 200, `GET units expected 200, received ${result.status}: ${JSON.stringify(result.payload)}`)
  const listed = result.payload.data.find((item) => item.id === ids.unit)
  assert(listed?.maintenance_bills?.length === 1, 'Unit billing relation was not returned')
  console.log('PASS property list with live billing')

  result = await api(`/api/units/${ids.unit}`, 'PATCH', adminToken, { unitNumber: 'TEST-A-101', unitType: 'flat', floor: 2, bedroomCount: 3, status: 'active' })
  assert(result.status === 200 && result.payload.data.floor === 2 && result.payload.data.bedroom_count === 3, 'Admin property edit failed')
  console.log('PASS admin property editing')

  result = await api(`/api/resident/properties/${ids.assignment}`, 'PATCH', residentToken, { bedroomCount: 4, floor: 3, assignmentRole: 'owner' })
  assert(result.status === 200 && result.payload.data.roleChangePending === true, `Resident role request failed: ${JSON.stringify(result.payload)}`)
  console.log('PASS resident property edit and role request')

  result = await api('/api/property-role-requests', 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.length === 1, 'Admin pending role request list failed')
  const requestId = result.payload.data[0].id
  result = await api(`/api/property-role-requests/${requestId}`, 'PATCH', adminToken, { decision: 'approved', note: 'Integration test' })
  assert(result.status === 200, `Role approval failed: ${JSON.stringify(result.payload)}`)
  const { data: approvedAssignment } = await db.from('unit_assignments').select('assignment_role').eq('id', ids.assignment).single()
  assert(approvedAssignment?.assignment_role === 'owner', 'Approved role was not persisted')
  console.log('PASS transactional role approval')

  result = await api(`/api/units/${ids.unit}`, 'PATCH', adminToken, { unitNumber: 'TEST-A-101', unitType: 'flat', floor: 3, bedroomCount: 4, status: 'maintenance' })
  assert(result.status === 200 && result.payload.data.lifecycle_status === 'maintenance', 'Maintenance status update failed')
  result = await api(`/api/units/${ids.unit}`, 'PATCH', adminToken, { unitNumber: 'TEST-A-101', unitType: 'flat', floor: 3, bedroomCount: 4, status: 'inactive' })
  assert(result.status === 409, `Occupied archive guard expected 409, received ${result.status}`)
  console.log('PASS maintenance status and occupied archive guard')

  result = await api('/api/units/bulk', 'POST', adminToken, { units: [{ unitNumber: 'TEST-V-1', unitType: 'villa', floor: '', bedroomCount: 4 }, { unitNumber: 'TEST-B-1', unitType: 'bungalow', floor: '', bedroomCount: 3 }] })
  assert(result.status === 201 && result.payload.data.length === 2, `Bulk import failed: ${JSON.stringify(result.payload)}`)
  ids.bulkUnits = result.payload.data.map((item) => item.id)
  console.log('PASS CSV bulk-import API')

  result = await api(`/api/residents/${ids.resident}/access`, 'DELETE', adminToken, { unitId: ids.unit })
  assert(result.status === 200 && result.payload.data.accountDeactivated === true, `Move-out failed: ${JSON.stringify(result.payload)}`)
  const [{ data: ended }, { data: inactiveVehicle }, { data: inactiveResident }] = await Promise.all([
    db.from('unit_assignments').select('status').eq('id', ids.assignment).single(),
    db.from('vehicles').select('status').eq('id', ids.vehicle).single(),
    db.from('residents').select('status').eq('id', ids.resident).single(),
  ])
  assert(ended?.status === 'ended' && inactiveVehicle?.status === 'inactive' && inactiveResident?.status === 'deactivated', 'Move-out database state is incomplete')
  console.log('PASS move-out, vehicle cleanup, account deactivation')

  result = await api(`/api/units/${ids.unit}`, 'PATCH', adminToken, { unitNumber: 'TEST-A-101', unitType: 'flat', floor: 3, bedroomCount: 4, status: 'inactive' })
  assert(result.status === 200 && result.payload.data.lifecycle_status === 'inactive', 'Vacant property archive failed')
  console.log('PASS vacant property archival')
  console.log('PROPERTY_MANAGEMENT_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
