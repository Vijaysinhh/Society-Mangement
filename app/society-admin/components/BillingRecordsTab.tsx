'use client'

import { useState } from 'react'
import { Plus, X, Search, Filter, Download, ChevronDown, DollarSign, AlertCircle, TrendingUp, Calendar, Send, CheckCircle2, RotateCw, Edit2, Trash2, Eye, Clock, AlertTriangle, FileText, Edit } from 'lucide-react'

interface BillingRecordsTabProps {
  societyId: string
}

interface BillingRecord {
  id: string
  unitId: string
  owner: string
  chargeType: 'one-time' | 'recurring'
  description: string
  amount: number
  paidAmount: number
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue'
  createdDate: string
  dueDate: string
  lastPaymentDate?: string
  paymentMethod?: string
  frequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
  nextPaymentDate?: string
  daysOverdue: number
}

interface FilterState {
  chargeType: 'all' | 'one-time' | 'recurring'
  status: 'all' | 'pending' | 'partially_paid' | 'paid' | 'overdue'
  paymentMethod: 'all' | 'cash' | 'cheque' | 'transfer' | 'upi' | 'card'
  searchUnit: string
  sortBy: 'date' | 'amount' | 'status' | 'dueDate'
  dateRange: 'all' | 'this-month' | 'this-quarter' | 'overdue'
}

