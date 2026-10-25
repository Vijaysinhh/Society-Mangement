'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

export interface AuthUser {
  id: string
  email: string
  role: 'resident' | 'admin' | 'watchman' | 'superadmin'
  societyId: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          const result = await apiClient.verifyToken()
          if (result.success) {
            setUser(result.user)
          } else {
            localStorage.removeItem('auth_token')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('auth_token')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, role: string) => {
    try {
      const result = await apiClient.login(email, password, role)
      setUser(result.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
