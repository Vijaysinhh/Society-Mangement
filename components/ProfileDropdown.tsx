'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Settings, User, HelpCircle, Lock, ChevronDown } from 'lucide-react'

interface ProfileDropdownProps {
  userName?: string
  userRole?: string
  userEmail?: string
  userInitials?: string
  userAvatar?: string
  isOnline?: boolean
  notificationCount?: number
  onLogout?: () => void
  onSettings?: () => void
  onProfile?: () => void
  onHelp?: () => void
  onSecurity?: () => void
}

export default function ProfileDropdown({
  userName = 'Society Admin',
  userRole = 'Administrator',
  userEmail = 'admin@society.com',
  userInitials = 'SA',
  userAvatar,
  isOnline = true,
  notificationCount = 0,
  onLogout,
  onSettings,
  onProfile,
  onHelp,
  onSecurity,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuItemClick = (callback?: () => void) => {
    if (callback) callback()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-colors active:scale-95"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-600"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-indigo-600">
              {userInitials}
            </div>
          )}

          {/* Online Status Indicator */}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          )}

          {/* Notification Badge */}
          {notificationCount > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-max h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-md">
              {notificationCount > 9 ? '9+' : notificationCount}
            </div>
          )}
        </div>

        {/* Chevron Down Icon */}
        <ChevronDown
          className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* User Info Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-4 border-b border-indigo-200">
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {userInitials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{userName}</h3>
                  {isOnline && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Online
                    </span>
                  )}
                </div>
                <p className="text-sm text-indigo-700 font-medium">{userRole}</p>
                <p className="text-xs text-indigo-600 truncate mt-0.5">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="py-2">
            {/* My Profile */}
            <button
              onClick={() => handleMenuItemClick(onProfile)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>My Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleMenuItemClick(onSettings)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>

            {/* Security */}
            <button
              onClick={() => handleMenuItemClick(onSecurity)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Security</span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => handleMenuItemClick(onHelp)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium border-b border-slate-200"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help & Support</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => handleMenuItemClick(onLogout)}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
