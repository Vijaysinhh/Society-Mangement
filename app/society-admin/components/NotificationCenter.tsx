'use client'

import { useEffect, useState } from 'react'
import { X, AlertTriangle, Bell, CheckCircle, Info } from 'lucide-react'

export interface Notification {
  id: string
  type: 'overdue' | 'payment' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

export default function NotificationCenter({ societyId = '' }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem('maintenance_notifications')
    if (stored) {
      setNotifications(JSON.parse(stored))
    }

    // Listen for maintenance fee sync events
    const handleSync = () => {
      generateNotifications()
    }

    window.addEventListener('maintenanceFeeSync', handleSync)
    return () => window.removeEventListener('maintenanceFeeSync', handleSync)
  }, [])

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem('maintenance_notifications', JSON.stringify(notifications))
    
    // Count unread
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const generateNotifications = () => {
    // This would normally check for overdue payments and generate notifications
    const stats = JSON.parse(localStorage.getItem('maintenance_stats') || '{}')
    
    if (stats.overdueUnits > 0) {
      const newNotification: Notification = {
        id: `overdue_${Date.now()}`,
        type: 'overdue',
        title: 'Overdue Payments Alert',
        message: `${stats.overdueUnits} units have overdue payments totaling ₹${stats.totalOverdue?.toLocaleString() || 0}`,
        timestamp: Date.now(),
        read: false,
      }
      
      setNotifications(prev => {
        // Check if similar notification exists in last 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        const recentSimilar = prev.find(n => 
          n.type === 'overdue' && n.timestamp > oneHourAgo
        )
        
        if (!recentSimilar) {
          return [newNotification, ...prev].slice(0, 50)
        }
        return prev
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-200 border-l-red-600'
      case 'payment':
        return 'bg-green-50 border-green-200 border-l-green-600'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 border-l-yellow-600'
      default:
        return 'bg-indigo-50 border-indigo-200 border-l-indigo-600'
    }
  }

  return (
    <div className="relative w-full">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2.5 rounded-lg hover:bg-slate-100 transition-colors active:scale-95"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-14 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="divide-y divide-slate-200">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="font-medium">No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-5 sm:p-6 border-l-4 cursor-pointer transition-colors hover:bg-slate-50 ${getBackgroundColor(notification.type)} ${
                    !notification.read ? 'opacity-100' : 'opacity-80'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-4 sm:gap-5">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{notification.title}</p>
                      <p className="text-xs text-slate-600 mt-1.5">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
