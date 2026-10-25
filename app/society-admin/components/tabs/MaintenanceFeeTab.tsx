'use client'

import { useState } from 'react'
import { IndianRupee, Bell, AlertTriangle, CheckCircle, Clock, Send, Settings, Plus, ChevronDown, ChevronUp, X } from 'lucide-react'

interface MaintenanceFeeTabProps {
  searchTerm: string
  filters: {
    searchTerm: string
    dateFrom?: string
    dateTo?: string
  }
}

// Mock properties for fee structure
const propertyTypes = [
  { id: '1bhk', name: '1 BHK', count: 10, defaultFee: 3000 },
  { id: '2bhk', name: '2 BHK', count: 15, defaultFee: 4500 },
  { id: '3bhk', name: '3 BHK', count: 8, defaultFee: 6000 },
  { id: 'penthouse', name: 'Penthouse', count: 2, defaultFee: 10000 },
]

// Mock pending collection data
const pendingCollection = [
  { id: '1', property: 'A-101', owner: 'Mr. Sharma', phone: '+91 98765 43210', type: '2 BHK', amount: 4500, dueDate: '2026-05-10', status: 'pending', daysOverdue: 0 },
  { id: '2', property: 'B-201', owner: 'Mr. Kumar', phone: '+91 98765 43211', type: '2 BHK', amount: 4500, dueDate: '2026-05-10', status: 'overdue', daysOverdue: 19 },
  { id: '3', property: 'C-301', owner: 'Mr. Reddy', phone: '+91 98765 43212', type: '3 BHK', amount: 6000, dueDate: '2026-04-10', status: 'overdue', daysOverdue: 49 },
  { id: '4', property: 'A-102', owner: 'Mrs. Patel', phone: '+91 98765 43213', type: '2 BHK', amount: 4500, dueDate: '2026-05-10', status: 'pending', daysOverdue: 0 },
  { id: '5', property: 'D-401', owner: 'Ms. Singh', phone: '+91 98765 43214', type: '3 BHK', amount: 6000, dueDate: '2026-03-10', status: 'overdue', daysOverdue: 80 },
]

// Mock paid collection data
const paidCollection = [
  { id: '6', property: 'B-202', owner: 'Mr. Gupta', type: '2 BHK', amount: 4500, paidDate: '2026-05-08', method: 'UPI' },
  { id: '7', property: 'A-103', owner: 'Mrs. Joshi', type: '1 BHK', amount: 3000, paidDate: '2026-05-05', method: 'Cash' },
  { id: '8', property: 'C-302', owner: 'Mr. Verma', type: '3 BHK', amount: 6000, paidDate: '2026-05-03', method: 'Bank Transfer' },
]

