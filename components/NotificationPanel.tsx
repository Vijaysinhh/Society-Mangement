'use client'

import { X, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useState } from 'react'

interface Alert {
  id: string
  type: 'action-needed' | 'upcoming' | 'milestone' | 'success' | 'overdue'
  severity: 'critical' | 'high' | 'medium' | 'low'
  unit: string
  owner: string
  amount?: number
  daysOverdue?: number
  message: string
  date: string
  read?: boolean
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  alerts: Alert[]
  onMarkAsRead?: (alertId: string) => void
  onMarkAllAsRead?: () => void
}

export default function NotificationPanel({
  isOpen,
  onClose,
  alerts = [],
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'action-needed'>('all')

  if (!isOpen) return null

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read
    if (filter === 'critical') return alert.severity === 'critical'
    if (filter === 'action-needed') return alert.type === 'action-needed'
    return true
  })

  const unreadCount = alerts.filter(a => !a.read).length
  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-amber-100 text-amber-800'
      case 'high':
        return 'bg-amber-100 text-amber-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-amber-600'
      case 'high':
        return 'bg-amber-600'
      case 'medium':
        return 'bg-blue-600'
      default:
        return 'bg-green-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action-needed':
        return <AlertCircle className="w-4 h-4" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />
      case 'upcoming':
        return <Clock className="w-4 h-4" />
      case 'milestone':
        return <CheckCircle2 className="w-4 h-4" />
      case 'success':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 text-lg sm:text-xl">Notifications</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              {unreadCount > 0 ? (
                <>
                  <span className="font-semibold text-slate-700">{unreadCount}</span> unread
                  {criticalCount > 0 && (
                    <>
                      <span className="mx-2 text-slate-400">•</span>
                      <span className="font-semibold text-red-600">{criticalCount}</span> critical
                    </>
                  )}
                </>
              ) : (
                <span className="text-slate-600">All caught up!</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0 ml-3"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-3 sm:p-4 border-b border-slate-200 overflow-x-auto bg-white sticky top-20 sm:top-16">
          {['all', 'unread', 'critical', 'action-needed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'action-needed' ? 'Action Needed' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-block px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">{unreadCount}</span>
              )}
              {f === 'critical' && criticalCount > 0 && (
                <span className="ml-1.5 inline-block px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">{criticalCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredAlerts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onMarkAsRead?.(alert.id)}
                  className={`p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${
                    alert.read ? 'bg-white border-slate-200' : 'bg-indigo-50/50 border-indigo-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Severity Badge */}
                    <div className={`flex-shrink-0 mt-1 p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getTypeIcon(alert.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm sm:text-base">Unit {alert.unit}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{alert.owner}</p>
                        </div>
                        {!alert.read && (
                          <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${getSeverityBadgeColor(alert.severity)} mt-1.5`} />
                        )}
                      </div>

                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">{alert.message}</p>

                      {alert.amount && (
                        <div className="mt-2.5 flex items-baseline gap-2">
                          <p className="text-xs text-slate-600">Amount:</p>
                          <p className="text-sm font-bold text-red-600">₹{alert.amount.toLocaleString()}</p>
                        </div>
                      )}

                      {alert.daysOverdue && (
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <p className="text-xs text-red-600 font-medium">{alert.daysOverdue} days overdue</p>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 mt-3">{alert.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 sm:p-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-slate-200" />
              <div>
                <p className="text-slate-600 font-semibold text-base">No notifications</p>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 sticky bottom-0">
            <button
              onClick={onMarkAllAsRead}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors active:scale-95 shadow-sm"
            >
              Mark all {unreadCount} as read
            </button>
          </div>
        )}
      </div>
    </>
  )
}
