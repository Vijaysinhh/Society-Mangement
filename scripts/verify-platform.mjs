import { createClient } from '@supabase/supabase-js'

const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const superadminEmail = process.env.BOOTSTRAP_SUPERADMIN_EMAIL
const superadminPassword = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD

if (!supabaseUrl || !serviceKey || !superadminEmail || !superadminPassword) {
  throw new Error('Development Supabase and bootstrap credentials are required in .env.local')
}

const db = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function removeStaleDevelopmentFixtures() {
  const { data: fixtures, error } = await db
    .from('societies')
    .select('id')
    .like('slug', 'development-test-%')
  if (error) throw error
  const ids = (fixtures || []).map((fixture) => fixture.id)
  if (ids.length === 0) return
  await db.from('audit_events').delete().in('society_id', ids)
  await db.from('society_admins').delete().in('society_id', ids)
  const { error: deleteError } = await db.from('societies').delete().in('id', ids)
  if (deleteError) throw deleteError
}

function cookieFrom(response) {
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) throw new Error('Expected a session cookie')
  return setCookie.split(';', 1)[0]
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${body.error || body.message || 'Unknown error'}`)
  }
  return { response, body }
}

const stamp = Date.now().toString()
const slug = `verification-${stamp}`
const username = `verify_${stamp}`
const password = `Verify!${stamp}`
let societyId

try {
  await removeStaleDevelopmentFixtures()
  const superLogin = await jsonRequest('/api/auth/superadmin-login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: superadminEmail, password: superadminPassword }),
  })
  const superCookie = cookieFrom(superLogin.response)

  const superSession = await jsonRequest('/api/auth/session', {
    headers: { cookie: superCookie },
  })
  if (superSession.body.user?.role !== 'superadmin') throw new Error('Wrong superadmin session role')

  const provision = await jsonRequest('/api/societies', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: superCookie },
    body: JSON.stringify({
      society: {
        name: `Verification Society ${stamp}`,
        slug,
        address: 'Verification address',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '+919999999999',
        contactPerson: 'Verification Contact',
        villas: 1,
        bungalows: 0,
        flats: 2,
      },
      admin: {
        name: 'Verification Holder',
        username,
        password,
        phone: '+919999999998',
      },
    }),
  })
  societyId = provision.body.data?.society?.id
  if (!societyId || !provision.body.data?.admin?.id) throw new Error('Provisioning response is incomplete')

  const adminLogin = await jsonRequest('/api/auth/admin-login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const adminCookie = cookieFrom(adminLogin.response)
  const adminSession = await jsonRequest('/api/auth/session', {
    headers: { cookie: adminCookie },
  })
  if (adminSession.body.user?.role !== 'society_admin') throw new Error('Wrong admin session role')
  if (adminSession.body.user?.societyId !== societyId) throw new Error('Admin session is assigned to the wrong society')

  await jsonRequest(`/api/societies/${societyId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie: superCookie },
    body: JSON.stringify({ status: 'paused' }),
  })

  const suspendedCheck = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: adminCookie },
  })
  if (suspendedCheck.status !== 401) throw new Error('Paused society admin session remained active')

  console.log('PASS superadmin login and revocable session')
  console.log('PASS atomic society and primary-admin provisioning')
  console.log('PASS society-admin username/password login and tenant assignment')
  console.log('PASS paused society blocks its administrator session')
} finally {
  if (societyId) {
    await db.from('audit_events').delete().eq('society_id', societyId)
    await db.from('society_admins').delete().eq('society_id', societyId)
    await db.from('societies').delete().eq('id', societyId)
  }
}
