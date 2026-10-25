'use client'

import React, { useEffect, useState } from 'react'
import { Mail, MapPin, Calendar, Lock, LogOut, Edit2, Settings, Shield, ChevronRight } from 'lucide-react'

interface Admin {
  id: string
  name: string
  username: string
  role: string
  society: string
  memberSince: string
  avatar: string
  phone: string
}

interface ProfileMobileProps {
  onLogout?: () => void
}

export default function ProfileMobile({ onLogout }: ProfileMobileProps) {
  const [admin, setAdmin] = useState<Admin>({ id: '', name: '', username: '', role: '', society: '', memberSince: '', avatar: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [editName, setEditName] = useState(admin.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/society-admin/context')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not load profile')
        return result.data
      })
      .then(({ account, society }) => {
        if (cancelled) return
        const name = account.holderName || account.postName
        setAdmin({
          id: account.id,
          name,
          username: account.username,
          role: account.postName,
          society: society.name,
          memberSince: account.createdAt ? new Date(account.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Not available',
          avatar: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase() || 'SA',
          phone: account.phone || 'Not provided',
        })
        setProfileError('')
      })
      .catch((error) => { if (!cancelled) setProfileError(error instanceof Error ? error.message : 'Could not load profile') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleEditProfile = () => {
    setEditName(admin.name)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (editName.trim()) {
      setSavingProfile(true)
      setProfileError('')
      setProfileSuccess('')
      try {
        const response = await fetch('/api/society-admin/context', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ holderName: editName }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not update profile')
        const name = result.data.holderName
        setAdmin((current) => ({ ...current, name, avatar: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase() || 'SA' }))
        setProfileSuccess('Profile updated successfully.')
        setIsEditModalOpen(false)
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : 'Could not update profile')
      } finally {
        setSavingProfile(false)
      }
    }
  }

  const handleChangePassword = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
    setIsPasswordModalOpen(true)
  }

  const handleSavePassword = async () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      setSavingPassword(true)
      setPasswordError('')
      try {
        const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not change password')
        setPasswordSuccess('Password changed successfully.')
        setIsPasswordModalOpen(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } catch (error) {
        setPasswordError(error instanceof Error ? error.message : 'Could not change password')
      } finally {
        setSavingPassword(false)
      }
    }
  }

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true)
  }

  const confirmLogout = async () => {
    setIsLogoutConfirmOpen(false)
    if (onLogout) {
      await onLogout()
    } else {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.assign('/admin-login')
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="space-y-6 p-4">
        {loading && <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">Loading account details...</p>}
        {profileError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
        {profileSuccess && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{profileSuccess}</p>}
        {passwordSuccess && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{passwordSuccess}</p>}
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl p-6 text-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto mb-4 border-4 border-white border-opacity-30">
            <span className="text-4xl font-bold text-white">{admin.avatar}</span>
          </div>
          <h2 className="text-2xl font-bold">{admin.name}</h2>
          <p className="text-purple-100 text-sm mt-1">{admin.role}</p>
          <p className="text-purple-100 text-xs mt-2 font-medium">{admin.society}</p>
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Account Details</h3>
          
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-medium">Username</p>
                <p className="text-sm font-semibold text-slate-900">{admin.username}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0 flex items-center justify-center text-xs">
                📱
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-medium">Phone</p>
                <p className="text-sm font-semibold text-slate-900">{admin.phone}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0 flex items-center justify-center text-xs">
                👔
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-medium">Role</p>
                <p className="text-sm font-semibold text-slate-900">{admin.role}</p>
              </div>
            </div>

            {/* Society */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-medium">Managing Society</p>
                <p className="text-sm font-semibold text-slate-900">{admin.society}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-medium">Member Since</p>
                <p className="text-sm font-semibold text-slate-900">{admin.memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Edit Profile Button */}
          <button
            onClick={handleEditProfile}
            className="w-full bg-white border-2 border-purple-600 text-purple-600 font-semibold py-3 px-4 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </button>

          {/* Change Password Button */}
          <button
            onClick={handleChangePassword}
            className="w-full bg-white border-2 border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Change Password
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 border-2 border-red-200 text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200"></div>

        {/* Administration Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide px-2">Administration</h3>
          
          {/* Settings */}
          <button className="w-full bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0 mt-0.5">
                <Settings className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Settings</p>
                <p className="text-xs text-slate-600 mt-0.5">Manage society settings and preferences</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
          </button>

          {/* User Management */}
          <button className="w-full bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">User Management</p>
                <p className="text-xs text-slate-600 mt-0.5">Add and manage admin users & roles</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
          </button>

          {/* Access Control */}
          <button className="w-full bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Access Control</p>
                <p className="text-xs text-slate-600 mt-0.5">Manage module access and permissions</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingProfile || !editName.trim()}
                  className="flex-1 bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Confirm new password"
                />
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600 font-medium">Passwords do not match</p>
              )}

              {newPassword && newPassword.length < 8 && (
                <p className="text-sm text-red-600 font-medium">Password must be at least 8 characters</p>
              )}

              {passwordError && <p role="alert" className="text-sm text-red-600 font-medium">{passwordError}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePassword}
                  disabled={savingPassword || !currentPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  className="flex-1 bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Logout Confirmation</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to logout? You will need to login again to access the admin panel.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
