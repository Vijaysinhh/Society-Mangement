'use client'

import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CreateAdminFormProps {
  societyName: string
  onClose: () => void
  onSubmit: (adminData: { username: string; password: string; phone: string; holderName: string; postName: string }) => Promise<void>
  isLoading?: boolean
}

export default function CreateAdminForm({ societyName, onClose, onSubmit, isLoading = false }: CreateAdminFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    holderName: '',
    postName: '',
  })
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!formData.postName.trim()) {
      setError('Post name is required')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Create Admin Account</h3>
          <button
            onClick={onClose}
            aria-label="Close create admin form"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900">
              Creating admin account for <span className="font-semibold">{societyName}</span>. Username and password are required for login.
            </p>
          </div>

          {/* Username - Required for login */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">
              Username * <span className="text-xs text-slate-500">(for login)</span>
            </label>
            <Input
              placeholder="e.g., admin_society"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') })}
              className="h-10 rounded-lg border-slate-300 bg-white"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">3+ characters. Letters, numbers, underscore, hyphen only.</p>
          </div>

          {/* Phone - Required */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-10 rounded-lg border-slate-300 bg-white"
              disabled={isLoading}
            />
          </div>

          {/* Password - Required for login */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">
              Password * <span className="text-xs text-slate-500">(for login)</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-10 rounded-lg border-slate-300 bg-white pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Minimum 8 characters. Use a mix of letters, numbers, and symbols.</p>
          </div>

          {/* Post */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">
              Post Name *
            </label>
            <Input
              placeholder="e.g., Treasurer"
              value={formData.postName}
              onChange={(e) => setFormData({ ...formData, postName: e.target.value })}
              className="h-10 rounded-lg border-slate-300 bg-white"
              disabled={isLoading}
            />
          </div>

          {/* Holder - Optional */}
          <div>
            <label className="text-sm font-medium text-slate-900 block mb-2">
              Current Holder <span className="text-xs text-slate-500">(optional)</span>
            </label>
            <Input
              placeholder="e.g., Rajesh Kumar"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              className="h-10 rounded-lg border-slate-300 bg-white"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
