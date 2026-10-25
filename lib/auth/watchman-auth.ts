'use client'

import { useRouter } from 'next/navigation'

export interface WatchmanSession {
  id: string
  email: string
  name: string
  phone: string
  societyId: string
  zone?: string
}

const WATCHMAN_SESSION_KEY = 'watchman_session'
const WATCHMAN_TOKEN_KEY = 'watchman_token'

export function isWatchmanAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(WATCHMAN_TOKEN_KEY)
  const session = localStorage.getItem(WATCHMAN_SESSION_KEY)
  return !!(token && session)
}

export function getWatchmanSession(): WatchmanSession | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(WATCHMAN_SESSION_KEY)
  if (!session) return null
  try {
    return JSON.parse(session)
  } catch {
    return null
  }
}

export function setWatchmanSession(session: WatchmanSession, token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WATCHMAN_SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(WATCHMAN_TOKEN_KEY, token)
}

export function clearWatchmanSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(WATCHMAN_SESSION_KEY)
  localStorage.removeItem(WATCHMAN_TOKEN_KEY)
}

export function useWatchmanAuth() {
  const router = useRouter()

  const logout = () => {
    clearWatchmanSession()
    router.push('/watchman-login')
  }

  return {
    isAuthenticated: isWatchmanAuthenticated(),
    session: getWatchmanSession(),
    logout,
  }
}
