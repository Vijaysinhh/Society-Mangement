'use client'

import { ChevronLeft, Menu, Bell } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  onBack?: () => void
  customMenu?: boolean
  onMenuToggle?: () => void
  showProfile?: boolean
  onProfileClick?: () => void
  hideMenu?: boolean
  notificationCount?: number
  onNotificationClick?: () => void
}

export default function MobileLayout({
  children,
  title = 'Platform Admin',
  subtitle = 'Manage societies & workspaces',
  showBack = false,
  backHref = '/',
  onBack,
  customMenu = false,
  onMenuToggle,
  showProfile = false,
  onProfileClick,
  hideMenu = false,
  notificationCount = 0,
  onNotificationClick,
}: MobileLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      window.history.back()
    }
  }

  const toggleMenu = () => {
    if (customMenu && onMenuToggle) {
      onMenuToggle()
    } else {
      setMobileMenuOpen(!mobileMenuOpen)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          {/* Left Side - Menu Button */}
          {!hideMenu && (
            <button
              onClick={toggleMenu}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          )}
          {hideMenu && <div className="w-10" />}

          {/* Center - Title */}
          <div className="flex-1 text-center px-2 sm:px-3 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-slate-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Right Side - Notification Indicator & Profile Button */}
          <div className="flex items-center gap-2 ml-3">
            {notificationCount && notificationCount > 0 && onNotificationClick && (
              <button
                onClick={onNotificationClick}
                className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            {showProfile ? (
              <button
                onClick={onProfileClick}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 active:scale-95 transition-all font-bold text-sm shadow-sm"
                aria-label="Profile"
              >
                AK
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
