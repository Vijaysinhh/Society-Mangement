'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Phone, Clock } from 'lucide-react'

interface Visitor {
  id: string
  name: string
  purpose: 'Delivery' | 'Guest' | 'Courier' | 'Maintenance' | 'Other'
  phone: string
  gateTime: Date
  loggedByWatchman: {
    name: string
    id: string
  }
  photo?: string
  status: 'pending' | 'approved' | 'denied'
}

interface VisitorsAtGateWidgetProps {
  onViewAll?: () => void
  onApprove?: (visitor: Visitor) => void
  onDeny?: (visitor: Visitor) => void
}

// Mock data - ONLY for Unit A-101 (current resident's unit)
const mockTodayVisitors: Visitor[] = [
  {
    id: 'v1',
    name: 'Priya',
    purpose: 'Delivery',
    phone: '9876543210',
    gateTime: new Date(Date.now() - 30000), // 30 seconds ago
    loggedByWatchman: {
      name: 'Ramesh Kumar',
      id: 'w1',
    },
    status: 'pending',
  },
  {
    id: 'v2',
    name: 'Amit',
    purpose: 'Guest',
    phone: '9123456789',
    gateTime: new Date(Date.now() - 60000), // 60 seconds ago
    loggedByWatchman: {
      name: 'Vikram Singh',
      id: 'w2',
    },
    status: 'pending',
  },
]

// Placeholder avatar generator (initials)
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function VisitorsAtGateWidget({ onViewAll, onApprove, onDeny }: VisitorsAtGateWidgetProps) {
  const [visitors, setVisitors] = useState(mockTodayVisitors)
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({})

  // 2-minute time limit
  const TIME_LIMIT_MS = 2 * 60 * 1000

  // Calculate and update time remaining for all visitors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const remaining: Record<string, number> = {}
      let hasExpired = false

      visitors.forEach(visitor => {
        const elapsedMs = now - visitor.gateTime.getTime()
        const remainingMs = Math.max(0, TIME_LIMIT_MS - elapsedMs)
        remaining[visitor.id] = remainingMs

        if (remainingMs === 0 && visitor.status === 'pending') {
          hasExpired = true
        }
      })

      setTimeRemaining(remaining)

      // Auto-reject if time expired
      if (hasExpired) {
        setVisitors(prev =>
          prev.map(v => {
            if (v.status === 'pending' && (remaining[v.id] || 0) === 0) {
              return { ...v, status: 'denied' }
            }
            return v
          })
        )
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [visitors])

  const pendingVisitors = visitors.filter(v => v.status === 'pending')

  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  const getTimerColor = (ms: number): string => {
    if (ms === 0) return 'text-red-600'
    if (ms < 60000) return 'text-red-600' // < 1 min = red
    if (ms < 90000) return 'text-yellow-600' // < 1.5 min = yellow
    return 'text-green-600' // > 1.5 min = green
  }

  const handleApprove = (visitor: Visitor) => {
    setVisitors(prev => prev.map(v => v.id === visitor.id ? { ...v, status: 'approved' } : v))
    onApprove?.(visitor)
  }

  const handleDeny = (visitor: Visitor) => {
    setVisitors(prev => prev.map(v => v.id === visitor.id ? { ...v, status: 'denied' } : v))
    onDeny?.(visitor)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h3 className="font-semibold text-slate-900">Visitors at Gate</h3>
          {pendingVisitors.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
              {pendingVisitors.length} Pending
            </span>
          )}
        </div>
      </div>

      {/* Visitors List */}
      {pendingVisitors.length > 0 ? (
        <div className="space-y-3 mb-4">
          {pendingVisitors.slice(0, 3).map(visitor => (
            <div
              key={visitor.id}
              className="border border-slate-200 rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {/* Visitor Card - Horizontal Layout */}
              <div className="flex gap-3">
                {/* Photo - Left */}
                <div className="flex-shrink-0">
                  {visitor.photo ? (
                    <img
                      src={visitor.photo}
                      alt={visitor.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-purple-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">{getInitials(visitor.name)}</span>
                    </div>
                  )}
                </div>

                {/* Details - Right */}
                <div className="flex-1 min-w-0">
                  {/* Name and Purpose */}
                  <div className="mb-1">
                    <p className="font-semibold text-slate-900 truncate">{visitor.name}</p>
                    <p className="text-xs text-slate-600">{visitor.purpose}</p>
                  </div>

                  {/* Phone and Watchman */}
                  <div className="text-xs text-slate-600 space-y-0.5 mb-2">
                    <p>Phone: <span className="font-medium">{visitor.phone}</span></p>
                    <p>Logged by: <span className="font-medium">{visitor.loggedByWatchman.name}</span></p>
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-600">
                      {visitor.gateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${getTimerColor(timeRemaining[visitor.id] || 0)}`}>
                      <Clock className="w-3 h-3" />
                      {formatTimeRemaining(timeRemaining[visitor.id] || 0)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(visitor)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleDeny(visitor)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition-colors"
                    >
                      ✗ Deny
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-4">
          <p className="text-sm font-semibold text-green-700">No pending visitors</p>
          <p className="text-xs text-green-600 mt-1">All visitors have been approved or denied</p>
        </div>
      )}

      {/* View All Link */}
      <button
        onClick={onViewAll}
        className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm py-2 transition-colors"
      >
        View All Visitors
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
