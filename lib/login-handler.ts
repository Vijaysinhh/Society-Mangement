import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export interface AuthSession {
  user: any
  session: any
  role: 'superadmin' | 'admin' | 'resident' | 'watchman'
  societyId?: string
  societyName?: string
}

/**
 * Generic login handler that works for any role
 * Authenticates with Supabase and fetches role-specific data
 */
export async function loginUser(
  email: string,
  password: string,
  role: 'superadmin' | 'admin' | 'resident' | 'watchman'
): Promise<AuthSession> {
  // Step 1: Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    throw new Error(authError.message || 'Authentication failed')
  }

  if (!authData.user) {
    throw new Error('No user data returned')
  }

  const userId = authData.user.id

  // Step 2: Fetch role-specific data from database
  let societyId: string | undefined
  let societyName: string | undefined
  let roleData: any

  if (role === 'superadmin') {
    // Superadmin can access all societies
    roleData = { id: userId, email, role: 'superadmin' }
  } else if (role === 'admin') {
    // Admin belongs to a specific society
    const { data, error } = await supabase
      .from('society_admins')
      .select('*, societies(id, name, slug)')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw new Error('Admin account not found in database')
    }

    roleData = data
    societyId = data.society_id
    societyName = data.societies?.name
  } else if (role === 'resident') {
    // Resident belongs to a specific society and property
    const { data, error } = await supabase
      .from('residents')
      .select('*, properties(id, unit_number, property_type), societies(id, name, slug)')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw new Error('Resident account not found in database')
    }

    roleData = data
    societyId = data.society_id
    societyName = data.societies?.name
  } else if (role === 'watchman') {
    // Watchman belongs to a specific society
    const { data, error } = await supabase
      .from('watchmen')
      .select('*, societies(id, name, slug)')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw new Error('Watchman account not found in database')
    }

    roleData = data
    societyId = data.society_id
    societyName = data.societies?.name
  }

  // Step 3: Create session object
  const session: AuthSession = {
    user: { id: userId, email, ...roleData },
    session: authData.session,
    role,
    societyId,
    societyName,
  }

  // Step 4: Store in localStorage and return
  localStorage.setItem('auth_session', JSON.stringify(session))

  return session
}

/**
 * Get current session from localStorage
 */
export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('auth_session')
  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthSession
  } catch {
    return null
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
  localStorage.removeItem('auth_session')
}

/**
 * Get redirect path based on role
 */
export function getRedirectPath(role: string): string {
  switch (role) {
    case 'superadmin':
      return '/superadmin-dashboard'
    case 'admin':
      return '/society-admin'
    case 'resident':
      return '/resident-dashboard'
    case 'watchman':
      return '/watchman-dashboard'
    default:
      return '/'
  }
}

/**
 * Demo account credentials for testing
 */
export const DEMO_ACCOUNTS = {
  superadmin: {
    email: 'superadmin@demo.com',
    password: 'Demo@123456',
  },
  admin: {
    email: 'admin@demo.com',
    password: 'Admin@123456',
  },
  resident: {
    email: 'resident1@demo.com',
    password: 'Resident@123',
  },
  watchman: {
    email: 'watchman1@demo.com',
    password: 'Watchman@123',
  },
}
