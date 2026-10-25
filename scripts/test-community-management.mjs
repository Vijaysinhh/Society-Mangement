import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hash } from 'bcryptjs'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !serviceKey) throw new Error('Supabase development credentials are missing')

const db = createClient(supabaseUrl, serviceKey)
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const password = `Community-${crypto.randomBytes(8).toString('hex')}`
const ids = { superadmin: '', society: '', otherSociety: '', admin: '', otherAdmin: '', resident: '', unit: '', assignment: '', announcement: '', post: '', guideline: '' }
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
  const result = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { cookie: `vms_session=${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: result.status, payload: await result.json().catch(() => ({})) }
}
async function cleanupSociety(societyId) {
  if (!societyId) return
  for (const table of ['audit_events', 'community_post_reactions', 'community_posts', 'community_guidelines', 'auth_sessions', 'unit_assignments', 'residents', 'units', 'society_admins']) {
    await db.from(table).delete().eq('society_id', societyId)
  }
  await db.from('societies').delete().eq('id', societyId)
}
async function cleanup() {
  await cleanupSociety(ids.society)
  await cleanupSociety(ids.otherSociety)
  if (ids.superadmin) await db.from('superadmins').delete().eq('id', ids.superadmin)
}

try {
  const passwordHash = await hash(password, 8)
  const superadmin = await one('superadmins', { email: `community-${suffix}@example.invalid`, password_hash: passwordHash, full_name: 'Community Test', is_active: true })
  ids.superadmin = superadmin.id
  const society = await one('societies', { name: `Community Test ${suffix}`, slug: `community-test-${suffix}`, address: 'Test address', city: 'Test city', status: 'active' })
  ids.society = society.id
  const otherSociety = await one('societies', { name: `Other Community ${suffix}`, slug: `other-community-${suffix}`, address: 'Other address', city: 'Other city', status: 'active' })
  ids.otherSociety = otherSociety.id
  const adminUsername = `community_admin_${suffix.replaceAll('-', '_')}`.slice(0, 50)
  const otherAdminUsername = `other_admin_${suffix.replaceAll('-', '_')}`.slice(0, 50)
  const admin = await one('society_admins', { society_id: ids.society, username: adminUsername, password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Community Admin', is_primary: true, created_by: ids.superadmin })
  ids.admin = admin.id
  const otherAdmin = await one('society_admins', { society_id: ids.otherSociety, username: otherAdminUsername, password_hash: passwordHash, post_name: 'Secretary', holder_name: 'Other Admin', is_primary: true, created_by: ids.superadmin })
  ids.otherAdmin = otherAdmin.id
  const residentEmail = `resident-${suffix}@example.invalid`
  const resident = await one('residents', { society_id: ids.society, phone: `8${Date.now().toString().slice(-9)}`, email: residentEmail, password_hash: passwordHash, name: 'Community Resident', status: 'active' })
  ids.resident = resident.id
  const unit = await one('units', { society_id: ids.society, unit_number: 'COMM-101', unit_type: 'flat', floor: 1, bedroom_count: 2, lifecycle_status: 'active', created_by: ids.admin })
  ids.unit = unit.id
  const assignment = await one('unit_assignments', { society_id: ids.society, unit_id: ids.unit, resident_id: ids.resident, assignment_role: 'owner' })
  ids.assignment = assignment.id

  const adminToken = await login('/api/auth/admin-login', { username: adminUsername, password })
  const otherAdminToken = await login('/api/auth/admin-login', { username: otherAdminUsername, password })
  const residentToken = await login('/api/auth/resident-login', { societyCode: society.slug, phone: resident.phone, password })
  console.log('PASS real admin and resident login')

  let result = await api('/api/community/posts', 'POST', adminToken, { message: 'Water maintenance on Sunday', category: 'maintenance' })
  assert(result.status === 201 && result.payload.data.type === 'announcement', `Announcement creation failed: ${JSON.stringify(result.payload)}`)
  ids.announcement = result.payload.data.id
  result = await api('/api/community/posts', 'GET', residentToken)
  assert(result.status === 200 && result.payload.data.some((post) => post.id === ids.announcement && post.author === 'Management'), 'Resident cannot see admin announcement')
  console.log('PASS admin announcement and resident visibility')

  result = await api('/api/community/posts', 'POST', residentToken, { message: 'Resident community post' })
  assert(result.status === 201 && result.payload.data.type === 'post' && result.payload.data.unit === 'COMM-101', `Resident post creation failed: ${JSON.stringify(result.payload)}`)
  ids.post = result.payload.data.id
  result = await api('/api/community/posts', 'GET', adminToken)
  assert(result.status === 200 && result.payload.data.some((post) => post.id === ids.post && post.author === 'Community Resident'), 'Admin cannot see resident post')
  console.log('PASS resident post and admin visibility')

  result = await api(`/api/community/posts/${ids.announcement}/like`, 'POST', residentToken)
  assert(result.status === 200 && result.payload.data.liked === true && result.payload.data.likes === 1, 'Like failed')
  result = await api(`/api/community/posts/${ids.announcement}/like`, 'POST', residentToken)
  assert(result.status === 200 && result.payload.data.liked === false && result.payload.data.likes === 0, 'Unlike failed')
  console.log('PASS persistent like toggle')

  result = await api(`/api/community/posts/${ids.announcement}`, 'PATCH', residentToken, { message: 'Unauthorized edit' })
  assert(result.status === 404, `Resident announcement edit expected 404, received ${result.status}`)
  result = await api(`/api/community/posts/${ids.post}`, 'PATCH', residentToken, { message: 'Updated resident community post' })
  assert(result.status === 200 && result.payload.data.message.startsWith('Updated'), 'Resident own-post edit failed')
  result = await api(`/api/community/posts/${ids.post}`, 'DELETE', otherAdminToken)
  assert(result.status === 404, `Cross-society deletion expected 404, received ${result.status}`)
  console.log('PASS ownership and society isolation')

  result = await api('/api/community/guidelines', 'POST', adminToken, { title: 'Quiet Hours', content: 'Please observe quiet hours after 10 PM.' })
  assert(result.status === 201 && result.payload.data.version === 'v1.0', `Guideline creation failed: ${JSON.stringify(result.payload)}`)
  ids.guideline = result.payload.data.id
  result = await api('/api/community/guidelines', 'GET', residentToken)
  assert(result.status === 200 && result.payload.data.some((item) => item.id === ids.guideline), 'Resident cannot view guideline')
  result = await api(`/api/community/guidelines/${ids.guideline}`, 'PATCH', adminToken, { title: 'Updated Quiet Hours', content: 'Quiet hours begin at 10 PM.' })
  assert(result.status === 200 && result.payload.data.title.startsWith('Updated'), 'Guideline update failed')
  result = await api('/api/community/guidelines', 'POST', residentToken, { title: 'Invalid', content: 'Residents cannot create guidelines.' })
  assert(result.status === 401, `Resident guideline creation expected 401, received ${result.status}`)
  console.log('PASS guideline create, resident visibility, update, and authorization')

  result = await api(`/api/community/posts/${ids.post}`, 'DELETE', adminToken)
  assert(result.status === 200, 'Admin moderation delete failed')
  result = await api(`/api/community/guidelines/${ids.guideline}`, 'DELETE', adminToken)
  assert(result.status === 200, 'Guideline delete failed')
  console.log('PASS admin moderation and guideline deletion')
  console.log('COMMUNITY_MANAGEMENT_INTEGRATION_TESTS_PASSED')
} finally {
  await cleanup()
  console.log('CLEANUP complete')
}
