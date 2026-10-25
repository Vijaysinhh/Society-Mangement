'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle2, XCircle, Users, Package, Briefcase, Wrench } from 'lucide-react'
import { dataStore } from '@/lib/centralDataStore'
import type { Visitor } from '@/lib/centralDataStore'

interface VisitorStatsProps {
  societyId: string
}

interface VisitorData {
  totalVisits: number
  acceptedVisits: number
  rejectedVisits: number
  peakHour: string
  averageDailyVisitors: number
  visitTrend: { hour: string; count: number }[]
}

export default function VisitorStats({ societyId }: VisitorStatsProps) {
  const [stats, setStats] = useState<VisitorData>({
    totalVisits: 0,
    acceptedVisits: 0,
    rejectedVisits: 0,
    peakHour: '',
    averageDailyVisitors: 0,
    visitTrend: [],
  })

  useEffect(() => {
    // Calculate real visitor statistics from dataStore (privacy: aggregate only, no unit details)
    
    // Calculate statistics
    const totalVisits = allVisitors.length
    const acceptedVisits = allVisitors.filter(v => v.status === 'approved').length
    const rejectedVisits = allVisitors.filter(v => v.status === 'denied').length
    
    // Calculate hourly distribution (based on visit times if available)
    const hourlyTrend = [
      { hour: '6-8 AM', count: 0 },
      { hour: '8-10 AM', count: 0 },
      { hour: '10-12 PM', count: 0 },
      { hour: '12-2 PM', count: 0 },
      { hour: '2-4 PM', count: 0 },
      { hour: '4-6 PM', count: 0 },
      { hour: '6-8 PM', count: 0 },
      { hour: '8-10 PM', count: 0 },
    ]
    
    // Distribute visits across hours (for demo, we'll distribute proportionally)
    allVisitors.forEach(visitor => {
      const hour = new Date(visitor.createdAt).getHours()
      if (hour >= 6 && hour < 8) hourlyTrend[0].count++
      else if (hour >= 8 && hour < 10) hourlyTrend[1].count++
      else if (hour >= 10 && hour < 12) hourlyTrend[2].count++
      else if (hour >= 12 && hour < 14) hourlyTrend[3].count++
      else if (hour >= 14 && hour < 16) hourlyTrend[4].count++
      else if (hour >= 16 && hour < 18) hourlyTrend[5].count++
      else if (hour >= 18 && hour < 20) hourlyTrend[6].count++
      else if (hour >= 20 && hour < 22) hourlyTrend[7].count++
    })
    
    const peakHourData = hourlyTrend.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    )

    const visitorData = {
      totalVisits,
      acceptedVisits,
      rejectedVisits,
      peakHour: peakHourData.hour,
      averageDailyVisitors: Math.ceil(totalVisits / 30),
      visitTrend: hourlyTrend,
    }

    setStats(visitorData)

    // Subscribe to visitor events for real-time updates
      // Recalculate stats when new visitor added
      const updatedTotal = updatedVisitors.length
      const updatedAccepted = updatedVisitors.filter(v => v.status === 'approved').length
      const updatedRejected = updatedVisitors.filter(v => v.status === 'denied').length
      
      setStats(prev => ({
        ...prev,
        totalVisits: updatedTotal,
        acceptedVisits: updatedAccepted,
        rejectedVisits: updatedRejected,
      }))
    })

    return () => unsubscribe()
  }, [societyId])

  const acceptanceRate = stats.totalVisits > 0 ? ((stats.acceptedVisits / stats.totalVisits) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Privacy Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 flex gap-3">
        <div className="text-blue-600 font-bold text-lg flex-shrink-0">ℹ</div>
        <div>
          <p className="font-medium text-slate-900 text-sm">Data Privacy Notice</p>
          <p className="text-xs text-slate-600 mt-1">This dashboard shows aggregated visitor statistics only. No resident names, visitor details, or unit information is displayed to protect privacy.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-600 uppercase">Total Visits</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">{stats.totalVisits}</p>
              <p className="text-xs text-blue-600 mt-1">This month</p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-600 uppercase">Accepted</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">{stats.acceptedVisits}</p>
              <p className="text-xs text-green-600 mt-1">{acceptanceRate}% approval</p>
            </div>
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-600 uppercase">Rejected</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1 sm:mt-2">{stats.rejectedVisits}</p>
              <p className="text-xs text-red-600 mt-1">{(100 - Number(acceptanceRate)).toFixed(1)}% rejection</p>
            </div>
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase">Avg Daily</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1 sm:mt-2">{stats.averageDailyVisitors}</p>
              <p className="text-xs text-purple-600 mt-1">Visitors/day</p>
            </div>
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Visitor Type Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
        <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase mb-3 sm:mb-4">Visitor Type Breakdown</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-lg sm:text-xl font-bold text-slate-900">40%</p>
            <p className="text-xs text-slate-600">Guests</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-lg sm:text-xl font-bold text-slate-900">30%</p>
            <p className="text-xs text-slate-600">Delivery</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <Briefcase className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-lg sm:text-xl font-bold text-slate-900">20%</p>
            <p className="text-xs text-slate-600">Workers</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <Wrench className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-lg sm:text-xl font-bold text-slate-900">10%</p>
            <p className="text-xs text-slate-600">Services</p>
          </div>
        </div>
      </div>

      {/* Peak Visiting Hours and Average */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase mb-2 sm:mb-3">Peak Visiting Hours</p>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stats.peakHour}</p>
          <p className="text-xs text-slate-500 mt-1 sm:mt-2">Highest visitor traffic time</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase mb-2 sm:mb-3">Avg Daily Visitors</p>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stats.averageDailyVisitors}</p>
          <p className="text-xs text-slate-500 mt-1 sm:mt-2">Average visitors per day</p>
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 overflow-x-auto">
        <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase mb-3 sm:mb-4">Visitor Distribution by Time</p>
        <div className="space-y-2 sm:space-y-3 min-w-full">
          {stats.visitTrend.map((item, index) => {
            const maxCount = Math.max(...stats.visitTrend.map((v) => v.count))
            const percentage = (item.count / maxCount) * 100

            return (
              <div key={index} className="flex items-center gap-2 sm:gap-3">
                <div className="w-16 sm:w-20 text-xs font-medium text-slate-600 flex-shrink-0">{item.hour}</div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 sm:h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 sm:w-12 text-right text-xs sm:text-sm font-medium text-slate-900 flex-shrink-0">{item.count}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
