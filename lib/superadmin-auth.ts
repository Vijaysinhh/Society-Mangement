'use client'

export interface SuperadminSession {
  userId: string
  email: string
  role: 'superadmin'
}

/**
 * Get the superadmin session from localStorage
 */
export function getSuperadminSession(): SuperadminSession | null {
  if (typeof window === 'undefined') return null
  
  try {
    const session = localStorage.getItem('superadminSession')
    return session ? JSON.parse(session) : null
  } catch (error) {
    console.error('Error parsing superadmin session:', error)
    return null
  }
}

/**
 * Set the superadmin session in localStorage
 */
export function setSuperadminSession(session: SuperadminSession): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('superadminSession', JSON.stringify(session))
  } catch (error) {
    console.error('Error setting superadmin session:', error)
  }
}

/**
 * Clear the superadmin session
 */
export function clearSuperadminSession(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('superadminSession')
    localStorage.removeItem('rememberEmail')
  } catch (error) {
    console.error('Error clearing superadmin session:', error)
  }
}

/**
 * Check if user is authenticated as superadmin
 */
export function isSuperadminAuthenticated(): boolean {
  return getSuperadminSession() !== null
}

/**
 * Logout superadmin
 */
export async function logoutSuperadmin(): Promise<void> {
  clearSuperadminSession()
  
  // Optional: Call logout API endpoint if you create one
  try {
    await fetch('/api/auth/superadmin-logout', { method: 'POST' })
  } catch (error) {
    console.error('Error calling logout API:', error)
  }
}
