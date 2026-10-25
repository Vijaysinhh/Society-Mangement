'use client'

import { useState, useEffect } from 'react'
import { Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff, LogIn, Shield } from 'lucide-react'
import { getCredentialManager } from '@/lib/credentialManagementSystem'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isAccountLocked, setIsAccountLocked] = useState(false)
  const router = useRouter()
  const credentialManager = getCredentialManager()

  const getClientIpAddress = (): string => {
    // In a real app, this would come from the server
    if (typeof window !== 'undefined') {
      return window.location.hostname || 'localhost'
    }
    return 'unknown'
  }

  const getUserAgent = (): string => {
    return navigator.userAgent || 'unknown'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isAccountLocked) {
      setMessage({ type: 'error', text: 'Too many failed attempts. Please try again later.' })
      return
    }

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please enter email and password' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const ipAddress = getClientIpAddress()
    const userAgent = getUserAgent()

    const result = credentialManager.login(email, password, ipAddress, userAgent)

    if (result.success) {
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
      setFailedAttempts(0)
      
      // Store session in localStorage for the admin dashboard
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'adminSession',
          JSON.stringify({
            sessionId: result.sessionId,
            adminAccountId: result.adminAccount?.id,
            email: email,
            loginTime: new Date().toISOString(),
            adminLabel: result.adminAccount?.adminLabel,
            societyId: result.adminAccount?.societyId,
          })
        )
      }

      // Redirect to admin dashboard after a brief delay
      setTimeout(() => {
        router.push('/society-admin')
      }, 1500)
    } else {
      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)

      if (newFailedAttempts >= 5) {
        setIsAccountLocked(true)
        setMessage({
          type: 'error',
          text: 'Too many failed login attempts. Account temporarily locked for security.',
        })
      } else {
        setMessage({
          type: 'error',
          text: result.message,
        })
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">SocietyHub</h1>
          </div>
          <p className="text-blue-100 text-sm">Admin Account Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-600 mt-1">Login with your organizational admin credentials</p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Failed Attempts Warning */}
          {failedAttempts > 0 && failedAttempts < 5 && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Failed attempt {failedAttempts}/5. Be careful - account will lock after 5 failed attempts.
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@society.com"
                  disabled={isAccountLocked || isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isAccountLocked || isLoading}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isAccountLocked || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900 font-medium mb-2">Security Features:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                All login attempts are logged with IP address
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Password change invalidates all other sessions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Account locks after 5 failed attempts
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-100 text-xs">
          <p>Secure login for organizational admin accounts</p>
          <p className="mt-1">IP Address: {getClientIpAddress()}</p>
        </div>
      </div>
    </div>
  )
}
