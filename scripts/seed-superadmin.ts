import crypto from 'crypto'

// This script helps you insert a default super admin into your Supabase database
// Run this SQL in your Supabase SQL Editor

const DEFAULT_SUPER_ADMIN = {
  email: 'admin@societymanager.com',
  password: 'DefaultPassword123', // Change this!
}

// Generate password hash using the same method as auth.ts
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

const passwordHash = hashPassword(DEFAULT_SUPER_ADMIN.password)

// This is the SQL to run in Supabase
export const seedSQL = `
-- Insert default super admin user
INSERT INTO users (
  email,
  phone_number,
  password_hash,
  role,
  is_active
) VALUES (
  '${DEFAULT_SUPER_ADMIN.email}',
  NULL,
  '${passwordHash}',
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, role FROM users WHERE email = '${DEFAULT_SUPER_ADMIN.email}' AND role = 'super_admin';
`

console.log('Run this SQL in your Supabase dashboard:')
console.log('=' .repeat(60))
console.log(seedSQL)
console.log('=' .repeat(60))
console.log('\nDefault Super Admin Credentials:')
console.log(`Email: ${DEFAULT_SUPER_ADMIN.email}`)
console.log(`Password: ${DEFAULT_SUPER_ADMIN.password}`)
console.log('\n⚠️ IMPORTANT: Change this password immediately after first login!')
