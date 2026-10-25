'use client'

export interface ResidentSession {
  id: string
  email: string
  name: string
  societyId: string
}

const RESIDENT_SESSION_KEY = 'resident_session'
const RESIDENT_TOKEN_KEY = 'resident_token'

export function setResidentSession(session: ResidentSession, token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RESIDENT_SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(RESIDENT_TOKEN_KEY, token)
  }
}

export function getResidentSession(): ResidentSession | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(RESIDENT_SESSION_KEY)
  return session ? JSON.parse(session) : null
}

export function isResidentAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!(localStorage.getItem(RESIDENT_SESSION_KEY) && localStorage.getItem(RESIDENT_TOKEN_KEY))
}

export function getResidentToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(RESIDENT_TOKEN_KEY)
}

export function clearResidentSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(RESIDENT_SESSION_KEY)
    localStorage.removeItem(RESIDENT_TOKEN_KEY)
  }
}
