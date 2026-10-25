'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Search, Filter, Download, ChevronDown, DollarSign, AlertCircle, TrendingUp, Users, Calendar, Send, Zap, Edit, Trash2, Eye, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react'
import { getMaintenanceCollectionStats, recordMaintenancePayment, getUnitMaintenanceFees, triggerSync } from '../lib/maintenanceFeeManager'

interface MaintenanceFeesTabProps {
  societyId: string
  units?: any[]
}

interface FilterState {
  status: 'all' | 'paid' | 'partially_paid' | 'pending'
  overdueOnly: boolean
  searchUnit: string
  sortBy: 'date' | 'amount' | 'status' | 'overdue'
}

export default function MaintenanceFeesTab({ societyId, units = [] }: MaintenanceFeesTabProps) {
  const [stats, setStats] = useState(getMaintenanceCollectionStats())
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    overdueOnly: false,
    searchUnit: '',
    sortBy: 'date'
  })
  const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [expandedFeeId, setExpandedFeeId] = useState<string | null>(null)
  
  // Enhanced Features
  const [showBulkFeeModal, setShowBulkFeeModal] = useState(false)
  const [bulkFeeAmount, setBulkFeeAmount] = useState('')
  const [bulkFeeMonth, setBulkFeeMonth] = useState('')
  const [showAdvancedActions, setShowAdvancedActions] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'remind' | 'collect' | 'adjust' | 'waive' | 'notice' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [feeHistory, setFeeHistory] = useState<any>([
    { id: '1', date: '2026-03-10', unit: '101', action: 'Payment Recorded', amount: 5000, method: 'cash', status: 'completed' },
    { id: '2', date: '2026-03-09', unit: '105', action: 'Fee Applied', amount: 6000, method: 'system', status: 'completed' },
    { id: '3', date: '2026-03-08', unit: '103', action: 'Reminder Sent', amount: 4000, method: 'email', status: 'sent' },
    { id: '4', date: '2026-02-28', unit: '102', action: 'Penalty Waived', amount: 2000, method: 'manual', status: 'approved' },
  ])

  // Load stats on mount and set up sync listener
  useEffect(() => {
    const updateStats = () => setStats(getMaintenanceCollectionStats())
    updateStats()

    const handleSync = () => updateStats()
    window.addEventListener('maintenanceFeeSync', handleSync)
    
    return () => window.removeEventListener('maintenanceFeeSync', handleSync)
  }, [])

  // Filter and sort fees
  const filteredFees = stats.allFees
    .filter(fee => {
      if (filters.status !== 'all' && fee.status !== filters.status) return false
      if (filters.overdueOnly && fee.daysOverdue === 0) return false
      if (filters.searchUnit && !fee.unitId.toLowerCase().includes(filters.searchUnit.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'amount':
          return b.remainingAmount - a.remainingAmount
        case 'status':
          return a.status.localeCompare(b.status)
        case 'overdue':
          return b.daysOverdue - a.daysOverdue
        case 'date':
        default:
          return new Date(b.month).getTime() - new Date(a.month).getTime()
      }
    })

  const handleBulkPayment = () => {
    if (!paymentAmount || selectedFees.size === 0) return

    const amount = parseFloat(paymentAmount)
    let remaining = amount
    const selectedArray = Array.from(selectedFees)

    selectedArray.forEach(feeId => {
      const fee = stats.allFees.find(f => f.id === feeId)
      if (fee && remaining > 0) {
        const payAmount = Math.min(remaining, fee.remainingAmount)
        recordMaintenancePayment(fee, payAmount, payAmount === fee.remainingAmount ? 'full' : 'partial', paymentNotes, paymentMethod)
        remaining -= payAmount
      }
    })

    setSelectedFees(new Set())
    setPaymentAmount('')
    setPaymentMethod('cash')
    setPaymentNotes('')
    setShowPaymentModal(false)
    triggerSync()
  }

  const handleSelectAll = () => {
    if (selectedFees.size === filteredFees.length) {
      setSelectedFees(new Set())
    } else {
      setSelectedFees(new Set(filteredFees.map(f => f.id)))
    }
  }

  const exportToCSV = () => {
    const headers = ['Unit ID', 'Month', 'Total Amount', 'Paid Amount', 'Remaining Amount', 'Status', 'Days Overdue']
    const rows = filteredFees.map(fee => [
      fee.unitId,
      fee.month,
      fee.totalAmount,
      fee.paidAmount,
      fee.remainingAmount,
      fee.status,
      fee.daysOverdue
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maintenance-fees-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase">Units</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalUnits}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase">Paid</p>
              <p className="text-2xl font-bold text-green-900">{stats.paidUnits}</p>
              <p className="text-xs text-green-700 mt-1">{Math.round(stats.collectionRate)}% collected</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase">Partial</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.partiallyPaidUnits}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{stats.overdueUnits}</p>
              <p className="text-xs text-red-700 mt-1">Avg {stats.averageDaysOverdue}d late</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase">Collection</p>
              <p className="text-2xl font-bold text-purple-900">₹{(stats.collectedAmount / 100000).toFixed(1)}L</p>
              <p className="text-xs text-purple-700 mt-1">Pending ₹{(stats.pendingAmount / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600 opacity-30" />
          </div>
        </div>
      </div>

      {/* Filters & Actions - Mobile Optimized */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Filters</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowBulkFeeModal(true)} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 active:scale-95 transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Apply Fees</span>
              <span className="sm:hidden">Fees</span>
            </button>
            <button onClick={() => setShowAdvancedActions(!showAdvancedActions)} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Actions</span>
            </button>
            <button onClick={exportToCSV} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search unit..."
              value={filters.searchUnit}
              onChange={(e) => setFilters({ ...filters, searchUnit: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
            <option value="overdue">Sort by Overdue Days</option>
          </select>

          {/* Overdue Only Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={filters.overdueOnly}
              onChange={(e) => setFilters({ ...filters, overdueOnly: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-700">Overdue Only</span>
          </label>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedFees.size === filteredFees.length && filteredFees.length > 0}
                    onChange={() => {
                      if (selectedFees.size === filteredFees.length) {
                        setSelectedFees(new Set())
                      } else {
                        setSelectedFees(new Set(filteredFees.map(f => f.id)))
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700">Unit</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 hidden sm:table-cell">Owner</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-slate-700">Amount</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-slate-700 hidden lg:table-cell">Paid</th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700">Status</th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 hidden sm:table-cell">Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length > 0 ? (
                filteredFees.map((fee, idx) => (
                  <tr key={fee.id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-3 sm:px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFees.has(fee.id)}
                        onChange={(e) => {
                          const updated = new Set(selectedFees)
                          if (e.target.checked) {
                            updated.add(fee.id)
                          } else {
                            updated.delete(fee.id)
                          }
                          setSelectedFees(updated)
                        }}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm font-bold text-slate-900">{fee.unitId}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-slate-700 hidden sm:table-cell truncate">{fee.ownerName || '-'}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-right font-bold">
                      <div className="text-slate-900">₹{fee.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-slate-600 lg:hidden">Paid: ₹{fee.paidAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-right font-semibold text-green-600 hidden lg:table-cell">₹{fee.paidAmount.toLocaleString()}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                        fee.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {fee.status === 'paid' ? 'Paid' : fee.status === 'partially_paid' ? 'Partial' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center hidden sm:table-cell">
                      {fee.daysOverdue > 0 ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{fee.daysOverdue}d</span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="font-medium">No maintenance fees found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee History & Audit Trail */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            Recent Fee Activities & Audit Trail
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">Last 30 days</span>
        </div>
        <div className="divide-y divide-slate-200">
          {feeHistory.map(activity => (
            <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.status === 'completed' ? 'bg-green-600' :
                    activity.status === 'sent' ? 'bg-indigo-600' :
                    'bg-purple-600'
                  }`} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">Unit {activity.unit} • {activity.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.date} • Via {activity.method}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">₹{activity.amount.toLocaleString()}</p>
                  <span className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {activity.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
