'use client'

import React, { useState } from 'react'
import { Search, Filter, AlertCircle, CheckCircle, Clock, Zap, ChevronRight, Plus } from 'lucide-react'

interface MaintenanceMobileProps {
  societyId: string
}

export default function MaintenanceMobile({ societyId }: MaintenanceMobileProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { count: 12, label: 'Open Issues', subLabel: '2 High Priority', icon: '🔧', color: 'bg-red-100' },
    { count: 18, label: 'In Progress', subLabel: '3 Overdue', icon: '⏳', color: 'bg-yellow-100' },
    { count: 96, label: 'Resolved', subLabel: 'This Month', icon: '✓', color: 'bg-green-100' },
    { count: '4.5', label: 'Avg. Resolution Time', subLabel: '(Hours)', icon: '📋', color: 'bg-blue-100' },
  ]

  const issues = [
    {
      id: 1,
      title: 'Water Leakage',
      priority: 'High',
      location: 'Tower A • 101',
      reporter: 'Rajesh Kumar',
      reportedAt: '24 May, 10:30 AM',
      status: 'Open',
      icon: '🚰',
      bgColor: 'bg-red-50',
    },
    {
      id: 2,
      title: 'Lift Not Working',
      priority: 'Medium',
      location: 'Tower B • Lift 2',
      reporter: 'Neha Patel',
      reportedAt: '24 May, 09:15 AM',
      status: 'In Progress',
      icon: '🛗',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 3,
      title: 'Corridor Light Not Working',
      priority: 'Low',
      location: 'Tower C • 3rd Floor',
      reporter: 'Suresh Iyer',
      reportedAt: '23 May, 08:45 PM',
      status: 'In Progress',
      icon: '💡',
      bgColor: 'bg-blue-50',
    },
    {
      id: 4,
      title: 'CCTV Camera Not Working',
      priority: 'High',
      location: 'Main Gate',
      reporter: 'Amit Sharma',
      reportedAt: '23 May, 07:30 PM',
      status: 'Open',
      icon: '📹',
      bgColor: 'bg-red-50',
    },
    {
      id: 5,
      title: 'Drainage Blockage',
      priority: 'Medium',
      location: 'Tower A • Basement',
      reporter: 'Priya Verma',
      reportedAt: '22 May, 06:20 PM',
      status: 'Resolved',
      icon: '🚱',
      bgColor: 'bg-green-50',
    },
  ]

  const categories = [
    { name: 'Plumbing', count: 28, open: 4, icon: '🔧' },
    { name: 'Electrical', count: 24, open: 3, icon: '⚡' },
    { name: 'Lift', count: 16, open: 2, icon: '🛗' },
    { name: 'Security', count: 14, open: 2, icon: '🛡️' },
    { name: 'Others', count: 10, open: 1, icon: '••' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'Low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-50 text-red-700'
      case 'In Progress':
        return 'bg-yellow-50 text-yellow-700'
      case 'Resolved':
        return 'bg-green-50 text-green-700'
      default:
        return 'bg-slate-50 text-slate-700'
    }
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
            <p className="text-xs text-slate-600 font-medium mt-1">{stat.label}</p>
            {stat.subLabel && <p className={`text-xs mt-1 ${stat.label.includes('High') ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>{stat.subLabel}</p>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {['All Issues', 'Open', 'In Progress', 'Resolved', 'Overdue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.toLowerCase()
                ? 'text-purple-600 border-purple-600'
                : 'text-slate-600 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by issue, location or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-400 text-sm"
          />
        </div>
        <button className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-slate-900">Filters</span>
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className={`${issue.bgColor} rounded-2xl p-4 border border-slate-100`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{issue.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-slate-900">{issue.title}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium">{issue.location}</p>
                <p className="text-xs text-slate-600 mt-2">Reported by {issue.reporter}</p>
                <p className="text-xs text-slate-500 mt-1">{issue.reportedAt}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${getStatusBadge(issue.status)}`}>
                  {issue.status}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Raise New Issue CTA */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
            <span className="text-xl">💼</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Raise a New Issue</p>
            <p className="text-xs text-slate-600 mt-1">Report maintenance issues quickly and get them resolved.</p>
          </div>
        </div>
        <button className="w-full mt-3 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors">
          + Raise Issue
        </button>
      </div>

      {/* Issues by Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Issues by Category</h3>
          <button className="text-sm font-semibold text-purple-600">View Report</button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-3 border border-slate-100 text-center hover:border-slate-200 transition-colors">
              <p className="text-2xl mb-1">{cat.icon}</p>
              <p className="text-lg font-bold text-slate-900">{cat.count}</p>
              <p className="text-xs text-slate-600 mt-1 font-medium">{cat.name}</p>
              <p className="text-xs text-red-600 font-bold mt-1">Open: {cat.open}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 right-4">
        <button className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
