'use client'

import { useRouter } from 'next/navigation'

export interface ResidentSession {
  id: string
  email: string
  name: string
  phone: string
  flatNo: string
  societyId: string
}

const RESIDENT_SESSION_KEY = 'resident_session'
const RESIDENT_TOKEN_KEY = 'resident_token'

export function isResidentAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(RESIDENT_TOKEN_KEY)
  const session = localStorage.getItem(RESIDENT_SESSION_KEY)
  return !!(token && session)
}

export function getResidentSession(): ResidentSession | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(RESIDENT_SESSION_KEY)
  if (!session) return null
  try {
    return JSON.parse(session)
  } catch {
    return null
  }
}

export function setResidentSession(session: ResidentSession, token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(RESIDENT_SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(RESIDENT_TOKEN_KEY, token)
}

export function clearResidentSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(RESIDENT_SESSION_KEY)
  localStorage.removeItem(RESIDENT_TOKEN_KEY)
}

export function useResidentAuth() {
  const router = useRouter()

  const logout = () => {
    clearResidentSession()
    router.push('/resident-dashboard')
  }

  return {
    isAuthenticated: isResidentAuthenticated(),
    session: getResidentSession(),
    logout,
  }
}
