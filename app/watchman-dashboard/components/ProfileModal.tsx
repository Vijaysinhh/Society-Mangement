'use client'

import { X, LogOut, Settings, Edit2, Phone, User, Bell, Lock, Eye, AlertCircle, Shield, Smartphone, Info, Clock, RefreshCw, Download, Trash2, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  watchmanName: string
  watchmanPhone: string
  onLogout: () => void
}

export function ProfileModal({
  isOpen,
  onClose,
  watchmanName,
  watchmanPhone,
  onLogout,
}: ProfileModalProps) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState({
    visitorAlerts: true,
    decisionAlerts: true,
    dutyReminders: true,
    reportDigest: true,
  })
  const [language, setLanguage] = useState('en')

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl z-50 border border-slate-200 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0">
          <h3 className="font-bold text-slate-900">Profile & Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Profile Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {watchmanName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{watchmanName}</p>
                <p className="text-xs text-slate-600">Watchman</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">{watchmanPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">08:00 - 16:00</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Section */}
          <button
            onClick={() => setShowEditProfile(!showEditProfile)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <Edit2 className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-semibold text-sm text-slate-900">Edit Profile</p>
                <p className="text-xs text-slate-600">Update your information</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${showEditProfile ? 'rotate-180' : ''}`} />
          </button>

          {showEditProfile && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="text"
                defaultValue={watchmanName}
                placeholder="Name"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                defaultValue={watchmanPhone}
                placeholder="Phone"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700">
                Save Profile
              </button>
            </div>
          )}

          {/* Change Password Section */}
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <Lock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-sm text-slate-900">Change Password</p>
                <p className="text-xs text-slate-600">Update your password</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${showChangePassword ? 'rotate-180' : ''}`} />
          </button>

          {showChangePassword && (
            <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <input type="password" placeholder="Current Password" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
              <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
              <input type="password" placeholder="Confirm Password" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
              <button className="w-full bg-orange-600 text-white py-2 rounded text-sm font-medium hover:bg-orange-700">
                Update Password
              </button>
            </div>
          )}

          {/* Notifications Section */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <Bell className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-semibold text-sm text-slate-900">Notifications</p>
                <p className="text-xs text-slate-600">Manage preferences</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${showNotifications ? 'rotate-180' : ''}`} />
          </button>

          {showNotifications && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.visitorAlerts}
                  onChange={(e) => setNotifications({...notifications, visitorAlerts: e.target.checked})}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-slate-900">Visitor Alerts</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.decisionAlerts}
                  onChange={(e) => setNotifications({...notifications, decisionAlerts: e.target.checked})}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-slate-900">Decision Alerts</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.dutyReminders}
                  onChange={(e) => setNotifications({...notifications, dutyReminders: e.target.checked})}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-slate-900">Duty Reminders</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.reportDigest}
                  onChange={(e) => setNotifications({...notifications, reportDigest: e.target.checked})}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-slate-900">Report Digest</span>
              </label>
            </div>
          )}

          {/* Language Selection */}
          <div className="p-3 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              Language
            </p>
            <div className="space-y-2">
              {(['en', 'hi', 'mr'] as const).map(lang => (
                <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={language === lang}
                    onChange={() => setLanguage(lang)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-slate-900">
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <p className="font-semibold text-sm text-red-900">Logout</p>
              <p className="text-xs text-red-700">Sign out from dashboard</p>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
