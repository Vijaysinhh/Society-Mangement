'use client'

import { useState } from 'react'
import { Clock3, AlertOctagon, Users2, BarChart3 } from 'lucide-react'
import WatchmenList from './WatchmenList'
import WatchmenDutyLog from './WatchmenDutyLog'
import WatchmenIncidents from './WatchmenIncidents'

interface WatchmenTabContainerProps {
  societyId: string
}

export default function WatchmenTabContainer({ societyId }: WatchmenTabContainerProps) {
  const [activeTab, setActiveTab] = useState<'watchmen' | 'duty' | 'incidents'>('watchmen')

  // Mock performance metrics
  const performanceMetrics = {
    totalWatchmen: 8,
    onDutyNow: 2,
    avgAttendance: 96.5,
    incidentsThisMonth: 12,
  }

  return (
    <div className="space-y-4">
      {/* Performance Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-blue-600 font-medium">Total Watchmen</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{performanceMetrics.totalWatchmen}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-green-600 font-medium">On Duty Now</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">{performanceMetrics.onDutyNow}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-amber-600 font-medium">Avg Attendance</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-900 mt-1">{performanceMetrics.avgAttendance}%</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-red-600 font-medium">Incidents (Month)</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1">{performanceMetrics.incidentsThisMonth}</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('watchmen')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'watchmen'
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Watchmen</span>
          </button>
          <button
            onClick={() => setActiveTab('duty')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'duty'
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Clock3 className="w-4 h-4" />
            <span>Duty Log</span>
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'incidents'
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Incidents</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'watchmen' && <WatchmenList societyId={societyId} />}
          {activeTab === 'duty' && <WatchmenDutyLog societyId={societyId} />}
          {activeTab === 'incidents' && <WatchmenIncidents societyId={societyId} />}
        </div>
      </div>
    </div>
  )
}
