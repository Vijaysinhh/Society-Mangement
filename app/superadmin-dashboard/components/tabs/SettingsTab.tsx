'use client'

import { useState } from 'react'
import { User, Mail, Phone, Building, LogOut, Bell, Shield, HelpCircle, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function SettingsTab() {
  const [profileData] = useState({
    name: 'Super Admin',
    email: 'superadmin@vms.com',
    phone: '+91 9999999999',
    organization: 'Visitor Management System',
    avatar: 'SA',
  })

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordChange = () => {
    setPasswordError('')
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    // Show success message
    setPasswordSuccess(true)
    setTimeout(() => {
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordSuccess(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar Circle */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">{profileData.avatar}</span>
          </div>
          
          {/* Profile Info */}
          <h2 className="text-xl font-bold text-slate-900">{profileData.name}</h2>
          <p className="text-sm text-slate-500">Platform Administrator</p>
        </div>

        {/* Profile Details */}
        <div className="mt-6 space-y-3 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Email</p>
              <p className="text-sm font-medium text-slate-900">{profileData.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Phone</p>
              <p className="text-sm font-medium text-slate-900">{profileData.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Organization</p>
              <p className="text-sm font-medium text-slate-900">{profileData.organization}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase px-1">Preferences</h3>
        
        {/* Notification Settings */}
        <button className="w-full flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors text-left">
          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">Manage alerts and notifications</p>
          </div>
        </button>

        {/* Security Settings */}
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors text-left"
        >
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">Change Password</p>
            <p className="text-xs text-slate-500">Update your account password</p>
          </div>
        </button>

        {/* Help & Support */}
        <button className="w-full flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors text-left">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">Help & Support</p>
            <p className="text-xs text-slate-500">Documentation and support</p>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button className="w-full flex items-center gap-3 bg-red-50 rounded-lg border border-red-200 p-4 hover:bg-red-100 transition-colors text-left mt-6">
        <LogOut className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-red-700">Logout</p>
          <p className="text-xs text-red-600">Sign out from your account</p>
        </div>
      </button>

      {/* App Version */}
      <div className="text-center pt-4">
        <p className="text-xs text-slate-500">VMS Platform v1.0.0</p>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => !passwordSuccess && setShowPasswordModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {passwordSuccess ? (
              <div className="py-8 text-center">
                <div className="flex justify-center mb-3">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Password Updated</h3>
                <p className="text-sm text-slate-600 mt-2">Your password has been changed successfully</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-900 block mb-2">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-900 block mb-2">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        placeholder="Enter new password (min 8 characters)"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-900 block mb-2">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{passwordError}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
