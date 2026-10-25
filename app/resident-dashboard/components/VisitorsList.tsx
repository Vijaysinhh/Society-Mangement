'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import VisitorDetailsModal from './VisitorDetailsModal'

interface Visitor {
  id: string
  name: string
  purpose: 'Delivery' | 'Guest' | 'Courier' | 'Maintenance' | 'Other'
  gateTime: string
  date: string
  flatNumber: string
  residentName: string
  watchmanLogged: {
    name: string
    id: string
  }
  photo?: string
  status: 'pending' | 'approved' | 'denied'
}

type FilterTab = 'all' | 'pending' | 'approved' | 'denied'

// Mock data with 7+ days of history
const mockAllVisitors: Visitor[] = [
  // Today - May 29, 2026
  { id: 'v1', name: 'Priya', purpose: 'Delivery', gateTime: '2:45 PM', date: '2026-05-29', flatNumber: 'A-101', residentName: 'Rajesh Kumar', watchmanLogged: { name: 'Ramesh Kumar', id: 'w1' }, status: 'pending' },
  { id: 'v2', name: 'Amit', purpose: 'Guest', gateTime: '3:15 PM', date: '2026-05-29', flatNumber: 'B-204', residentName: 'Vikram Singh', watchmanLogged: { name: 'Vikram Singh', id: 'w2' }, status: 'pending' },
  { id: 'v3', name: 'John', purpose: 'Guest', gateTime: '10:00 AM', date: '2026-05-29', flatNumber: 'C-305', residentName: 'Pradeep Sharma', watchmanLogged: { name: 'Pradeep Sharma', id: 'w3' }, status: 'approved' },
  { id: 'v4', name: 'Neha', purpose: 'Courier', gateTime: '11:30 AM', date: '2026-05-29', flatNumber: 'A-102', residentName: 'Anjali Singh', watchmanLogged: { name: 'Ramesh Kumar', id: 'w1' }, status: 'approved' },
  { id: 'v5', name: 'Unknown', purpose: 'Other', gateTime: '1:00 PM', date: '2026-05-29', flatNumber: 'B-201', residentName: 'Suresh Gupta', watchmanLogged: { name: 'Vikram Singh', id: 'w2' }, status: 'denied' },

  // May 28
  { id: 'v6', name: 'Delivery Guy', purpose: 'Delivery', gateTime: '4:00 PM', date: '2026-05-28', flatNumber: 'A-101', residentName: 'Rajesh Kumar', watchmanLogged: { name: 'Ramesh Kumar', id: 'w1' }, status: 'approved' },
  { id: 'v7', name: 'Family Member', purpose: 'Guest', gateTime: '6:00 PM', date: '2026-05-28', flatNumber: 'B-204', residentName: 'Vikram Singh', watchmanLogged: { name: 'Vikram Singh', id: 'w2' }, status: 'approved' },
  { id: 'v8', name: 'Maintenance Person', purpose: 'Maintenance', gateTime: '9:00 AM', date: '2026-05-28', flatNumber: 'C-305', residentName: 'Pradeep Sharma', watchmanLogged: { name: 'Pradeep Sharma', id: 'w3' }, status: 'approved' },

  // May 27
  { id: 'v9', name: 'Courier Service', purpose: 'Courier', gateTime: '2:30 PM', date: '2026-05-27', flatNumber: 'A-102', residentName: 'Anjali Singh', watchmanLogged: { name: 'Ramesh Kumar', id: 'w1' }, status: 'approved' },
  { id: 'v10', name: 'Unknown Person', purpose: 'Other', gateTime: '5:15 PM', date: '2026-05-27', flatNumber: 'B-201', residentName: 'Suresh Gupta', watchmanLogged: { name: 'Vikram Singh', id: 'w2' }, status: 'denied' },

  // May 26
  { id: 'v11', name: 'Guest', purpose: 'Guest', gateTime: '3:00 PM', date: '2026-05-26', flatNumber: 'C-305', residentName: 'Pradeep Sharma', watchmanLogged: { name: 'Pradeep Sharma', id: 'w3' }, status: 'approved' },

  // May 25
  { id: 'v12', name: 'Delivery', purpose: 'Delivery', gateTime: '1:45 PM', date: '2026-05-25', flatNumber: 'A-101', residentName: 'Rajesh Kumar', watchmanLogged: { name: 'Ramesh Kumar', id: 'w1' }, status: 'approved' },
]

