'use client'

import { useRouter } from 'next/navigation'

export interface AdminSession {
  id: string
  email: string
  name: string
  phone: string
  societyId: string
  role: 'admin' | 'superadmin'
}

const ADMIN_SESSION_KEY = 'admin_session'
const ADMIN_TOKEN_KEY = 'admin_token'

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  const session = localStorage.getItem(ADMIN_SESSION_KEY)
  return !!(token && session)
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(ADMIN_SESSION_KEY)
  if (!session) return null
  try {
    return JSON.parse(session)
  } catch {
    return null
  }
}

export function setAdminSession(session: AdminSession, token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_SESSION_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function useAdminAuth() {
  const router = useRouter()

  const logout = () => {
    clearAdminSession()
    router.push('/admin-login')
  }

  return {
    isAuthenticated: isAdminAuthenticated(),
    session: getAdminSession(),
    logout,
  }
}
