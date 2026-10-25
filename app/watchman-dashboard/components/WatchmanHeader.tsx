'use client'

import { Bell, LogOut, Settings, User } from 'lucide-react'

interface WatchmanHeaderProps {
  watchmanName: string
  notificationCount: number
  onNotificationClick: () => void
  onProfileClick: () => void
}

export function WatchmanHeader({
  watchmanName,
  notificationCount,
  onNotificationClick,
  onProfileClick,
}: WatchmanHeaderProps) {
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left - Greeting */}
        <div>
          <p className="text-xs text-slate-500">{ greeting}</p>
          <h1 className="text-lg font-bold text-slate-900">{watchmanName}</h1>
        </div>

        {/* Right - Notification + Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Profile Ball */}
          <button
            onClick={onProfileClick}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-shadow"
            aria-label="Profile"
            title="Profile & Settings"
          >
            {watchmanName.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
