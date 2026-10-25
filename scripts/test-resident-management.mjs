import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')
const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const ids = { superadmin: '', society: '', admin: '', resident: '', secondResident: '', unitA: '', unitB: '', assignmentA: '', assignmentB: '', movedAssignment: '', vehicle: '', watchman: '', visitor: '', issue: '', bill: '', payment: '' }

const assert = (value, message) => { if (!value) throw new Error(message) }
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex')
async function one(table, values) { const { data, error } = await db.from(table).insert(values).select().single(); if (error) throw new Error(`${table} insert: ${error.message}`); return data }
async function session(type, accountId) { const token = crypto.randomBytes(32).toString('base64url'); await one('auth_sessions', { token_hash: tokenHash(token), account_type: type, account_id: accountId, society_id: ids.society, expires_at: new Date(Date.now() + 3600000).toISOString() }); return token }
async function api(path, method, token, body) { const res = await fetch(`${baseUrl}${path}`, { method, headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: res.status, payload: await res.json().catch(() => ({})) } }
async function cleanup() {
  if (!ids.society) { if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin); return }
  for (const table of ['audit_events','resident_role_change_requests','bill_payments','maintenance_bills','visitor_requests','issues','vehicles','unit_assignments','resident_invitations','auth_sessions','residents','watchman_shifts','watchmen','units','society_admins']) await db.from(table).delete().eq('society_id', ids.society)
  await db.from('societies').delete().eq('id', ids.society)
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(crypto.randomBytes(16).toString('hex'), 8)
  const superadmin = await one('superadmins', { email: `resident-test-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Resident Integration Test', is_active: true }); ids.superadmin = superadmin.id
  const society = await one('societies', { name: `Resident Test ${suffix}`, slug: `resident-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' }); ids.society = society.id
  const admin = await one('society_admins', { society_id: ids.society, username: `res_${suffix}`.replaceAll('-', '_').slice(0, 50), password_hash: passwordHash, post_name: 'Test Secretary', holder_name: 'Integration Test', is_primary: true, created_by: ids.superadmin }); ids.admin = admin.id
  const unitA = await one('units', { society_id: ids.society, unit_number: 'TEST-A-101', unit_type: 'flat', floor: 1, bedroom_count: 2, lifecycle_status: 'active', created_by: ids.admin }); ids.unitA = unitA.id
  const unitB = await one('units', { society_id: ids.society, unit_number: 'TEST-B-201', unit_type: 'flat', floor: 2, bedroom_count: 3, lifecycle_status: 'active', created_by: ids.admin }); ids.unitB = unitB.id
  const resident = await one('residents', { society_id: ids.society, phone: `8${Date.now().toString().slice(-9)}`, email: `first-${suffix}@example.invalid`, password_hash: passwordHash, name: 'First Test Resident', status: 'active' }); ids.resident = resident.id
  const second = await one('residents', { society_id: ids.society, phone: `7${Date.now().toString().slice(-9)}`, email: `second-${suffix}@example.invalid`, password_hash: passwordHash, name: 'Second Test Resident', status: 'active' }); ids.secondResident = second.id
  const assignmentA = await one('unit_assignments', { society_id: ids.society, unit_id: ids.unitA, resident_id: ids.resident, assignment_role: 'tenant' }); ids.assignmentA = assignmentA.id
  const assignmentB = await one('unit_assignments', { society_id: ids.society, unit_id: ids.unitB, resident_id: ids.secondResident, assignment_role: 'owner' }); ids.assignmentB = assignmentB.id
  const vehicle = await one('vehicles', { society_id: ids.society, unit_id: ids.unitA, resident_id: ids.resident, registration_number: `RMT${Date.now().toString().slice(-7)}`, vehicle_type: 'car', status: 'active' }); ids.vehicle = vehicle.id
  const watchman = await one('watchmen', { society_id: ids.society, username: `wm_${suffix}`.replaceAll('-', '_').slice(0, 50), password_hash: passwordHash, name: 'Test Watchman', phone: `6${Date.now().toString().slice(-9)}`, status: 'active', created_by: ids.admin }); ids.watchman = watchman.id
  const visitor = await one('visitor_requests', { society_id: ids.society, unit_id: ids.unitA, watchman_id: ids.watchman, visitor_name: 'Test Visitor', visitor_phone: '9999999999', purpose: 'Integration test', status: 'pending' }); ids.visitor = visitor.id
  const issue = await one('issues', { society_id: ids.society, unit_id: ids.unitA, resident_id: ids.resident, category: 'maintenance', title: 'Integration issue', description: 'Integration issue description', status: 'open' }); ids.issue = issue.id
  const bill = await one('maintenance_bills', { society_id: ids.society, unit_id: ids.unitA, created_by: ids.admin, billing_period: '2026-09-01', title: 'Integration bill', amount: 1000, due_date: '2026-09-10', status: 'payment_pending' }); ids.bill = bill.id
  const payment = await one('bill_payments', { society_id: ids.society, bill_id: ids.bill, resident_id: ids.resident, amount: 1000, payment_method: 'upi', payment_reference: `REF${Date.now()}`, status: 'pending' }); ids.payment = payment.id
  const adminToken = await session('society_admin', ids.admin), residentToken = await session('resident', ids.resident)

  let result = await api('/api/residents', 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.length === 2, `Resident directory failed: ${JSON.stringify(result.payload)}`)
  console.log('PASS resident directory')

  result = await api(`/api/residents/${ids.resident}`, 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.vehicles.length === 1 && result.payload.data.issues.length === 1 && result.payload.data.visitors.length === 1 && result.payload.data.bills.length === 1 && result.payload.data.payments.length === 1, 'Consolidated resident detail is incomplete')
  console.log('PASS consolidated resident detail')

  result = await api(`/api/residents/${ids.resident}`, 'PATCH', adminToken, { name: 'Updated Test Resident', phone: resident.phone, email: second.email, status: 'active' })
  assert(result.status === 409, `Duplicate email expected 409, received ${result.status}`)
  result = await api(`/api/residents/${ids.resident}`, 'PATCH', adminToken, { name: 'Updated Test Resident', phone: resident.phone, email: resident.email, status: 'suspended' })
  assert(result.status === 200 && result.payload.data.status === 'suspended', 'Resident suspension failed')
  result = await api('/api/resident/context', 'GET', residentToken)
  assert(result.status === 401, `Suspended resident session should be revoked, received ${result.status}`)
  result = await api(`/api/residents/${ids.resident}`, 'PATCH', adminToken, { name: 'Updated Test Resident', phone: resident.phone, email: resident.email, status: 'active' })
  assert(result.status === 200, 'Resident reactivation with active assignment failed')
  console.log('PASS editing, duplicate protection, suspension, session revocation, reactivation')

  result = await api(`/api/residents/${ids.resident}/assignment`, 'PATCH', adminToken, { assignmentId: ids.assignmentA, assignmentRole: 'owner' })
  assert(result.status === 200 && result.payload.data.assignment_role === 'owner', 'Admin role change failed')
  result = await api(`/api/residents/${ids.resident}/transfer`, 'POST', adminToken, { assignmentId: ids.assignmentA, targetUnitId: ids.unitB, assignmentRole: 'owner' })
  assert(result.status === 409, `Owner conflict expected 409, received ${result.status}`)
  result = await api(`/api/residents/${ids.resident}/transfer`, 'POST', adminToken, { assignmentId: ids.assignmentA, targetUnitId: ids.unitB, assignmentRole: 'tenant' })
  assert(result.status === 200, `Resident transfer failed: ${JSON.stringify(result.payload)}`); ids.movedAssignment = result.payload.data.assignment_id
  const { data: movedVehicle } = await db.from('vehicles').select('unit_id').eq('id', ids.vehicle).single()
  assert(movedVehicle?.unit_id === ids.unitB, 'Vehicle did not move with resident')
  console.log('PASS role management, owner-conflict protection, atomic transfer, vehicle transfer')

  result = await api(`/api/residents/${ids.resident}/access`, 'DELETE', adminToken, { unitId: ids.unitB })
  assert(result.status === 200 && result.payload.data.accountDeactivated === true, 'Move-out failed')
  result = await api(`/api/residents/${ids.resident}/restore`, 'POST', adminToken, { assignmentId: ids.movedAssignment })
  assert(result.status === 200, `Restore failed: ${JSON.stringify(result.payload)}`)
  const [{ data: restoredResident }, { data: restoredAssignment }] = await Promise.all([db.from('residents').select('status').eq('id', ids.resident).single(), db.from('unit_assignments').select('status').eq('id', ids.movedAssignment).single()])
  assert(restoredResident?.status === 'active' && restoredAssignment?.status === 'active', 'Restored state was not persisted')
  console.log('PASS move-out and access restoration')

  result = await api('/api/residents', 'GET', residentToken)
  assert(result.status === 401, 'Resident must not access Society Admin resident directory')
  console.log('PASS role authorization')
  console.log('RESIDENT_MANAGEMENT_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
