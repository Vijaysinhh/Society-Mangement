'use client'

export interface WatchmanSession {
  id: string
  email: string
  name: string
  societyId: string
  shiftTiming?: string
}

const WATCHMAN_SESSION_KEY = 'watchman_session'
const WATCHMAN_TOKEN_KEY = 'watchman_token'

export function setWatchmanSession(session: WatchmanSession, token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WATCHMAN_SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(WATCHMAN_TOKEN_KEY, token)
  }
}

export function getWatchmanSession(): WatchmanSession | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(WATCHMAN_SESSION_KEY)
  return session ? JSON.parse(session) : null
}

export function isWatchmanAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!(localStorage.getItem(WATCHMAN_SESSION_KEY) && localStorage.getItem(WATCHMAN_TOKEN_KEY))
}

export function getWatchmanToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(WATCHMAN_TOKEN_KEY)
}

export function clearWatchmanSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WATCHMAN_SESSION_KEY)
    localStorage.removeItem(WATCHMAN_TOKEN_KEY)
  }
}
