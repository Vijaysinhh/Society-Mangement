'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import { getMaintenanceCollectionStats } from '../lib/maintenanceFeeManager'
import { TrendingUp } from 'lucide-react'

export default function CollectionTrendChart({ allMaintenanceFees, allUnits }) {
  const [trendData, setTrendData] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90'>('30')

  useEffect(() => {
    const generateTrendData = () => {
      const stats = getMaintenanceCollectionStats()
      const days = parseInt(selectedPeriod)
      const data = []

      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        // Simulate trend data based on collection rates
        const baseCollection = stats.collectedAmount || 0
        const variance = Math.sin(i * 0.1) * 10000
        const collectionTrend = Math.max(0, baseCollection - variance)
        const collectionRate = stats.totalAmount > 0 ? (collectionTrend / stats.totalAmount) * 100 : 0

        data.push({
          date: dateStr,
          collected: Math.round(collectionTrend),
          pending: Math.round((stats.totalAmount || 0) - collectionTrend),
          rate: Math.round(collectionRate),
          overdue: Math.round((stats.overdueRate || 0) * (1 + Math.random() * 0.2))
        })
      }

      setTrendData(data)
    }

    generateTrendData()
    
    // Listen for sync events
    window.addEventListener('maintenanceFeeSync', generateTrendData)
    return () => window.removeEventListener('maintenanceFeeSync', generateTrendData)
  }, [selectedPeriod])

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Collection Trends
        </h3>
        <div className="flex gap-2">
          {(['30', '60', '90'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {period}D
            </button>
          ))}
        </div>
      </div>

      {/* Collection Rate Trend */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Collection Rate Trend (%)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #64748b', borderRadius: '8px' }}
              formatter={(value) => `${value}%`}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
              name="Collection Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Collected vs Pending */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Collected vs Pending Amount</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #64748b', borderRadius: '8px' }}
              formatter={(value) => `₹${value.toLocaleString()}`}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="#ef4444" name="Pending" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Overdue Rate Trend */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Overdue Rate Trend (%)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #64748b', borderRadius: '8px' }}
              formatter={(value) => `${value}%`}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Line 
              type="monotone" 
              dataKey="overdue" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 3 }}
              activeDot={{ r: 5 }}
              name="Overdue Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
