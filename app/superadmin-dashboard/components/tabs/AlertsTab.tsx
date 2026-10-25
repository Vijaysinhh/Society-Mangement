'use client'

import { useData } from '@/contexts/DataContext'
import { useState, useEffect } from 'react'
import { AlertCircle, Check, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActionableAlert {
  id: string
  type: 'inactive-society' | 'no-admin' | 'low-occupancy' | 'no-watchmen'
  severity: 'critical' | 'warning'
  title: string
  description: string
  societyId?: string
  societyName?: string
  actionText: string
  createdAt: Date
  read: boolean
}

export default function AlertsTab() {
  const { societies, admins } = useData()
  const [alerts, setAlerts] = useState<ActionableAlert[]>([])
  const [filterRead, setFilterRead] = useState(false)

  // Generate alerts based on business logic
  useEffect(() => {
    const generatedAlerts: ActionableAlert[] = []
    let alertId = 0

    societies.forEach(society => {
      const societyAdmins = admins.filter(a => a.societyId === society.id)

      // Alert 1: Inactive Society
      if (society.status === 'paused') {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          type: 'inactive-society',
          severity: 'critical',
          title: `${society.name} is Inactive`,
          description: `Society has been paused. No operations are currently active. Review and resume operations if needed.`,
          societyId: society.id,
          societyName: society.name,
          actionText: 'View Society',
          createdAt: society.createdAt,
          read: false,
        })
      }

      // Alert 2: No Admins Assigned
      if (society.status === 'active' && societyAdmins.length === 0) {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          type: 'no-admin',
          severity: 'critical',
          title: `${society.name} Has No Admin`,
          description: `No admin is assigned to manage this society. Assign an admin immediately for operational control and monitoring.`,
          societyId: society.id,
          societyName: society.name,
          actionText: 'Invite Admin',
          createdAt: society.createdAt,
          read: false,
        })
      }

      // Alert 3: Low Occupancy
      const totalUnits = (society.villas ?? 0) + (society.bungalows ?? 0) + (society.flats ?? 0)
      const occupiedUnits = society.occupiedUnits ?? 0
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

      if (occupancyRate < 50 && totalUnits > 0) {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          type: 'low-occupancy',
          severity: 'warning',
          title: `${society.name} - Low Occupancy (${Math.round(occupancyRate)}%)`,
          description: `Only ${occupiedUnits} of ${totalUnits} units are occupied. Consider marketing initiatives to increase occupancy.`,
          societyId: society.id,
          societyName: society.name,
          actionText: 'View Details',
          createdAt: society.createdAt,
          read: false,
        })
      }

      // Alert 4: No Watchmen Assigned
      if ((society.totalWatchmen ?? 0) === 0) {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          type: 'no-watchmen',
          severity: 'warning',
          title: `${society.name} - No Watchmen Assigned`,
          description: `No watchmen have been assigned to this society. Security coverage is compromised.`,
          societyId: society.id,
          societyName: society.name,
          actionText: 'View Society',
          createdAt: society.createdAt,
          read: false,
        })
      }
    })

    setAlerts(generatedAlerts)
  }, [societies, admins])

  const filteredAlerts = filterRead ? alerts.filter(a => !a.read) : alerts
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const warningCount = alerts.filter(a => a.severity === 'warning').length
  const unreadCount = alerts.filter(a => !a.read).length

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-red-700 mt-1 font-semibold">Critical</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
          <p className="text-xs text-yellow-700 mt-1 font-semibold">Warnings</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
          <p className="text-xs text-blue-700 mt-1 font-semibold">Unread</p>
        </div>
      </div>

      {/* Filter */}
      <button
        onClick={() => setFilterRead(!filterRead)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filterRead
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        Unread Only
      </button>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityStyles(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getSeverityIcon(alert.severity)}`} />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{alert.title}</p>
                      <p className="text-sm text-slate-700 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <p className="text-xs text-slate-600">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        const updated = alerts.map(a => a.id === alert.id ? { ...a, read: true } : a)
                        setAlerts(updated)
                      }}
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Mark Read
                    </button>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      {alert.actionText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No alerts at this time</p>
            <p className="text-xs text-slate-500 mt-1">All systems operating normally</p>
          </div>
        )}
      </div>
    </div>
  )
}
