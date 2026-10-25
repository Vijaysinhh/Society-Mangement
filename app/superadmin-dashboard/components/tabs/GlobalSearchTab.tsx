'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { Search, Filter, X, Building2, Users, MapPin, AlertCircle } from 'lucide-react'

type SearchCategory = 'all' | 'societies' | 'residents' | 'admins' | 'visitors'

export default function GlobalSearchTab() {
  const { societies, admins } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<SearchCategory>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    societyStatus: 'all', // all, active, paused
    adminRole: 'all', // all, superadmin, society-admin
    dateRange: 'all', // all, today, week, month
  })

  // Search results
  const getSearchResults = () => {
    let results: any[] = []

    // Search in societies
    if (category === 'all' || category === 'societies') {
      const societyResults = societies
        .filter(s => {
          const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.city.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesStatus = filters.societyStatus === 'all' || s.status === filters.societyStatus
          return matchesQuery && matchesStatus
        })
        .map(s => ({
          type: 'society',
          id: s.id,
          title: s.name,
          subtitle: `${s.city}, ${s.state}`,
          meta: `${s.totalResidents} residents • ${s.villas + s.bungalows + s.flats} units`,
          icon: Building2,
        }))
      results = [...results, ...societyResults]
    }

    // Search in admins
    if (category === 'all' || category === 'admins') {
      const adminResults = admins
        .filter(a => {
          const matchesQuery = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             a.email.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesRole = filters.adminRole === 'all' || a.role === filters.adminRole
          return matchesQuery && matchesRole
        })
        .map(a => ({
          type: 'admin',
          id: a.id,
          title: a.name,
          subtitle: a.email,
          meta: `${a.role.replace('-', ' ')} • ${a.societyId ? 'Assigned' : 'Unassigned'}`,
          icon: Users,
        }))
      results = [...results, ...adminResults]
    }

    return results
  }

  const results = getSearchResults()

  const handleSaveView = () => {
    console.log('[v0] Saving search view:', { searchQuery, category, filters })
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Global Search</h2>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search societies, residents, admins, visitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Category Buttons */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'societies', 'residents', 'admins', 'visitors'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as SearchCategory)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Advanced Filters
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Society Status Filter */}
            {(category === 'all' || category === 'societies') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Society Status</label>
                <select
                  value={filters.societyStatus}
                  onChange={(e) => setFilters({ ...filters, societyStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            )}

            {/* Admin Role Filter */}
            {(category === 'all' || category === 'admins') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Role</label>
                <select
                  value={filters.adminRole}
                  onChange={(e) => setFilters({ ...filters, adminRole: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="society-admin">Society Admin</option>
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Apply Filters
          </button>
        </div>
      )}

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'Search Results'} ({results.length})
          </h3>
          {results.length > 0 && (
            <button
              onClick={handleSaveView}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Save View
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((result, idx) => {
              const Icon = result.icon
              return (
                <div key={`${result.type}-${idx}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{result.title}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{result.subtitle}</p>
                      <p className="text-xs text-slate-500 mt-1">{result.meta}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded">
                      {result.type}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No results found for "{searchQuery}"</p>
            <p className="text-sm text-slate-500 mt-1">Try different search terms or filters</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Enter search terms to get started</p>
            <p className="text-sm text-slate-500 mt-1">Search across societies, residents, admins, and visitors</p>
          </div>
        )}
      </div>

      {/* Saved Views Section */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Recent Searches</h3>
        <div className="space-y-2">
          {[
            'High occupancy societies',
            'Inactive admins',
            'High visitor societies',
          ].map((view, idx) => (
            <button
              key={idx}
              className="w-full text-left px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-900 text-sm font-medium"
            >
              {view}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
