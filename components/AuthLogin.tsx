'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthPayload } from '@/lib/auth'

interface AuthLoginProps {
  onSuccess?: (user: AuthPayload) => void
  userType: 'resident' | 'watchman' | 'admin'
}

export function useLoginHandler({ userType, onSuccess }: AuthLoginProps) {
  const router = useRouter()
  const params = useParams()
  const { setAuthToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const societyName = params?.societyName as string | undefined

  const handleLogin = async (email: string, password: string, societyId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: userType,
          societyId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const { token, user } = await response.json()

      // Store token in localStorage
      setAuthToken(token)

      if (onSuccess) {
        onSuccess(user)
      }

      // Redirect to dashboard
      if (societyName && userType === 'admin') {
        router.push(`/${societyName}/societyadmin/dashboard`)
      } else if (societyName) {
        router.push(`/${societyName}/${userType}/dashboard`)
      } else {
        router.push('/')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('[Login] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}