export default function MaintenanceFeeTab({ searchTerm, filters }: MaintenanceFeeTabProps) {
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('June 2026')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [selectedPayment, setSelectedPayment] = useState<typeof pendingCollection[0] | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [feeStructure, setFeeStructure] = useState(propertyTypes)
  const [collectionView, setCollectionView] = useState<'pending' | 'paid'>('pending')

  // Calculate stats
  const stats = {
    totalExpected: pendingCollection.reduce((sum, p) => sum + p.amount, 0) + paidCollection.reduce((sum, p) => sum + p.amount, 0),
    totalCollected: paidCollection.reduce((sum, p) => sum + p.amount, 0),
    totalPending: pendingCollection.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: pendingCollection.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
  }

  // Defaulters (overdue > 30 days)
  const defaulters = pendingCollection.filter(p => p.daysOverdue > 30)

  const handleSelectAll = () => {
    if (selectedProperties.length === pendingCollection.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(pendingCollection.map(p => p.id))
    }
  }

  const handleSelectProperty = (id: string) => {
    if (selectedProperties.includes(id)) {
      setSelectedProperties(selectedProperties.filter(p => p !== id))
    } else {
      setSelectedProperties([...selectedProperties, id])
    }
  }

  const handleMarkPaid = (property: typeof pendingCollection[0]) => {
    setSelectedPayment(property)
    setShowPaymentModal(true)
  }

  const filteredPending = pendingCollection.filter(p => 
    p.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPaid = paidCollection.filter(p => 
    p.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-slate-500">Expected</span>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{(stats.totalExpected / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-1">May 2026</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-slate-500">Collected</span>
          </div>
          <p className="text-xl font-bold text-green-600">₹{(stats.totalCollected / 1000).toFixed(1)}K</p>
          <p className="text-xs text-green-600 mt-1">{Math.round((stats.totalCollected / stats.totalExpected) * 100)}% collected</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-slate-500">Pending</span>
          </div>
          <p className="text-xl font-bold text-amber-600">₹{(stats.totalPending / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-1">{pendingCollection.filter(p => p.status === 'pending').length} properties</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs text-slate-500">Overdue</span>
          </div>
          <p className="text-xl font-bold text-red-600">₹{(stats.totalOverdue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-1">{pendingCollection.filter(p => p.status === 'overdue').length} properties</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Fees
        </button>
        <button
          onClick={() => setShowFeeStructureModal(true)}
          className="px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-medium text-sm flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Reminder Button */}
      {selectedProperties.length > 0 && (
        <button
          onClick={() => setShowReminderModal(true)}
          className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Send Reminders ({selectedProperties.length} selected)
        </button>
      )}

      {/* Collection Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Sub-tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setCollectionView('pending')}
            className={`flex-1 py-3 text-sm font-medium ${
              collectionView === 'pending'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-500'
            }`}
          >
            Pending ({filteredPending.length})
          </button>
          <button
            onClick={() => setCollectionView('paid')}
            className={`flex-1 py-3 text-sm font-medium ${
              collectionView === 'paid'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-500'
            }`}
          >
            Paid ({filteredPaid.length})
          </button>
        </div>

        {collectionView === 'pending' && (
          <div>
            {/* Select All */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={selectedProperties.length === pendingCollection.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                Select All
              </label>
              <span className="text-xs text-slate-500">
                {selectedProperties.length > 0 && `${selectedProperties.length} selected`}
              </span>
            </div>

            {/* Pending List */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {filteredPending.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(item.id)}
                    onChange={() => handleSelectProperty(item.id)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{item.property}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status === 'overdue' ? `${item.daysOverdue}d overdue` : 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{item.owner} • {item.type}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">₹{item.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Due: {item.dueDate}</p>
                    </div>
                    <button
                      onClick={() => handleMarkPaid(item)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg"
                    >
                      Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {collectionView === 'paid' && (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {filteredPaid.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.property}</p>
                  <p className="text-xs text-slate-500">{item.owner} • {item.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">₹{item.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{item.paidDate} • {item.method}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Defaulters Section (Overdue > 30 days) */}
      {defaulters.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 overflow-hidden">
          <div className="px-4 py-3 bg-red-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold text-red-800">Defaulters ({defaulters.length})</span>
            <span className="text-xs text-red-600 ml-auto">Overdue &gt; 30 days</span>
          </div>
          <div className="divide-y divide-red-100">
            {defaulters.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.property} - {item.owner}</p>
                  <p className="text-xs text-red-600">{item.daysOverdue} days overdue</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">₹{item.amount.toLocaleString()}</p>
                  <button className="text-xs text-red-700 underline">Send Notice</button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-red-100 flex justify-between items-center">
            <span className="text-sm font-medium text-red-800">Total Outstanding</span>
            <span className="text-lg font-bold text-red-700">
              ₹{defaulters.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Generate Fees Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGenerateModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Generate Monthly Fees</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                >
                  <option>June 2026</option>
                  <option>July 2026</option>
                  <option>August 2026</option>
                </select>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-slate-700">Fee Structure Preview</p>
                {feeStructure.map((type) => (
                  <div key={type.id} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">{type.name} ({type.count} units)</span>
                    <span className="text-sm font-medium text-slate-900">₹{type.defaultFee.toLocaleString()} each</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900">Total Expected</span>
                  <span className="text-lg font-bold text-purple-600">
                    ₹{feeStructure.reduce((sum, t) => sum + (t.count * t.defaultFee), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Generating fees for ${selectedMonth}...`)
                  setShowGenerateModal(false)
                }}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
              >
                Generate Fees for {selectedMonth}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Structure Modal */}
      {showFeeStructureModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFeeStructureModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Fee Structure</h3>
              <button onClick={() => setShowFeeStructureModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {feeStructure.map((type, index) => (
                <div key={type.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-900">{type.name}</span>
                    <span className="text-xs text-slate-500">{type.count} units</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">₹</span>
                    <input
                      type="number"
                      value={type.defaultFee}
                      onChange={(e) => {
                        const newStructure = [...feeStructure]
                        newStructure[index].defaultFee = parseInt(e.target.value) || 0
                        setFeeStructure(newStructure)
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <span className="text-sm text-slate-600">/ month</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  alert('Fee structure saved!')
                  setShowFeeStructureModal(false)
                }}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
              >
                Save Fee Structure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReminderModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Send Reminders</h3>
              <button onClick={() => setShowReminderModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Sending app notification to <strong>{selectedProperties.length}</strong> properties for pending maintenance fees.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">Preview Message:</p>
                <p className="text-sm text-slate-700">
                  &ldquo;Dear Resident, your maintenance fee of ₹X,XXX for May 2026 is pending. Please pay at your earliest convenience. Thank you!&rdquo;
                </p>
              </div>

              <button
                onClick={() => {
                  alert(`Reminders sent to ${selectedProperties.length} properties!`)
                  setShowReminderModal(false)
                  setSelectedProperties([])
                }}
                className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send App Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{selectedPayment.property}</p>
                    <p className="text-xs text-slate-500">{selectedPayment.owner}</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">₹{selectedPayment.amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['cash', 'upi', 'cheque', 'bank'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${
                        paymentMethod === method
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Payment of ₹${selectedPayment.amount} recorded for ${selectedPayment.property}!`)
                  setShowPaymentModal(false)
                  setSelectedPayment(null)
                }}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
