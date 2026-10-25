'use client'

import { useData } from '@/contexts/DataContext'
import { TrendingUp, Users, Building2, Home, Users2, TrendingDown } from 'lucide-react'

export default function AnalyticsTab() {
  const { societies, admins } = useData()

  // Calculate business metrics
  const totalSocieties = societies.length
  const activeSocieties = societies.filter(s => s.status === 'active').length
  const pausedSocieties = societies.filter(s => s.status === 'paused').length
  
  const totalUnits = societies.reduce((sum, s) => sum + (s.villas ?? 0) + (s.bungalows ?? 0) + (s.flats ?? 0), 0)
  const occupiedUnits = societies.reduce((sum, s) => sum + (s.occupiedUnits ?? 0), 0)
  const emptyUnits = totalUnits - occupiedUnits
  
  const totalAdmins = admins.length
  const totalResidents = societies.reduce((sum, s) => sum + (s.totalResidents ?? 0), 0)
  const totalWatchmen = societies.reduce((sum, s) => sum + (s.totalWatchmen ?? 0), 0)
  
  const totalVisitors = societies.reduce((sum, s) => sum + (s.weekVisitors ?? 0), 0)
  const avgVisitorsPerSociety = totalSocieties > 0 ? Math.round(totalVisitors / totalSocieties) : 0

  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
  const adminToSocietyRatio = totalSocieties > 0 ? (totalAdmins / totalSocieties).toFixed(1) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Business Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">Track your platform growth and key metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Total Societies */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Total Societies</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalSocieties}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-xs text-blue-700">
            <span className="font-semibold">{activeSocieties}</span> active,{' '}
            <span className="font-semibold">{pausedSocieties}</span> paused
          </div>
        </div>

        {/* Total Units */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">Total Units</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{totalUnits}</p>
            </div>
            <Home className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-xs text-green-700">
            <span className="font-semibold">{occupiedUnits}</span> occupied,{' '}
            <span className="font-semibold">{emptyUnits}</span> empty
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase">Total Admins</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{totalAdmins}</p>
            </div>
            <Users2 className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-xs text-purple-700">
            <span className="font-semibold">{adminToSocietyRatio}</span> per society
          </div>
        </div>

        {/* Total Residents */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase">Total Residents</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{totalResidents}</p>
            </div>
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-xs text-orange-700">
            Active members across all societies
          </div>
        </div>

        {/* Total Visitors */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-pink-600 uppercase">Total Visitors</p>
              <p className="text-3xl font-bold text-pink-900 mt-2">{totalVisitors}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-pink-400" />
          </div>
          <div className="text-xs text-pink-700">
            <span className="font-semibold">{avgVisitorsPerSociety}</span> avg per society
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-cyan-600 uppercase">Occupancy Rate</p>
              <p className="text-3xl font-bold text-cyan-900 mt-2">{occupancyRate}%</p>
            </div>
            <TrendingDown className={`w-8 h-8 ${occupancyRate > 80 ? 'text-red-400' : 'text-green-400'}`} />
          </div>
          <div className={`text-xs font-semibold ${occupancyRate > 80 ? 'text-red-700' : 'text-green-700'}`}>
            {occupancyRate > 80 ? 'High occupancy' : 'Good occupancy rate'}
          </div>
        </div>

        {/* Watchmen */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">Total Watchmen</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{totalWatchmen}</p>
            </div>
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-xs text-red-700">
            Security personnel on duty
          </div>
        </div>
      </div>

      {/* Growth Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Platform Health
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Active Societies</span>
              <span className="text-sm font-semibold text-slate-900">{activeSocieties} / {totalSocieties}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${totalSocieties > 0 ? (activeSocieties / totalSocieties) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Unit Occupancy</span>
              <span className="text-sm font-semibold text-slate-900">{occupiedUnits} / {totalUnits}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${occupancyRate > 80 ? 'bg-red-600' : 'bg-green-600'}`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Admin Coverage</span>
              <span className="text-sm font-semibold text-slate-900">{totalAdmins} admins managing {totalSocieties} societies</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(100, (totalAdmins / Math.max(1, totalSocieties)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span>You have <strong>{totalSocieties}</strong> total societies with <strong>{activeSocieties}</strong> currently active</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span><strong>{occupiedUnits}</strong> out of <strong>{totalUnits}</strong> units are occupied ({occupancyRate}%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span>Your platform has <strong>{totalResidents}</strong> registered residents and <strong>{totalWatchmen}</strong> watchmen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span>Received <strong>{totalVisitors}</strong> visitors this week (average <strong>{avgVisitorsPerSociety}</strong> per society)</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
