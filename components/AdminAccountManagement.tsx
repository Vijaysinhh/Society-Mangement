'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff, Copy, CheckCircle2, AlertCircle, Lock, LogOut, Clock } from 'lucide-react'
import { getCredentialManager, OrganizationalAdminAccount } from '@/lib/credentialManagementSystem'

export default function AdminAccountManagement() {
  const [adminAccounts, setAdminAccounts] = useState<OrganizationalAdminAccount[]>([])
  const [societyId, setSocietyId] = useState<string>('greenpark-society')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Form state for creating new admin account
  const [formData, setFormData] = useState({
    adminLabel: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const credentialManager = getCredentialManager()

  useEffect(() => {
    loadAdminAccounts()
  }, [societyId])

  const loadAdminAccounts = () => {
    const accounts = credentialManager.getAdminAccountsForSociety(societyId)
    setAdminAccounts(accounts)
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.adminLabel.trim()) {
      alert('Please enter an admin label (e.g., Admin_1)')
      return
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const newAccount = credentialManager.createAdminAccount(
      societyId,
      formData.adminLabel,
      formData.email,
      formData.password,
      'superadmin@platform.com' // In real app, use actual SuperAdmin email
    )

    if (newAccount) {
      loadAdminAccounts()
      setFormData({ adminLabel: '', email: '', password: '', confirmPassword: '' })
      setShowCreateForm(false)
      alert('Admin account created successfully. Share these credentials with the responsible person.')
    } else {
      alert('Failed to create admin account. Email might already be in use.')
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(type === 'email' ? text : 'password')
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const togglePasswordVisibility = (accountId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [accountId]: !prev[accountId],
    }))
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Account Management</h1>
          <p className="text-slate-600">Create and manage organizational admin accounts for {societyId}</p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Active Accounts</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{adminAccounts.length}/4</p>
          </div>

          <div className="bg-white rounded-lg border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-semibold text-slate-700">Transfer Ready</p>
            </div>
            <p className="text-xs text-slate-600 mt-2">Manual credential transfer enabled</p>
          </div>

          <div className="bg-white rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-slate-700">Activity Logged</p>
            </div>
            <p className="text-xs text-slate-600 mt-2">All access tracked for security</p>
          </div>
        </div>

        {/* Create Account Button */}
        {adminAccounts.length < 4 && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Admin Account ({adminAccounts.length}/4)
            </button>
          </div>
        )}

        {adminAccounts.length >= 4 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-amber-800 text-sm font-medium">Maximum 4 admin accounts per society reached. Delete one to create another.</p>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Admin Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Label</label>
                <input
                  type="text"
                  placeholder="e.g., Admin_1, Admin_2"
                  value={formData.adminLabel}
                  onChange={e => setFormData({ ...formData, adminLabel: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Identifier for this admin position</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email (Login Username)</label>
                <input
                  type="email"
                  placeholder="admin@society.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">This will be the login email - share with designated admin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Initial Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Transfer Instructions:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Share email and password with the designated admin</li>
                  <li>They should login and immediately change the password</li>
                  <li>All previous sessions will be terminated automatically</li>
                  <li>All their actions will be logged for security tracking</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Active Admin Accounts</h2>
          {adminAccounts.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <p className="text-slate-600">No admin accounts created yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminAccounts.map(account => (
                <div
                  key={account.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{account.adminLabel}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(account.status)}`}>
                          {account.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Admin ID: {account.id.substring(0, 12)}...</p>
                    </div>
                  </div>

                  {/* Credentials Section */}
                  <div className="space-y-3 mb-4 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Login Email</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-white px-2 py-1 rounded border border-slate-200 font-mono text-slate-900">
                          {account.email}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.email, 'email')}
                          className="p-2 hover:bg-blue-100 rounded transition-colors"
                          title="Copy email"
                        >
                          {copiedEmail === account.email ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      Password: Only visible to creator. Share securely with designated admin for manual transfer.
                    </p>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Created: {new Date(account.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Last Password Change: {new Date(account.lastPasswordChangeAt).toLocaleDateString()}
                    </div>
                    {account.currentResponsible && (
                      <div className="flex items-center gap-2 text-blue-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Currently: {account.currentResponsible}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => alert('Delete functionality can be implemented to allow account deactivation')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
