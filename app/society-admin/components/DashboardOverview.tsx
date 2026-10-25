'use client'

import { useState, useEffect } from 'react'
import { Unit } from '@/types'
import { TrendingUp, TrendingDown, Users, Home, AlertCircle, AlertTriangle, Car, Wrench, UserCheck, DollarSign, Clock, CheckCircle2, BarChart3, ArrowRight, Send, Edit2, Eye } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DashboardOverviewProps {
  societyId: string
}

export default function DashboardOverview({ societyId }: DashboardOverviewProps) {
  const [units, setUnits] = useState<Unit[]>([])
  const [residents, setResidents] = useState<any[]>([])
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [activityFilter, setActivityFilter] = useState<'all' | 'action' | 'followup' | 'done'>('all')

  useEffect(() => {
    const storedUnits = JSON.parse(localStorage.getItem('units') || '[]')
    const storedResidents = JSON.parse(localStorage.getItem('residents') || '[]')
    
    const societyUnits = storedUnits.filter((u: Unit) => u.societyId === societyId)
    const societyResidents = storedResidents.filter((r: any) => r.societyId === societyId)
    
    setUnits(societyUnits)
    setResidents(societyResidents)
  }, [societyId])

  // Calculate comprehensive stats with context
  const stats = {
    totalUnits: units.length,
    occupied: units.filter(u => u.status === 'occupied').length,
    empty: units.filter(u => u.status === 'empty').length,
    rented: units.filter(u => u.status === 'rented').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
    totalResidents: residents.length,
    appRegisteredResidents: units.reduce((acc, u) => acc + (u.residents?.length || 0), 0),
    totalVehicles: units.reduce((acc, u) => acc + (u.vehicles?.length || 0), 0),
    flats: units.filter(u => u.unitType === 'flat').length,
    bungalows: units.filter(u => u.unitType === 'bungalow').length,
  }

  // Financial metrics with context
  const financialMetrics = {
    totalExpected: 25200,
    collectedThisMonth: 18500,
    pending: 6500,
    overdue: 2800,
    collectionTarget: 85,
    collectionRate: 73.6,
    overdueUnits: 2,
    oldestOverdueDay: 8,
    lastMonthCollection: 17200,
  }

  // Calculate collection efficiency trend
  const collectionTrend = [
    { month: 'October', collected: 15000, target: 20000, efficiency: 75 },
    { month: 'November', collected: 17200, target: 20000, efficiency: 86 },
    { month: 'December', collected: 18500, target: 20000, efficiency: 92.5 },
  ]

  // Occupancy trend with vacancy reasons
  const occupancyTrend = [
    { month: 'October', occupancy: 65, vacant: 35 },
    { month: 'November', occupancy: 68, vacant: 32 },
    { month: 'December', occupancy: 72, vacant: 28 },
  ]

  // Priority-sorted activity feed (with action status)
  const activityItems = [
    { id: 1, status: 'action', type: 'maintenance', title: 'Maintenance Ticket Unassigned', detail: 'Plumbing Issue - Unit C-305', time: '5 hours ago', urgent: true, actionLabel: 'Assign Now' },
    { id: 2, status: 'followup', type: 'resident', title: 'New Resident Added', detail: 'Unit C-305 - Profile incomplete', time: '1 day ago', actionLabel: 'Complete Profile' },
    { id: 3, status: 'done', type: 'payment', title: 'Payment Received', detail: 'Unit A-101 - Mr. Sharma - ₹1,500', time: '2 hours ago', actionLabel: 'View Receipt' },
  ].filter(item => activityFilter === 'all' || item.status === activityFilter)

  const occupancyRate = stats.totalUnits > 0 ? Math.round(((stats.occupied + stats.rented) / stats.totalUnits) * 100) : 0
  const emptyRate = stats.totalUnits > 0 ? Math.round((stats.empty / stats.totalUnits) * 100) : 0

  // Smart alerts with specific thresholds
  const alerts = []
  if (financialMetrics.overdue > 0) {
    alerts.push({ type: 'warning', severity: 'high', message: `₹${financialMetrics.overdue.toLocaleString()} overdue from ${financialMetrics.overdueUnits} units • oldest: ${financialMetrics.oldestOverdueDay} days` })
  }
  if (stats.empty > stats.totalUnits * 0.25) {
    alerts.push({ type: 'info', severity: 'medium', message: `${stats.empty} units vacant (${emptyRate}%) — immediate action recommended for rentals` })
  }
  if (stats.maintenance > 2) {
    alerts.push({ type: 'warning', severity: 'medium', message: `${stats.maintenance} units under maintenance — renovation in progress` })
  }
  if (financialMetrics.collectionRate < financialMetrics.collectionTarget) {
    alerts.push({ type: 'warning', severity: 'high', message: `Collection at ${financialMetrics.collectionRate}% — ${(financialMetrics.collectionTarget - financialMetrics.collectionRate).toFixed(1)}% below ${financialMetrics.collectionTarget}% target` })
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Smart Alerts with Specific Thresholds */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${alert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
              <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Stats Cards with Context & Trend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Units */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Total Units</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">{stats.totalUnits}</p>
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-slate-600 mt-2">{stats.flats} flats • {stats.bungalows} bungalows</p>
        </div>

        {/* Occupied (with inline action) */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-green-600 uppercase mb-3">Occupied</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-green-700">{stats.occupied + stats.rented}</p>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-green-600 mt-2">{occupancyRate}% occupancy ↑2% from last month</p>
          <button className="mt-3 w-full px-2 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors">View Units →</button>
        </div>

        {/* Available (with inline action) */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-3">Available</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-blue-700">{stats.empty}</p>
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-blue-600 mt-2">{emptyRate}% ready for rental</p>
          <button className="mt-3 w-full px-2 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors">Mark for Follow-up →</button>
        </div>

        {/* App Residents (with context) */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-purple-600 uppercase mb-3">App Residents</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-purple-700">{stats.appRegisteredResidents}</p>
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-purple-600 mt-2">of {stats.occupied + stats.rented} occupied units</p>
          <button className="mt-3 w-full px-2 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded hover:bg-purple-200 transition-colors">Approve Profiles →</button>
        </div>
      </div>

      {/* Enhanced Financial Cards with Progress & Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Collected This Month */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-5 sm:p-6">
          <p className="text-xs font-semibold text-green-700 uppercase mb-3">Collected This Month</p>
          <p className="text-3xl font-bold text-green-900">₹{financialMetrics.collectedThisMonth.toLocaleString()}</p>
          <p className="text-sm text-green-700 mt-1">of ₹{financialMetrics.totalExpected.toLocaleString()} expected</p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-green-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-600 h-full transition-all"
              style={{ width: `${(financialMetrics.collectedThisMonth / financialMetrics.totalExpected * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-green-600 mt-2">Progress: {Math.round(financialMetrics.collectedThisMonth / financialMetrics.totalExpected * 100)}%</p>
          <p className="text-xs text-green-600 mt-1">↑5% vs last month</p>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-5 sm:p-6">
          <p className="text-xs font-semibold text-amber-700 uppercase mb-3">Collection Efficiency</p>
          <p className="text-3xl font-bold text-amber-900">{financialMetrics.collectionRate}%</p>
          <p className="text-sm text-amber-700 mt-1">Target: {financialMetrics.collectionTarget}% • Gap: {(financialMetrics.collectionTarget - financialMetrics.collectionRate).toFixed(1)}%</p>
          
          {/* Status Indicator */}
          <div className={`mt-4 flex items-center gap-2 p-2 rounded ${financialMetrics.collectionRate < financialMetrics.collectionTarget ? 'bg-amber-200' : 'bg-green-200'}`}>
            <div className={`w-2 h-2 rounded-full ${financialMetrics.collectionRate < financialMetrics.collectionTarget ? 'bg-amber-600' : 'bg-green-600'}`}></div>
            <span className={`text-xs font-medium ${financialMetrics.collectionRate < financialMetrics.collectionTarget ? 'text-amber-800' : 'text-green-800'}`}>
              {financialMetrics.collectionRate < financialMetrics.collectionTarget ? 'Below target' : 'On track'}
            </span>
          </div>
          <p className="text-xs text-amber-600 mt-2">{stats.empty} units not yet paid</p>
        </div>

        {/* Overdue Payments (Single unified card with inline actions) */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-5 sm:p-6">
          <p className="text-xs font-semibold text-amber-700 uppercase mb-3">Overdue Payments</p>
          <p className="text-3xl font-bold text-amber-900">₹{financialMetrics.overdue.toLocaleString()}</p>
          <p className="text-sm text-amber-700 mt-1">{financialMetrics.overdueUnits} units • oldest: {financialMetrics.oldestOverdueDay} days</p>
          
          <button className="mt-4 w-full px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Send Bulk Reminder
          </button>
        </div>
      </div>

      {/* Single Unified Overdue Section (no duplication) with Inline Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Payment Follow-ups Required (2)
        </h3>
        <div className="space-y-3">
          {/* Overdue item 1 with inline actions */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Unit A-101</p>
              <p className="text-sm text-slate-600">Mr. Sharma • ₹1,500 • 12 days past due</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors flex items-center gap-1">
                <Send className="w-3 h-3" /> Remind
              </button>
              <button className="px-3 py-1.5 border border-amber-600 text-amber-600 text-xs font-medium rounded hover:bg-amber-50 transition-colors flex items-center gap-1">
                <Edit2 className="w-3 h-3" /> Record
              </button>
            </div>
          </div>

          {/* Overdue item 2 with inline actions */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Unit B-203</p>
              <p className="text-sm text-slate-600">Mr. Patel • ₹2,800 • 8 days past due</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors flex items-center gap-1">
                <Send className="w-3 h-3" /> Remind
              </button>
              <button className="px-3 py-1.5 border border-amber-600 text-amber-600 text-xs font-medium rounded hover:bg-amber-50 transition-colors flex items-center gap-1">
                <Edit2 className="w-3 h-3" /> Record
              </button>
            </div>
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 border border-amber-300 text-amber-600 font-medium rounded hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" /> View All Overdue →
        </button>
      </div>

      {/* Charts Section - Now Interactive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Collection Trend - Interactive */}
        <div 
          className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedChart(selectedChart === 'collection' ? null : 'collection')}
        >
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Collection Trend (Click to expand)
          </h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <ReferenceLine y={20000} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: 'Target', position: 'right', fill: '#64748b' }} />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {selectedChart === 'collection' && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-800">
              Dec: ₹18,500 collected of ₹20,000 target • 7 units unpaid • Collection improved 5% vs November
            </div>
          )}
        </div>

        {/* Occupancy Trend - Interactive */}
        <div 
          className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedChart(selectedChart === 'occupancy' ? null : 'occupancy')}
        >
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Occupancy Trend (Click to expand)
          </h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="occupancy" stroke="#4f46e5" name="Occupied %" strokeWidth={2} dot={{ fill: '#4f46e5' }} />
                <Line type="monotone" dataKey="vacant" stroke="#f59e0b" name="Vacant %" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {selectedChart === 'occupancy' && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-800">
              Dec: 4 vacant units never occupied, 3 tenant moved out, 2 renovation • Occupancy improved from 65% to 72%
            </div>
          )}
        </div>
      </div>

      {/* Context-Sensitive Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200 p-5 sm:p-6">
        <h3 className="font-bold text-slate-900 mb-4">Quick Actions (based on current situation)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
          {/* Dynamic action for overdue payments */}
          {financialMetrics.overdue > 0 && (
            <button className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-colors text-xs sm:text-sm font-medium text-amber-700 col-span-2 md:col-span-1">
              <Send className="w-4 h-4" />
              Send Reminders ({financialMetrics.overdueUnits})
            </button>
          )}

          {/* Permanent actions */}
          <button className="flex items-center justify-center gap-2 p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium text-blue-700">
            <Wrench className="w-4 h-4" />
            Building Care
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-xs sm:text-sm font-medium text-green-700">
            <DollarSign className="w-4 h-4" />
            Record Payment
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-xs sm:text-sm font-medium text-purple-700">
            <Users className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Priority-Sorted Activity Feed */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Recent Activity (sorted by priority)
        </h3>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'action', 'followup', 'done'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActivityFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                activityFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {filter === 'action' ? '🔴 Action Needed' : filter === 'followup' ? '🟡 Follow Up' : filter === 'done' ? '🟢 Done' : 'All'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activityItems.map(item => (
            <div key={item.id} className={`p-4 rounded-lg border ${
              item.status === 'action' ? 'bg-red-50 border-red-200' :
              item.status === 'followup' ? 'bg-amber-50 border-amber-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.detail} • {item.time}</p>
                </div>
                <button className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  item.status === 'action' ? 'bg-red-600 text-white hover:bg-red-700' :
                  item.status === 'followup' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                  'text-blue-600 border border-blue-300 hover:bg-blue-50'
                }`}>
                  {item.actionLabel} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {units.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No Units Added Yet</h3>
          <p className="text-sm text-slate-600">Navigate to the Units tab to start registering units and residents.</p>
        </div>
      )}
    </div>
  )
}
