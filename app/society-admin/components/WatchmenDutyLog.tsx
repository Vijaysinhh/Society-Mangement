'use client'

import { useState } from 'react'
import { Clock3, Search } from 'lucide-react'

interface DutyLogEntry {
  id: string
  watchmanName: string
  date: string
  clockIn: string
  clockOut: string
  duration: string
  status: 'completed' | 'ongoing' | 'late'
  notes: string
}

interface WatchmenDutyLogProps {
  societyId: string
}

export default function WatchmenDutyLog({ societyId }: WatchmenDutyLogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'ongoing' | 'late'>('all')

  // Mock duty log data
  const mockDutyLogs: DutyLogEntry[] = [
    { id: '1', watchmanName: 'Rajesh Kumar', date: '2024-03-21', clockIn: '06:00 AM', clockOut: '02:00 PM', duration: '8h', status: 'completed', notes: 'All gates secured' },
    { id: '2', watchmanName: 'Vikram Singh', date: '2024-03-21', clockIn: '02:00 PM', clockOut: '10:00 PM', duration: '8h', status: 'completed', notes: 'One visitor logged' },
    { id: '3', watchmanName: 'Suresh Patel', date: '2024-03-21', clockIn: '10:00 PM', clockOut: null, duration: 'Ongoing', status: 'ongoing', notes: 'Night shift active' },
    { id: '4', watchmanName: 'Rajesh Kumar', date: '2024-03-20', clockIn: '06:05 AM', clockOut: '02:00 PM', duration: '7h 55m', status: 'late', notes: '5 min late arrival' },
    { id: '5', watchmanName: 'Vikram Singh', date: '2024-03-20', clockIn: '02:00 PM', clockOut: '10:00 PM', duration: '8h', status: 'completed', notes: 'All clear' },
  ]

  const filteredLogs = mockDutyLogs.filter(log => {
    const matchesSearch = log.watchmanName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'late':
        return 'bg-amber-100 text-amber-800 border border-amber-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search watchman name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'completed', 'ongoing', 'late'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Duty Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Watchman</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Clock In</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Clock Out</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{log.watchmanName}</td>
                    <td className="px-4 py-3 text-slate-600">{log.date}</td>
                    <td className="px-4 py-3 text-slate-600">{log.clockIn}</td>
                    <td className="px-4 py-3 text-slate-600">{log.clockOut || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{log.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{log.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No duty logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
