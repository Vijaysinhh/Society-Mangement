'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, DollarSign, Calendar, AlertCircle, Eye, Edit, Trash2, Search, Download } from 'lucide-react'
import { getMaintenanceCollectionStats, MaintenanceFeeRecord } from '../lib/maintenanceFeeManager'
import PaymentRecordingForm from './PaymentRecordingForm'
import PaymentHistory from './PaymentHistory'
import ReceiptGenerator from './ReceiptGenerator'

interface CollectionsTabProps {
  societyId: string
  units: any[]
  society: any
}

export default function CollectionsTab({ societyId, units, society }: CollectionsTabProps) {
  const [stats, setStats] = useState(getMaintenanceCollectionStats())
  const [filteredFees, setFilteredFees] = useState<MaintenanceFeeRecord[]>([])
  const [selectedFee, setSelectedFee] = useState<MaintenanceFeeRecord | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'partially_paid'>('all')
  const [sortBy, setSortBy] = useState<'duedate' | 'outstanding' | 'unit'>('duedate')
  const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stats = getMaintenanceCollectionStats()
    setStats(stats)

    // Apply filters
    let filtered = stats.allFees
    if (filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === filterStatus)
    }
    if (searchTerm) {
      filtered = filtered.filter(f => {
        const unit = units.find(u => u.id === f.unitId)
        return unit?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Apply sorting
    if (sortBy === 'duedate') {
      filtered.sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
    } else if (sortBy === 'outstanding') {
      filtered.sort((a, b) => b.remainingAmount - a.remainingAmount)
    } else if (sortBy === 'unit') {
      filtered.sort((a, b) => {
        const unitA = units.find(u => u.id === a.unitId)?.unitNumber || ''
        const unitB = units.find(u => u.id === b.unitId)?.unitNumber || ''
        return unitA.localeCompare(unitB)
      })
    }

    setFilteredFees(filtered)
  }, [filterStatus, searchTerm, sortBy, units])

  const handlePaymentRecorded = (updatedFee: MaintenanceFeeRecord) => {
    setStats(getMaintenanceCollectionStats())
    setSelectedFee(updatedFee)
    setShowPaymentForm(false)
  }

  const toggleFeeSelection = (feeId: string) => {
    const newSelected = new Set(selectedFees)
    if (newSelected.has(feeId)) {
      newSelected.delete(feeId)
    } else {
      newSelected.add(feeId)
    }
    setSelectedFees(newSelected)
  }

  const getUnitDetails = (unitId: string) => units.find(u => u.id === unitId)

  const getStatusBadge = (status: string) => {
    const classes: { [key: string]: string } = {
      'paid': 'bg-green-100 text-green-800 border-green-300',
      'partially_paid': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'pending': 'bg-red-100 text-red-800 border-red-300',
    }
    const labels: { [key: string]: string } = {
      'paid': 'Paid',
      'partially_paid': 'Partial',
      'pending': 'Pending',
    }
    return `${classes[status] || classes['pending']} ${labels[status] || 'Unknown'}`
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Total Units</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUnits}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Collection Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats.collectionRate}%</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Collected</p>
          <p className="text-2xl font-bold text-slate-900">₹{(stats.collectedAmount / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-600">₹{(stats.pendingAmount / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Overdue</p>
          <p className="text-2xl font-bold text-orange-600">{stats.overdueUnits}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by unit number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="duedate">Sort by Due Date</option>
            <option value="outstanding">Sort by Outstanding</option>
            <option value="unit">Sort by Unit</option>
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
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFees(new Set(filteredFees.map(f => f.id)))
                      } else {
                        setSelectedFees(new Set())
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Month</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Outstanding</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => {
                const unit = getUnitDetails(fee.unitId)
                return (
                  <tr key={fee.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFees.has(fee.id)}
                        onChange={() => toggleFeeSelection(fee.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{unit?.unitNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{fee.month}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-900 font-semibold">₹{fee.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">₹{fee.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">₹{fee.remainingAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(fee.status)}`}>
                        {fee.status === 'paid' ? 'Paid' : fee.status === 'partially_paid' ? 'Partial' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedFee(fee)
                            setShowDetails(true)
                          }}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFee(fee)
                            setShowPaymentForm(true)
                          }}
                          className="p-1 hover:bg-indigo-100 rounded transition-colors"
                          title="Record payment"
                        >
                          <DollarSign className="w-4 h-4 text-indigo-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showPaymentForm && selectedFee && (
        <PaymentRecordingForm
          fee={selectedFee}
          unit={getUnitDetails(selectedFee.unitId)}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedFee(null)
          }}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {showDetails && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Payment Details - {getUnitDetails(selectedFee.unitId)?.unitNumber}</h3>
              <button
                onClick={() => {
                  setShowDetails(false)
                  setSelectedFee(null)
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <PaymentHistory fee={selectedFee} unit={getUnitDetails(selectedFee.unitId)} />
            <div className="border-t border-slate-200 pt-4">
              <ReceiptGenerator
                fee={selectedFee}
                unit={getUnitDetails(selectedFee.unitId)}
                society={society}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
