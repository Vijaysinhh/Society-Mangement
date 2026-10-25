'use client'

import { useState } from 'react'
import { Search, Filter, LayoutDashboard, Wallet, Building, ArrowLeftRight } from 'lucide-react'
import OverviewReportsTab from './tabs/OverviewReportsTab'
import MaintenanceFeeTab from './tabs/MaintenanceFeeTab'
import AmenitiesBookingsTab from './tabs/AmenitiesBookingsTab'
import TransactionsTab from './tabs/TransactionsTab'
import ConnectedMaintenanceBilling from './ConnectedMaintenanceBilling'

type FinancesTab = 'overview' | 'maintenance' | 'amenities' | 'transactions' | 'billing'

interface FinancesMobileProps {
  societyId: string
}

interface FilterState {
  searchTerm: string
  dateFrom?: string
  dateTo?: string
  propertyId?: string
}

export default function FinancesMobile({ societyId }: FinancesMobileProps) {
  const [activeTab, setActiveTab] = useState<FinancesTab>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
  })
  const [showFiltersModal, setShowFiltersModal] = useState(false)

  // 4 clean tabs for mobile
  const tabs = [
    { id: 'overview' as FinancesTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'maintenance' as FinancesTab, label: 'Maintenance', icon: Wallet },
    { id: 'amenities' as FinancesTab, label: 'Amenities', icon: Building },
    { id: 'transactions' as FinancesTab, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'billing' as FinancesTab, label: 'Live Billing', icon: Wallet },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Finances</h2>
            <button
              onClick={() => setShowFiltersModal(true)}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-900">Filters</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions, properties..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setFilters({ ...filters, searchTerm: e.target.value })
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Tab Navigation - Inside sticky header for easy access */}
        <div className="flex border-t border-slate-100">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full pb-24">
        {activeTab === 'overview' && (
          <OverviewReportsTab searchTerm={searchTerm} filters={filters} />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceFeeTab searchTerm={searchTerm} filters={filters} />
        )}

        {activeTab === 'amenities' && (
          <AmenitiesBookingsTab searchTerm={searchTerm} filters={filters} />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab searchTerm={searchTerm} filters={filters} />
        )}

        {activeTab === 'billing' && (
          <div className="p-4">
            <ConnectedMaintenanceBilling societyId={societyId} embedded />
          </div>
        )}
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFiltersModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setFilters({ searchTerm: '' })
                    setSearchTerm('')
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

