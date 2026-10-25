'use client'

import { useState, useEffect } from 'react'
import { useData } from '@/contexts/DataContext'
import { Building2, Users, Home, AlertCircle, TrendingDown } from 'lucide-react'

export default function RealtimeDashboard() {
  const { societies, admins } = useData()
  const [metrics, setMetrics] = useState({
    activeSocieties: 0,
    activeSocietiesWithAdmins: 0,
    totalOccupiedUnits: 0,
    totalRentedUnits: 0,
    totalEmptyUnits: 0,
    totalWatchmen: 0,
    inactiveSocieties: 0,
  })

  // Calculate business metrics from real data
  useEffect(() => {
    let activeSocieties = 0
    let activeSocietiesWithAdmins = 0
    let totalOccupied = 0
    let totalRented = 0
    let totalEmpty = 0
    let totalWatchmen = 0
    let inactiveSocieties = 0

    societies.forEach(society => {
      const totalUnits = (society.villas ?? 0) + (society.bungalows ?? 0) + (society.flats ?? 0)
      const occupiedUnits = society.occupiedUnits ?? 0
      const emptyUnits = totalUnits - occupiedUnits

      if (society.status === 'active') {
        activeSocieties++
      } else {
        inactiveSocieties++
      }

      // Check if society has admins
      const societyAdmins = admins.filter(a => a.societyId === society.id)
      if (society.status === 'active' && societyAdmins.length > 0) {
        activeSocietiesWithAdmins++
      }

      totalOccupied += occupiedUnits
      totalRented += 0 // Will be calculated from backend
      totalEmpty += emptyUnits
      totalWatchmen += society.totalWatchmen ?? 0
    })

    setMetrics({
      activeSocieties,
      activeSocietiesWithAdmins,
      totalOccupiedUnits: totalOccupied,
      totalRentedUnits: totalRented,
      totalEmptyUnits: totalEmpty,
      totalWatchmen,
      inactiveSocieties,
    })
  }, [societies, admins])

  const KPICard = ({ label, value, icon: Icon, trend, color = 'blue', warning }: any) => (
    <div className={`rounded-lg p-4 border ${
      warning 
        ? 'bg-red-50 border-red-200' 
        : `bg-${color}-50 border-${color}-200`
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase ${
            warning ? 'text-red-700' : `text-${color}-700`
          }`}>
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.text}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          warning 
            ? 'bg-red-100' 
            : `bg-${color}-100`
        }`}>
          <Icon className={`w-6 h-6 ${warning ? 'text-red-600' : `text-${color}-600`}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Business KPI Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Business Intelligence</h2>
        <p className="text-sm text-slate-600 mt-1">Key metrics for operational decision making</p>
      </div>

      {/* Active Operations */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-700 uppercase">Active Operations</h3>
        <div className="grid grid-cols-2 gap-3">
          <KPICard 
            label="Active Societies" 
            value={metrics.activeSocieties}
            icon={Building2}
            color="blue"
          />
          <KPICard 
            label="Societies with Admins" 
            value={metrics.activeSocietiesWithAdmins}
            icon={Users}
            color="green"
            warning={metrics.activeSocietiesWithAdmins < metrics.activeSocieties}
          />
        </div>
      </div>

      {/* Unit Distribution */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-700 uppercase">Unit Distribution</h3>
        <div className="grid grid-cols-3 gap-2">
          <KPICard 
            label="Occupied Units" 
            value={metrics.totalOccupiedUnits}
            icon={Home}
            color="green"
          />
          <KPICard 
            label="Rented Units" 
            value={metrics.totalRentedUnits}
            icon={Home}
            color="blue"
          />
          <KPICard 
            label="Empty Units" 
            value={metrics.totalEmptyUnits}
            icon={Home}
            color="orange"
            warning={metrics.totalEmptyUnits > (metrics.totalOccupiedUnits + metrics.totalRentedUnits)}
          />
        </div>
      </div>

      {/* Resource Management */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-700 uppercase">Resources</h3>
        <div className="grid grid-cols-2 gap-3">
          <KPICard 
            label="Total Watchmen" 
            value={metrics.totalWatchmen}
            icon={Users}
            color="purple"
          />
          <KPICard 
            label="Inactive Societies" 
            value={metrics.inactiveSocieties}
            icon={AlertCircle}
            color="red"
            warning={metrics.inactiveSocieties > 0}
          />
        </div>
      </div>

      {/* Critical Alerts Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-700 uppercase">Critical Issues</h3>
        <div className="space-y-2">
          {metrics.inactiveSocieties > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">{metrics.inactiveSocieties} Inactive Societies</p>
                <p className="text-xs text-red-700 mt-1">Societies are currently paused. Resume operations or investigate issues.</p>
              </div>
            </div>
          )}
          {metrics.activeSocieties > metrics.activeSocietiesWithAdmins && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">{metrics.activeSocieties - metrics.activeSocietiesWithAdmins} Societies Missing Admins</p>
                <p className="text-xs text-orange-700 mt-1">Assign admins to these societies for proper management and monitoring.</p>
              </div>
            </div>
          )}
          {metrics.totalEmptyUnits > (metrics.totalOccupiedUnits / 2) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Low Occupancy Alert</p>
                <p className="text-xs text-yellow-700 mt-1">Empty units ({metrics.totalEmptyUnits}) exceed 50% of occupied units. Review vacancy rates.</p>
              </div>
            </div>
          )}
          {metrics.totalWatchmen === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">No Watchmen Assigned</p>
                <p className="text-xs text-red-700 mt-1">Societies have no assigned watchmen. This affects security coverage.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