export default function BillingRecordsTab({ societyId }: BillingRecordsTabProps) {
  const [filters, setFilters] = useState<FilterState>({
    chargeType: 'all',
    status: 'all',
    paymentMethod: 'all',
    searchUnit: '',
    sortBy: 'date',
    dateRange: 'all'
  })
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null)
  const [showAddBillingModal, setShowAddBillingModal] = useState(false)
  const [showBulkActionModal, setShowBulkActionModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<'mark_paid' | 'send_reminder' | 'adjust' | 'cancel' | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([
    { id: '1', recordId: '1', date: '2026-03-28', amount: 500, method: 'cash', notes: 'March payment', status: 'completed' },
    { id: '2', recordId: '3', date: '2026-03-20', amount: 800, method: 'transfer', notes: 'Partial payment', status: 'completed' },
    { id: '3', recordId: '5', date: '2026-03-25', amount: 800, method: 'upi', notes: 'Full payment', status: 'completed' },
  ])
  const [editingRecord, setEditingRecord] = useState<BillingRecord | null>(null)

  // Delete record function
  const deleteRecord = (recordId: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      // Handle deletion logic here
      console.log('Deleting record:', recordId)
    }
  }

  // Sample billing data
  const billingRecords: BillingRecord[] = [
    {
      id: '1',
      unitId: '101',
      owner: 'Rajesh Kumar',
      chargeType: 'recurring',
      description: 'Monthly Water Charges',
      amount: 500,
      paidAmount: 500,
      status: 'paid',
      createdDate: '2026-03-01',
      dueDate: '2026-03-31',
      lastPaymentDate: '2026-03-28',
      paymentMethod: 'cash',
      frequency: 'monthly',
      nextPaymentDate: '2026-04-01',
      daysOverdue: 0
    },
    {
      id: '2',
      unitId: '102',
      owner: 'Priya Singh',
      chargeType: 'one-time',
      description: 'Parking Space Registration',
      amount: 2000,
      paidAmount: 0,
      status: 'pending',
      createdDate: '2026-02-15',
      dueDate: '2026-03-15',
      paymentMethod: undefined,
      daysOverdue: 0
    },
    {
      id: '3',
      unitId: '103',
      owner: 'Amit Patel',
      chargeType: 'recurring',
      description: 'Monthly Electricity Bill',
      amount: 1200,
      paidAmount: 800,
      status: 'partially_paid',
      createdDate: '2026-03-01',
      dueDate: '2026-03-31',
      lastPaymentDate: '2026-03-20',
      paymentMethod: 'transfer',
      frequency: 'monthly',
      nextPaymentDate: '2026-04-01',
      daysOverdue: 0
    },
    {
      id: '4',
      unitId: '104',
      owner: 'Neha Gupta',
      chargeType: 'one-time',
      description: 'Garden Maintenance - Special Project',
      amount: 5000,
      paidAmount: 0,
      status: 'overdue',
      createdDate: '2026-01-20',
      dueDate: '2026-02-20',
      paymentMethod: undefined,
      daysOverdue: 21
    },
    {
      id: '5',
      unitId: '105',
      owner: 'Vikram Singh',
      chargeType: 'recurring',
      description: 'Monthly Internet Services',
      amount: 800,
      paidAmount: 800,
      status: 'paid',
      createdDate: '2026-03-01',
      dueDate: '2026-03-31',
      lastPaymentDate: '2026-03-25',
      paymentMethod: 'upi',
      frequency: 'monthly',
      nextPaymentDate: '2026-04-01',
      daysOverdue: 0
    },
    {
      id: '6',
      unitId: '106',
      owner: 'Ananya Sharma',
      chargeType: 'recurring',
      description: 'Security Guard - Quarterly Payment',
      amount: 3000,
      paidAmount: 0,
      status: 'overdue',
      createdDate: '2025-12-01',
      dueDate: '2026-03-01',
      paymentMethod: undefined,
      frequency: 'quarterly',
      nextPaymentDate: '2026-06-01',
      daysOverdue: 12
    },
  ]

  // Calculate statistics
  const stats = {
    totalBillingAmount: billingRecords.reduce((sum, r) => sum + r.amount, 0),
    totalCollected: billingRecords.reduce((sum, r) => sum + r.paidAmount, 0),
    totalPending: billingRecords.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0),
    totalRecords: billingRecords.length,
    oneTimeCharges: billingRecords.filter(r => r.chargeType === 'one-time').length,
    recurringCharges: billingRecords.filter(r => r.chargeType === 'recurring').length,
    overdueAmount: billingRecords.filter(r => r.status === 'overdue').reduce((sum, r) => sum + (r.amount - r.paidAmount), 0),
    overdueCount: billingRecords.filter(r => r.status === 'overdue').length,
  }

  // Filter and sort records
  const filteredRecords = billingRecords
    .filter(record => {
      if (filters.chargeType !== 'all' && record.chargeType !== filters.chargeType) return false
      if (filters.status !== 'all' && record.status !== filters.status) return false
      if (filters.paymentMethod !== 'all' && record.paymentMethod !== filters.paymentMethod) return false
      if (filters.searchUnit && !record.unitId.toLowerCase().includes(filters.searchUnit.toLowerCase())) return false
      if (filters.dateRange === 'overdue' && record.status !== 'overdue') return false
      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'status':
          return a.status.localeCompare(b.status)
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'date':
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      }
    })

  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords)
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId)
    } else {
      newSelected.add(recordId)
    }
    setSelectedRecords(newSelected)
  }

  const exportToCSV = () => {
    const headers = ['Unit', 'Owner', 'Type', 'Description', 'Amount', 'Paid', 'Pending', 'Status', 'Due Date']
    const rows = filteredRecords.map(record => [
      record.unitId,
      record.owner,
      record.chargeType,
      record.description,
      record.amount,
      record.paidAmount,
      record.amount - record.paidAmount,
      record.status,
      record.dueDate
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent))
    element.setAttribute('download', `billing-records-${new Date().getTime()}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Statistics Grid - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border border-blue-200 p-3.5 sm:p-4 lg:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Total Billing</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 leading-tight">₹{stats.totalBillingAmount.toLocaleString()}</p>
          <p className="text-xs text-blue-700 mt-2">{stats.totalRecords} records</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl border border-green-200 p-3.5 sm:p-4 lg:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">Collected</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 leading-tight">₹{stats.totalCollected.toLocaleString()}</p>
          <p className="text-xs text-green-700 mt-2">{Math.round((stats.totalCollected / stats.totalBillingAmount) * 100)}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl border border-orange-200 p-3.5 sm:p-4 lg:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1.5">Pending</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 leading-tight">₹{stats.totalPending.toLocaleString()}</p>
          <p className="text-xs text-orange-700 mt-2">Outstanding</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl border border-red-200 p-3.5 sm:p-4 lg:p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">Overdue</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 leading-tight">₹{stats.overdueAmount.toLocaleString()}</p>
          <p className="text-xs text-red-700 mt-2">{stats.overdueCount} records</p>
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Filters</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => {
                if (selectedRecords.size > 0) setShowBulkActionModal(true)
                else alert('Please select at least one billing record')
              }} 
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk</span>
              {selectedRecords.size > 0 && `(${selectedRecords.size})`}
            </button>
            <button onClick={() => setShowAddBillingModal(true)} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Billing</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button onClick={exportToCSV} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Search Unit</label>
            <input
              type="text"
              placeholder="Unit ID..."
              value={filters.searchUnit}
              onChange={(e) => setFilters({ ...filters, searchUnit: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Charge Type</label>
            <select
              value={filters.chargeType}
              onChange={(e) => setFilters({ ...filters, chargeType: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="one-time">One-Time</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="transfer">Transfer</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Dates</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="overdue">Overdue Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billing Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecords(new Set(filteredRecords.map(r => r.id)))
                      } else {
                        setSelectedRecords(new Set())
                      }
                    }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-slate-700 text-xs">Unit</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-slate-700 text-xs hidden sm:table-cell">Description</th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold text-slate-700 text-xs">Amount</th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold text-slate-700 text-xs hidden lg:table-cell">Paid</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold text-slate-700 text-xs">Status</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold text-slate-700 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-slate-900">Unit {record.unitId}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-700 hidden sm:table-cell truncate">{record.description}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-bold">
                      <div className="text-slate-900">₹{record.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-600 lg:hidden">{record.paidAmount > 0 ? `Paid: ₹${record.paidAmount.toLocaleString()}` : '-'}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right font-semibold text-green-600 hidden lg:table-cell">₹{record.paidAmount.toLocaleString()}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        record.status === 'paid' ? 'bg-green-100 text-green-700' :
                        record.status === 'pending' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status === 'paid' ? 'Paid' : record.status === 'pending' ? 'Pending' : 'Partial'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            setEditingRecord(record)
                            setShowAddBillingModal(true)
                          }}
                          className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="text-slate-500 font-medium">No billing records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="card">Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
              <textarea
                placeholder="Payment notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setPaymentAmount('')
                  setPaymentMethod('cash')
                  setPaymentNotes('')
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Payment of ₹${paymentAmount} recorded via ${paymentMethod}`)
                  setShowPaymentModal(false)
                  setPaymentAmount('')
                  setPaymentMethod('cash')
                  setPaymentNotes('')
                }}
                disabled={!paymentAmount}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Bulk Actions</h3>
              <button onClick={() => setShowBulkActionModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">Selected records: <span className="font-bold">{selectedRecords.size}</span></p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  alert(`Mark ${selectedRecords.size} records as paid`)
                  setShowBulkActionModal(false)
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Paid
              </button>
              <button
                onClick={() => {
                  alert(`Send reminders to ${selectedRecords.size} units`)
                  setShowBulkActionModal(false)
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Reminders
              </button>
              <button
                onClick={() => {
                  alert(`Adjust amounts for ${selectedRecords.size} records`)
                  setShowBulkActionModal(false)
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Adjust Amounts
              </button>
              <button
                onClick={() => {
                  alert(`Cancel recurring charges for ${selectedRecords.size} records`)
                  setShowBulkActionModal(false)
                }}
                className="w-full px-4 py-2 text-left text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Cancel Recurring
              </button>
            </div>

            <button
              onClick={() => setShowBulkActionModal(false)}
              className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment History & Transaction Tracking */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            Recent Payment Transactions
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">Last 30 days</span>
        </div>
        <div className="divide-y divide-slate-200">
          {paymentHistory.length > 0 ? (
            paymentHistory.map(transaction => {
              const record = billingRecords.find(r => r.id === transaction.recordId)
              return (
                <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-green-600" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">Unit {record?.unitId} • {record?.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{transaction.date} • Via {transaction.method.toUpperCase()}</p>
                        {transaction.notes && <p className="text-xs text-slate-600 mt-1">Note: {transaction.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">₹{transaction.amount.toLocaleString()}</p>
                      <span className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded bg-green-100 text-green-800">
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>No payment transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
