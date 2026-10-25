'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, ChevronDown, CheckCircle2, AlertTriangle, Clock, DollarSign, Users, TrendingUp, X, Send, FileText, Download } from 'lucide-react'
import { useBills } from '@/hooks/useResidentData'

interface CollectionsDashboardProps {
  societyId: string
}

export default function CollectionsDashboard({ societyId }: CollectionsDashboardProps) {
  const { bills, loading, error, refetch } = useBills()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({ billId: '', amount: '', method: 'cash' })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading collection data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading collections</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={refetch} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    )
  }

  const displayFees = bills

  // Filter and search
  const filteredFees = useMemo(() => {
    return displayFees.filter(fee => {
      const matchesSearch = fee.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.residentName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || fee.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [displayFees, searchTerm, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const total = displayFees.length
    const paidCount = displayFees.filter(f => f.status === 'paid').length
    const pendingCount = displayFees.filter(f => f.status === 'pending').length
    const overdueCount = displayFees.filter(f => f.status === 'overdue').length
    const totalAmount = displayFees.reduce((sum, f) => sum + f.amount, 0)
    const collectedAmount = displayFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)
    const collectionRate = total > 0 ? Math.round((paidCount / total) * 100) : 0

    return { total, paidCount, pendingCount, overdueCount, totalAmount, collectedAmount, collectionRate }
  }, [displayFees])

  const toggleFeeSelection = (id: string) => {
    const newSelection = new Set(selectedFees)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedFees(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedFees.size === filteredFees.length) {
      setSelectedFees(new Set())
    } else {
      setSelectedFees(new Set(filteredFees.map(f => f.id)))
    }
  }

  const handleRecordPayment = () => {
    if (paymentData.unitId && paymentData.amount) {
      console.log('[v0] Recording payment:', paymentData)
      setShowPaymentModal(false)
      setPaymentData({ unitId: '', amount: '', method: 'cash' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header with Quick Action */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Maintenance Fee Collections</h1>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Record Payment
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Collection Rate</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.collectionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{stats.paidCount} of {stats.total} paid</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Collected</span>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">₹{(stats.collectedAmount / 1000).toFixed(1)}K</div>
            <p className="text-xs text-slate-500 mt-1">of ₹{(stats.totalAmount / 1000).toFixed(1)}K</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Pending</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.pendingCount}</div>
            <p className="text-xs text-slate-500 mt-1">waiting for payment</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Overdue</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.overdueCount}</div>
            <p className="text-xs text-slate-500 mt-1">past due date</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search unit number or resident name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedFees.size === filteredFees.length && filteredFees.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Resident</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFees.has(fee.id)}
                      onChange={() => toggleFeeSelection(fee.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{fee.unitNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{fee.residentName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">₹{fee.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(fee.status)} w-fit`}>
                      {getStatusIcon(fee.status)}
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      Mark Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFees.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-slate-500">No fees found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Sticky Bulk Actions Bar */}
      {selectedFees.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">{selectedFees.size}</span> fee{selectedFees.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Send Reminder
            </button>
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Mark All as Paid
            </button>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Unit</label>
                <select
                  value={paymentData.unitId}
                  onChange={(e) => setPaymentData({ ...paymentData, unitId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Choose a unit...</option>
                  {displayFees.filter(f => f.status !== 'paid').map(fee => (
                    <option key={fee.id} value={fee.id}>
                      {fee.unitNumber} - {fee.residentName} (₹{fee.amount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount Paid</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
                <div className="space-y-2">
                  {['cash', 'cheque', 'upi', 'bank', 'online'].map(method => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={paymentData.method === method}
                        onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                        className="rounded-full border-slate-300"
                      />
                      <span className="text-sm text-slate-700 capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Save & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
