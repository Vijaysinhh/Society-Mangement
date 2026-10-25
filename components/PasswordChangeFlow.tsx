'use client'

import { useState, useEffect } from 'react'
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, LogOut, Shield, AlertTriangle } from 'lucide-react'
import { getCredentialManager } from '@/lib/credentialManagementSystem'
import { useRouter } from 'next/navigation'

interface AdminSession {
  sessionId: string
  adminAccountId: string
  email: string
  loginTime: string
  adminLabel: string
  societyId: string
}

export default function PasswordChangeFlow() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [sessionInvalidated, setSessionInvalidated] = useState(false)
  const router = useRouter()
  const credentialManager = getCredentialManager()

  useEffect(() => {
    // Load admin session from localStorage
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('adminSession')
      if (sessionData) {
        try {
          setSession(JSON.parse(sessionData))
        } catch (error) {
          console.error('Failed to load session:', error)
          router.push('/admin-login')
        }
      } else {
        router.push('/admin-login')
      }
    }
  }, [router])

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++

    if (strength <= 2) setPasswordStrength('weak')
    else if (strength <= 4) setPasswordStrength('medium')
    else setPasswordStrength('strong')
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, newPassword: e.target.value })
    calculatePasswordStrength(e.target.value)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setMessage({ type: 'error', text: 'Session not found. Please login again.' })
      return
    }

    if (!formData.oldPassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter your current password' })
      return
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (formData.oldPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const getClientIpAddress = (): string => {
      if (typeof window !== 'undefined') {
        return window.location.hostname || 'localhost'
      }
      return 'unknown'
    }

    const result = credentialManager.changePassword(
      session.sessionId,
      formData.oldPassword,
      formData.newPassword,
      session.email,
      getClientIpAddress()
    )

    if (result.success) {
      setMessage({
        type: 'success',
        text: 'Password changed successfully! All other sessions have been terminated for security.',
      })
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setSessionInvalidated(true)

      // Clear session from localStorage after a delay to show the message
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminSession')
        }
        // Redirect to login
        router.push('/admin-login')
      }, 3000)
    } else {
      setMessage({ type: 'error', text: result.message })
    }

    setIsLoading(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 mt-4">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Secure Password Change</h1>
          </div>
          <p className="text-slate-600 text-sm">First login? Update your password immediately</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-4">
          {/* Session Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">Active Session</p>
            </div>
            <p className="text-sm text-blue-800">
              Account: <span className="font-mono font-bold">{session.adminLabel}</span>
            </p>
            <p className="text-sm text-blue-800">
              Email: <span className="font-mono">{session.email}</span>
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : message.type === 'warning'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : message.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'success'
                    ? 'text-green-800'
                    : message.type === 'warning'
                      ? 'text-amber-800'
                      : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Form */}
          {!sessionInvalidated && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    value={formData.oldPassword}
                    onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                    placeholder="Enter your current password"
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded ${
                            passwordStrength === 'weak'
                              ? 'bg-red-500'
                              : passwordStrength === 'medium'
                                ? i <= 2
                                  ? 'bg-amber-500'
                                  : 'bg-slate-200'
                                : 'bg-green-500'
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs font-semibold ${
                        passwordStrength === 'weak'
                          ? 'text-red-600'
                          : passwordStrength === 'medium'
                            ? 'text-amber-600'
                            : 'text-green-600'
                      }`}
                    >
                      Strength: {passwordStrength?.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900 font-semibold mb-2">Important:</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Password change will immediately logout all other sessions</li>
                  <li>• If you're replacing another admin, they will be logged out</li>
                  <li>• All login attempts are logged for security auditing</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password & Secure Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Success State */}
          {sessionInvalidated && (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Password Changed Successfully</h3>
              <p className="text-sm text-slate-600 mb-4">
                All other sessions have been terminated. You will be redirected to login shortly.
              </p>
              <button
                onClick={() => router.push('/admin-login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-slate-600 text-xs">
          <p>Your session and activities are being logged for security purposes</p>
        </div>
      </div>
    </div>
  )
}
