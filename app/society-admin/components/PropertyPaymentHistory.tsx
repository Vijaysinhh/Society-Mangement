'use client'

import React, { useState } from 'react'
import { Search, Filter, TrendingUp, Download, ChevronDown, ChevronUp, Home, DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface PropertyPayment {
  id: string
  propertyId: string
  unitNumber: string
  residentName: string
  residentRole: 'Owner' | 'Tenant'
  amount: number
  paymentType: 'rent' | 'maintenance' | 'tax' | 'other'
  month: string
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue'
  paymentMethod?: string
  transactionId?: string
}

interface PropertyPaymentHistoryProps {
  propertyId?: string
  societyId: string
}

export default function PropertyPaymentHistory({ propertyId, societyId }: PropertyPaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<string | null>(propertyId || null)
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string[]>(['paid', 'pending', 'overdue'])
  const [selectedPaymentType, setSelectedPaymentType] = useState<string[]>(['rent', 'maintenance', 'tax', 'other'])

  const [payments, setPayments] = useState<PropertyPayment[]>([
    // Property A-101 Payments
    { id: 'p1', propertyId: '1', unitNumber: 'A-101', residentName: 'Rajesh Kumar', residentRole: 'Owner', amount: 0, paymentType: 'maintenance', month: 'May 2024', dueDate: '5 May 2024', paidDate: '3 May 2024', status: 'paid', paymentMethod: 'bank-transfer', transactionId: 'TXN001' },
    { id: 'p2', propertyId: '1', unitNumber: 'A-101', residentName: 'Priya Sharma', residentRole: 'Tenant', amount: 15000, paymentType: 'rent', month: 'May 2024', dueDate: '1 May 2024', paidDate: '2 May 2024', status: 'paid', paymentMethod: 'upi', transactionId: 'TXN002' },
    { id: 'p3', propertyId: '1', unitNumber: 'A-101', residentName: 'Priya Sharma', residentRole: 'Tenant', amount: 15000, paymentType: 'rent', month: 'April 2024', dueDate: '1 April 2024', paidDate: '2 April 2024', status: 'paid', paymentMethod: 'upi', transactionId: 'TXN003' },
    { id: 'p4', propertyId: '1', unitNumber: 'A-101', residentName: 'Neha Verma', residentRole: 'Tenant', amount: 15000, paymentType: 'rent', month: 'June 2024', dueDate: '1 June 2024', paidDate: '1 June 2024', status: 'paid', paymentMethod: 'upi', transactionId: 'TXN004' },
    { id: 'p5', propertyId: '1', unitNumber: 'A-101', residentName: 'Neha Verma', residentRole: 'Tenant', amount: 15000, paymentType: 'rent', month: 'July 2024', dueDate: '1 July 2024', paidDate: undefined, status: 'pending', paymentMethod: undefined, transactionId: undefined },

    // Property A-102 Payments
    { id: 'p6', propertyId: '2', unitNumber: 'A-102', residentName: 'Amit Patel', residentRole: 'Owner', amount: 6500, paymentType: 'maintenance', month: 'May 2024', dueDate: '5 May 2024', paidDate: undefined, status: 'overdue', paymentMethod: undefined, transactionId: undefined },
    { id: 'p7', propertyId: '2', unitNumber: 'A-102', residentName: 'Amit Patel', residentRole: 'Owner', amount: 6500, paymentType: 'maintenance', month: 'April 2024', dueDate: '5 April 2024', paidDate: '8 April 2024', status: 'paid', paymentMethod: 'bank-transfer', transactionId: 'TXN005' },

    // Property B-201 Payments
    { id: 'p8', propertyId: '3', unitNumber: 'B-201', residentName: 'Suresh Iyer', residentRole: 'Owner', amount: 6500, paymentType: 'maintenance', month: 'May 2024', dueDate: '5 May 2024', paidDate: '4 May 2024', status: 'paid', paymentMethod: 'cheque', transactionId: 'CHQ001' },
    { id: 'p9', propertyId: '3', unitNumber: 'B-201', residentName: 'Vikram Singh', residentRole: 'Tenant', amount: 18000, paymentType: 'rent', month: 'May 2024', dueDate: '1 May 2024', paidDate: '1 May 2024', status: 'paid', paymentMethod: 'upi', transactionId: 'TXN006' },
    { id: 'p10', propertyId: '3', unitNumber: 'B-201', residentName: 'Vikram Singh', residentRole: 'Tenant', amount: 18000, paymentType: 'rent', month: 'June 2024', dueDate: '1 June 2024', paidDate: '2 June 2024', status: 'paid', paymentMethod: 'upi', transactionId: 'TXN007' },

    // Property B-202 Payments
    { id: 'p11', propertyId: '4', unitNumber: 'B-202', residentName: 'Neha Verma', residentRole: 'Owner', amount: 6500, paymentType: 'maintenance', month: 'May 2024', dueDate: '5 May 2024', paidDate: undefined, status: 'pending', paymentMethod: undefined, transactionId: undefined },

    // Property C-301 Payments
    { id: 'p12', propertyId: '5', unitNumber: 'C-301', residentName: 'Vikram Singh', residentRole: 'Owner', amount: 6500, paymentType: 'maintenance', month: 'May 2024', dueDate: '5 May 2024', paidDate: '5 May 2024', status: 'paid', paymentMethod: 'bank-transfer', transactionId: 'TXN008' },
  ])

  const properties = [
    { id: '1', unitNumber: 'A-101', floor: 1, owner: 'Rajesh Kumar' },
    { id: '2', unitNumber: 'A-102', floor: 1, owner: 'Amit Patel' },
    { id: '3', unitNumber: 'B-201', floor: 2, owner: 'Suresh Iyer' },
    { id: '4', unitNumber: 'B-202', floor: 2, owner: 'Neha Verma' },
    { id: '5', unitNumber: 'C-301', floor: 3, owner: 'Vikram Singh' },
  ]

  const getPropertyPayments = (pid: string) => {
    return payments.filter(p => p.propertyId === pid)
  }

  const getStatusColor = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'overdue':
        return 'bg-red-100 text-red-700'
    }
  }

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'rent':
        return '🏠'
      case 'maintenance':
        return '🔧'
      case 'tax':
        return '📋'
      default:
        return '💰'
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'rent':
        return 'Rent'
      case 'maintenance':
        return 'Maintenance'
      case 'tax':
        return 'Tax'
      default:
        return 'Other'
    }
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) || p.owner.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredPayments = selectedProperty
    ? getPropertyPayments(selectedProperty).filter(p => {
        const matchesStatus = selectedPaymentStatus.includes(p.status)
        const matchesType = selectedPaymentType.includes(p.paymentType)
        return matchesStatus && matchesType
      })
    : []

  const stats = selectedProperty ? {
    totalAmount: getPropertyPayments(selectedProperty).reduce((sum, p) => sum + p.amount, 0),
    paid: getPropertyPayments(selectedProperty).filter(p => p.status === 'paid').length,
    pending: getPropertyPayments(selectedProperty).filter(p => p.status === 'pending').length,
    overdue: getPropertyPayments(selectedProperty).filter(p => p.status === 'overdue').length,
  } : null

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Payment History by Property</h2>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFiltersModal(true)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
          >
            <Filter className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {filteredProperties.map((property) => {
          const propertyPayments = getPropertyPayments(property.id)
          const isExpanded = expandedPropertyId === property.id
          const totalAmount = propertyPayments.reduce((sum, p) => sum + p.amount, 0)
          const paidCount = propertyPayments.filter(p => p.status === 'paid').length
          const pendingCount = propertyPayments.filter(p => p.status === 'pending').length
          const overdueCount = propertyPayments.filter(p => p.status === 'overdue').length

          return (
            <div key={property.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Property Header - Click to Expand */}
              <div
                onClick={() => setExpandedPropertyId(isExpanded ? null : property.id)}
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-slate-900">{property.unitNumber}</h3>
                      <span className="text-xs font-semibold text-slate-500">Floor {property.floor}</span>
                    </div>
                    <p className="text-sm text-slate-600">Owner: {property.owner}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{propertyPayments.length} records</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-2 mt-3">
                  {paidCount > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      {paidCount} Paid
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                      {pendingCount} Pending
                    </span>
                  )}
                  {overdueCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                      {overdueCount} Overdue
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Payment List */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2">
                  {propertyPayments.length > 0 ? (
                    propertyPayments.map((payment) => (
                      <div key={payment.id} className="bg-white rounded-lg p-3 border border-slate-100 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getPaymentTypeIcon(payment.paymentType)}</span>
                              <p className="text-sm font-semibold text-slate-900">{getPaymentTypeLabel(payment.paymentType)} - {payment.month}</p>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Paid by: <span className="font-semibold">{payment.residentName}</span> ({payment.residentRole})
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-600">
                              <span>Due: {payment.dueDate}</span>
                              {payment.paidDate && <span>Paid: {payment.paidDate}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                            {payment.transactionId && (
                              <p className="text-xs text-slate-500">{payment.transactionId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">No payments recorded</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Payment Filters</h3>
              <button onClick={() => setShowFiltersModal(false)} className="text-slate-400 hover:text-slate-600">
                X
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Status</label>
                <div className="space-y-2">
                  {['paid', 'pending', 'overdue'].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300"
                        checked={selectedPaymentStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentStatus([...selectedPaymentStatus, status])
                          } else {
                            setSelectedPaymentStatus(selectedPaymentStatus.filter(s => s !== status))
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Type</label>
                <div className="space-y-2">
                  {['rent', 'maintenance', 'tax', 'other'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300"
                        checked={selectedPaymentType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentType([...selectedPaymentType, type])
                          } else {
                            setSelectedPaymentType(selectedPaymentType.filter(t => t !== type))
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">{getPaymentTypeLabel(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedPaymentStatus(['paid', 'pending', 'overdue'])
                    setSelectedPaymentType(['rent', 'maintenance', 'tax', 'other'])
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
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