interface VisitorsListProps {
  onVisitorClick?: (visitor: Visitor) => void
}

// export default function VisitorsList({ onVisitorClick }: VisitorsListProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string>('2026-05-29')

  // Get unique dates sorted descending
  const uniqueDates = [...new Set(mockAllVisitors.map(v => v.date))].sort().reverse()

  // Filter visitors by tab
  const getFilteredVisitors = (date: string) => {
    return mockAllVisitors
      .filter(v => v.date === date)
      .filter(v => {
        if (filterTab === 'all') return true
        return v.status === filterTab
      })
  }

  // Count visitors by status for today
  const todayVisitors = mockAllVisitors.filter(v => v.date === '2026-05-29')
  const todayStats = {
    all: todayVisitors.length,
    pending: todayVisitors.filter(v => v.status === 'pending').length,
    approved: todayVisitors.filter(v => v.status === 'approved').length,
    denied: todayVisitors.filter(v => v.status === 'denied').length,
  }

  const handleVisitorClick = (visitor: Visitor) => {
    setSelectedVisitor(visitor)
    setIsModalOpen(true)
    onVisitorClick?.(visitor)
  }

  const handleApprove = (visitorId: string) => {
    // Update mock data
    const visitor = mockAllVisitors.find(v => v.id === visitorId)
    if (visitor) {
      visitor.status = 'approved'
    }
    setIsModalOpen(false)
  }

  const handleDeny = (visitorId: string) => {
    const visitor = mockAllVisitors.find(v => v.id === visitorId)
    if (visitor) {
      visitor.status = 'denied'
    }
    setIsModalOpen(false)
  }

  const handleBlacklist = (visitorId: string) => {
    // TODO: Integrate with blacklist functionality
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' }
      case 'denied':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Denied' }
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', label: status }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === '2026-05-29') return 'TODAY'
    if (dateStr === '2026-05-28') return 'YESTERDAY'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visitors</h2>
          <p className="text-sm text-slate-600 mt-1">Manage and track all visitor approvals</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({todayStats.all})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              filterTab === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Pending ({todayStats.pending})
          </button>
          <button
            onClick={() => setFilterTab('approved')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              filterTab === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Approved ({todayStats.approved})
          </button>
          <button
            onClick={() => setFilterTab('denied')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              filterTab === 'denied'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Denied ({todayStats.denied})
          </button>
        </div>

        {/* Visitors by Date */}
        <div className="space-y-3">
          {uniqueDates.map(date => {
            const visitorsForDate = getFilteredVisitors(date)
            if (visitorsForDate.length === 0) return null

            return (
              <div key={date} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Date Header */}
                <button
                  onClick={() => setExpandedDate(expandedDate === date ? '' : date)}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{formatDate(date)}</span>
                    <span className="text-sm text-slate-600">({visitorsForDate.length} visitors)</span>
                  </div>
                  {expandedDate === date ? (
                    <ChevronUp className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                {/* Visitors List */}
                {expandedDate === date && (
                  <div className="divide-y divide-slate-200">
                    {visitorsForDate.map(visitor => {
                      const badge = getStatusBadge(visitor.status)
                      return (
                        <div
                          key={visitor.id}
                          onClick={() => handleVisitorClick(visitor)}
                          className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{visitor.name}</p>
                              <p className="text-xs text-slate-600">
                                {visitor.purpose} • {visitor.gateTime}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <p>Flat: <span className="font-medium">{visitor.flatNumber}</span></p>
                            <p>Logged by: <span className="font-medium">{visitor.watchmanLogged.name}</span></p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Visitor Details Modal */}
      <VisitorDetailsModal
        visitor={selectedVisitor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedVisitor(null)
        }}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onBlacklist={handleBlacklist}
      />
    </>
  )
}
