import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD
const fullName = process.env.BOOTSTRAP_SUPERADMIN_NAME?.trim() || 'Platform Superadmin'

if (!url || !serviceKey || !email || !password) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOOTSTRAP_SUPERADMIN_EMAIL, or BOOTSTRAP_SUPERADMIN_PASSWORD.')
  process.exit(1)
}

if (password.length < 12) {
  console.error('The bootstrap superadmin password must contain at least 12 characters.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { count, error: countError } = await supabase
  .from('superadmins')
  .select('id', { count: 'exact', head: true })

if (countError) throw countError
if ((count || 0) > 0) {
  console.error('Bootstrap refused: a superadmin already exists. Manage additional accounts through an authenticated administrative process.')
  process.exit(1)
}

const passwordHash = await bcrypt.hash(password, 12)
const { data, error } = await supabase
  .from('superadmins')
  .insert({ email, password_hash: passwordHash, full_name: fullName, is_active: true })
  .select('id, email')
  .single()

if (error) throw error
console.log(`Development superadmin created: ${data.email} (${data.id})`)
