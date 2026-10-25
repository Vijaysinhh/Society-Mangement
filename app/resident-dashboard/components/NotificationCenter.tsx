'use client'

import { X, Check, Eye } from 'lucide-react'
import { useState } from 'react'

// export interface Notification {
  id: string
  type: 'visitor' | 'bill' | 'maintenance' | 'announcement'
  title: string
  description: string
  timestamp: Date
  read: boolean
  actionButtons?: { label: string; onClick: () => void }[]
  icon?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAllRead?: () => void
  onDismiss?: (id: string) => void
}

// export default function NotificationCenter({
  notifications,
  onMarkAllRead,
  onDismiss,
}: NotificationCenterProps) {
  const [markedRead, setMarkedRead] = useState<Set<string>>(new Set())

  const groupedNotifications = {
    today: notifications.filter(n => {
      const today = new Date()
      const notifDate = new Date(n.timestamp)
      return notifDate.toDateString() === today.toDateString()
    }),
    yesterday: notifications.filter(n => {
      const today = new Date()
      const yesterday = new Date(today.getTime() - 86400000)
      const notifDate = new Date(n.timestamp)
      return notifDate.toDateString() === yesterday.toDateString()
    }),
    older: notifications.filter(n => {
      const today = new Date()
      const notifDate = new Date(n.timestamp)
      return notifDate.getTime() < today.getTime() - 86400000
    }),
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'visitor':
        return '🚨'
      case 'bill':
        return '💰'
      case 'maintenance':
        return '🔧'
      case 'announcement':
        return '📢'
      default:
        return '📬'
    }
  }

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-slate-50'
    switch (type) {
      case 'visitor':
        return 'bg-red-50 border-l-4 border-l-red-500'
      case 'bill':
        return 'bg-orange-50 border-l-4 border-l-orange-500'
      case 'maintenance':
        return 'bg-blue-50 border-l-4 border-l-blue-500'
      default:
        return 'bg-white'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(date).toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read && !markedRead.has(n.id)).length

  const NotificationItem = ({ notif }: { notif: Notification }) => (
    <div
      className={`p-4 border-b border-slate-200 last:border-b-0 hover:bg-opacity-75 transition-colors cursor-pointer ${getNotificationColor(notif.type, notif.read || markedRead.has(notif.id))}`}
    >
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{getNotificationIcon(notif.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-sm ${notif.read || markedRead.has(notif.id) ? 'text-slate-700' : 'text-slate-900'}`}
              >
                {notif.title}
              </p>
              <p className="text-xs text-slate-600 mt-1">{notif.description}</p>
              <p className="text-xs text-slate-500 mt-2">{formatTime(notif.timestamp)}</p>
            </div>
            {!(notif.read || markedRead.has(notif.id)) && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>

          {notif.actionButtons && notif.actionButtons.length > 0 && (
            <div className="flex gap-2 mt-3">
              {notif.actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(notif.id)}
            className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        {unreadCount > 0 && (
          <button
            onClick={() => {
              const newMarked = new Set(markedRead)
              notifications.forEach(n => {
                if (!n.read) newMarked.add(n.id)
              })
              setMarkedRead(newMarked)
              onMarkAllRead?.()
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedNotifications.today.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase px-4 py-2">Today</p>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {groupedNotifications.today.map(notif => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.yesterday.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase px-4 py-2">Yesterday</p>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {groupedNotifications.yesterday.map(notif => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.older.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase px-4 py-2">Older</p>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {groupedNotifications.older.map(notif => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
