'use client'

import React, { ReactNode, useState } from 'react'
import { Menu, X, Search } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
  currentView: 'dashboard' | 'properties' | 'finances' | 'issues' | 'watchman' | 'visitors' | 'community'
  onNavigate: (view: 'dashboard' | 'properties' | 'finances' | 'issues' | 'watchman' | 'visitors' | 'community') => void
  societyName: string
  notificationCount: number
  onNotificationClick: () => void
  onProfileClick: () => void
  onSearch?: (query: string) => void
}

export default function AdminLayout({
  children,
  currentView,
  onNavigate,
  societyName,
  notificationCount,
  onNotificationClick,
  onProfileClick,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '🏠' },
    { id: 'properties' as const, label: 'Properties', icon: '🏢' },
    { id: 'finances' as const, label: 'Finances', icon: '💰' },
    { id: 'issues' as const, label: 'Issues', icon: '⚠️' },
    { id: 'watchman' as const, label: 'Watchman', icon: '🔒' },
    { id: 'visitors' as const, label: 'Visitors', icon: '👥' },
    { id: 'community' as const, label: 'Community', icon: '👥' },
  ]

  const handleNavClick = (view: any) => {
    onNavigate(view)
    setSidebarOpen(false)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Left: Hamburger + Society Name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-slate-900" />
            </button>
            <h1 className="text-base font-bold text-slate-900 truncate">{societyName}</h1>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search units, residents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-500"
            />
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Profile Icon */}
            <button
              onClick={onProfileClick}
              className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold hover:bg-purple-700 transition-colors text-sm"
              aria-label="Profile menu"
            >
              A
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 z-50 overflow-y-auto shadow-lg ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 p-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  currentView === item.id
                    ? 'bg-purple-100 text-purple-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
