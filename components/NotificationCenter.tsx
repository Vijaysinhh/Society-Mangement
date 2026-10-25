'use client'

import { useState } from 'react'
import { X, Check, CheckCircle2, AlertCircle, Clock, Wrench, Zap, Bell } from 'lucide-react'
import type { Notification } from '@/hooks/useNotifications'

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClose?: () => void
  isOpen?: boolean
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  isOpen = true
}: NotificationCenterProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status-changed':
        return <Zap className="w-5 h-5 text-amber-600" />
      case 'work-started':
        return <Wrench className="w-5 h-5 text-blue-600" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'issue-update':
        return <Clock className="w-5 h-5 text-cyan-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:static sm:bg-transparent sm:p-0">
      <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden sm:shadow-none sm:border-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Issue Updates
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {unreadCount} new update{unreadCount !== 1 ? 's' : ''}
              </p>
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded transition-colors"
              >
                <CheckAll className="w-3 h-3" />
                Mark All Read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No updates yet</p>
              <p className="text-slate-400 text-xs mt-1">New issue updates will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                    notification.read ? 'bg-white' : 'bg-blue-50'
                  }`}
                  onClick={() => {
                    setExpanded(expanded === notification.id ? null : notification.id)
                    if (!notification.read) {
                      onMarkAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 line-clamp-2">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span>{notification.issueName}</span>
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>

                      {/* Expanded View */}
                      {expanded === notification.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <p className="text-sm font-medium text-slate-900">Full Update:</p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.status && (
                            <div className="flex items-center gap-2 pt-2">
                              <span className="text-xs font-medium text-slate-600">Status:</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                notification.status === 'completed' ? 'bg-green-100 text-green-700' :
                                notification.status === 'started' ? 'bg-amber-100 text-amber-700' :
                                notification.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {notification.status.replace('-', ' ').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
