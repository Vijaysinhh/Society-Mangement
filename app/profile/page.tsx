'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, EyeOff, LogOut, Mail, Phone, Lock, Bell, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('personal')
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Admin User',
    email: 'admin@society.com',
    phone: '+91 98765 43210',
    address: '123 Society Lane, Apt 4B, City, State 12345',
  })

  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
  })

  // Track window width for back button visibility
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field: string, value: string) => {
    setSecurityInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (key: 'emailAlerts' | 'pushNotifications' | 'smsAlerts' | 'weeklyReports') => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = () => {
    router.push('/')
  }

  const handleBack = () => {
    router.push('/society-admin')
  }

  const menuItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const isDesktop = windowWidth >= 1024

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Header with Back Button - Shows ONLY when width >= 1024px */}
      {isDesktop && (
        <header className="sticky top-0 z-50 w-full bg-white border-b-4 border-indigo-600 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-14 h-14 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors active:scale-95 shadow-lg flex-shrink-0"
              aria-label="Go back to society admin"
              title="Back to Society Admin"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - Desktop Only */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden sticky top-24">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/30 mx-auto mb-3">
                  AU
                </div>
                <h2 className="text-lg font-bold">{personalInfo.fullName}</h2>
                <p className="text-indigo-100 text-sm mt-1">Administrator</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-indigo-100">Online</span>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="divide-y divide-slate-200">
                {menuItems.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeMenu === item.id
                          ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-3 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Menu - Mobile Only */}
            <div className="lg:hidden grid grid-cols-3 gap-2 bg-white rounded-lg border border-slate-200 p-2">
              {menuItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition-colors ${
                      activeMenu === item.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Personal Information Section */}
            {activeMenu === 'personal' && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Personal Information
                  </h2>
                </div>

                <div className="p-6">
                  {isEditingPersonal ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={personalInfo.fullName}
                          onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                        <textarea
                          value={personalInfo.address}
                          onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                          placeholder="Enter your address"
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setIsEditingPersonal(false)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingPersonal(false)}
                          className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 active:scale-95 transition-all font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <User className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 font-medium">Full Name</p>
                          <p className="text-sm font-medium text-slate-900">{personalInfo.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 font-medium">Email</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{personalInfo.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 font-medium">Phone</p>
                          <p className="text-sm font-medium text-slate-900">{personalInfo.phone}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 font-medium mb-2">Address</p>
                        <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">{personalInfo.address}</p>
                      </div>
                      <button
                        onClick={() => setIsEditingPersonal(true)}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeMenu === 'security' && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    Change Password
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={securityInfo.currentPassword}
                          onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={securityInfo.newPassword}
                        onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={securityInfo.confirmPassword}
                        onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeMenu === 'notifications' && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Notification Preferences
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      { key: 'emailAlerts' as const, label: 'Email Alerts', description: 'Important updates via email' },
                      { key: 'pushNotifications' as const, label: 'Push Notifications', description: 'Instant notifications' },
                      { key: 'smsAlerts' as const, label: 'SMS Alerts', description: 'Critical alerts via SMS' },
                      { key: 'weeklyReports' as const, label: 'Weekly Reports', description: 'Summary every week' },
                    ].map(item => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                        onClick={() => handleNotificationChange(item.key)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={() => handleNotificationChange(item.key)}
                          className="w-5 h-5 cursor-pointer accent-indigo-600 ml-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Logout Button */}
            <div className="lg:hidden">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 active:scale-95 transition-all font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
