import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { JWTPayload, verifyJWT, decodeJWT } from './jwt'

const AUTH_TOKEN_KEY = 'auth_token'

export function useAuth() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Get societyName from URL
  const societyName = params?.societyName as string | undefined

  // Check authentication on mount and validate society context
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    if (!token) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    const payload = verifyJWT(token)

    if (!payload) {
      // Invalid token - clear it
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    // Validate society context if societyName is in URL
    if (societyName && payload.societyName !== societyName) {
      console.warn('[Auth] Society mismatch:', { urlSociety: societyName, tokenSociety: payload.societyName })
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    setUser(payload)
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [societyName])

  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
    setIsAuthenticated(false)

    // Redirect to appropriate login page
    if (societyName) {
      const userType = user?.userType
      if (userType === 'admin') {
        router.push(`/${societyName}/societyadmin/login`)
      } else if (userType === 'resident') {
        router.push(`/${societyName}/resident/login`)
      } else if (userType === 'watchman') {
        router.push(`/${societyName}/watchman/login`)
      } else {
        router.push('/')
      }
    } else if (user?.userType === 'superadmin') {
      router.push('/superadmin-login')
    } else {
      router.push('/')
    }
  }, [router, societyName, user?.userType])

  const setAuthToken = useCallback((token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    const payload = decodeJWT(token)
    if (payload) {
      setUser(payload)
      setIsAuthenticated(true)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    setAuthToken,
  }
}
