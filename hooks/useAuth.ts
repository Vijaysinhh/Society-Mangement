'use client'

import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()

  const logout = () => {
    router.push('/')
  }

  const setAuthToken = (_token: string) => undefined

  return {
    user: null,
    isAuthenticated: true,
    isLoading: false,
    logout,
    setAuthToken,
  }
}
