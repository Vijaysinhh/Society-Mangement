import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD
const fullName = process.env.BOOTSTRAP_SUPERADMIN_NAME?.trim() || 'Platform Superadmin'

if (!url || !serviceKey || !email || !password) {
  throw new Error('Development Supabase and bootstrap credentials are required in .env.local')
}
if (password.length < 12) throw new Error('Superadmin password must contain at least 12 characters')

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const { data: accounts, error: readError } = await supabase
  .from('superadmins')
  .select('id')
  .limit(2)
if (readError) throw readError
if (accounts.length !== 1) {
  throw new Error(`Sync refused: expected exactly one development superadmin, found ${accounts.length}`)
}

const passwordHash = await bcrypt.hash(password, 12)
const { error: updateError } = await supabase
  .from('superadmins')
  .update({ email, password_hash: passwordHash, full_name: fullName, is_active: true })
  .eq('id', accounts[0].id)
if (updateError) throw updateError

const { error: revokeError } = await supabase
  .from('auth_sessions')
  .update({ revoked_at: new Date().toISOString() })
  .eq('account_type', 'superadmin')
  .eq('account_id', accounts[0].id)
  .is('revoked_at', null)
if (revokeError) throw revokeError

console.log(`Development superadmin synchronized: ${email}`)
