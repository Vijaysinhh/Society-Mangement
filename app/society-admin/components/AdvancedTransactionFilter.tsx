import React, { useState } from 'react'
import { Search, Filter, X, Save, Loader } from 'lucide-react'
import { useFinancial, FilterState } from '@/contexts/FinancialContext'

export function AdvancedTransactionFilter() {
  const { filters, setFilters, filterPresets, saveFilterPreset, loadFilterPreset } = useFinancial()
  const [isOpen, setIsOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [showPresetInput, setShowPresetInput] = useState(false)

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      dateFrom: e.target.value ? new Date(e.target.value) : undefined,
    })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      dateTo: e.target.value ? new Date(e.target.value) : undefined,
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      searchQuery: e.target.value || undefined,
    })
  }

  const handleTypeFilterChange = (type: string) => {
    const current = filters.typeFilter || []
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    setFilters({
      ...filters,
      typeFilter: updated.length > 0 ? updated : undefined,
    })
  }

  const handleStatusFilterChange = (status: string) => {
    const current = filters.statusFilter || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    setFilters({
      ...filters,
      statusFilter: updated.length > 0 ? updated : undefined,
    })
  }

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      saveFilterPreset(newPresetName, filters)
      setNewPresetName('')
      setShowPresetInput(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const isFiltersActive = Object.values(filters).some(v => v !== undefined && v !== '')

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 lg:p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by description or reference number..."
          value={filters.searchQuery || ''}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors w-full justify-center ${
          isFiltersActive
            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <Filter className="w-4 h-4" />
        Advanced Filters {isFiltersActive && <span className="text-xs font-bold">({Object.values(filters).filter(v => v).length})</span>}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">From</label>
                <input
                  type="date"
                  value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                  onChange={handleDateFromChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">To</label>
                <input
                  type="date"
                  value={filters.dateTo?.toISOString().split('T')[0] || ''}
                  onChange={handleDateToChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Transaction Type</label>
            <div className="space-y-2">
              {['payment', 'expense', 'adjustment'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.typeFilter?.includes(type) || false}
                    onChange={() => handleTypeFilterChange(type)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Status</label>
            <div className="space-y-2">
              {['completed', 'pending', 'failed'].map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.statusFilter?.includes(status) || false}
                    onChange={() => handleStatusFilterChange(status)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-300">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowPresetInput(true)}
              className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preset
            </button>
          </div>
        </div>
      )}

      {/* Save Preset Input */}
      {showPresetInput && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Preset name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            onClick={handleSavePreset}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowPresetInput(false)
              setNewPresetName('')
            }}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Presets */}
      {filterPresets.size > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Saved Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from(filterPresets.keys()).map(preset => (
              <button
                key={preset}
                onClick={() => loadFilterPreset(preset)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
