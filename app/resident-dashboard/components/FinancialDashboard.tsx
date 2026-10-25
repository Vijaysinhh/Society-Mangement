'use client'

import { useState } from 'react'
import { DollarSign, TrendingDown, TrendingUp, Calendar, Download, Eye, EyeOff, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useBills } from '@/hooks/useResidentData'

interface PaymentTransaction {
  id: string
  date: string
  amount: number
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash'
  referenceNumber: string
  billMonth: string
  status: 'completed' | 'processing' | 'failed'
}

interface AutopaySubscription {
  id: string
  enabled: boolean
  amount: number
  dueDate: number
  method: 'credit_card' | 'bank_transfer'
  cardLast4?: string
  accountLast4?: string
}

export default function FinancialDashboard() {
  const { bills, loading, error, refetch } = useBills()
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null)
  const [autopayEnabled, setAutopayEnabled] = useState(false)
  const [autopayData, setAutopayData] = useState<AutopaySubscription>({
    id: 'ap-001',
    enabled: false,
    amount: 6000,
    dueDate: 25,
    method: 'bank_transfer',
    accountLast4: '1234'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading bills...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading bills</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={refetch} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    )
  }

  const safeBills = Array.isArray(bills) ? bills : []
  const overdueBills = safeBills.filter(b => b.status === 'overdue')
  const pendingBills = safeBills.filter(b => b.status === 'pending')
  const totalOutstanding = overdueBills.reduce((sum, b) => sum + b.amount, 0) + 
                          pendingBills.reduce((sum, b) => sum + b.amount, 0)
  const totalPaid = safeBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-600 uppercase">Total Paid</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">₹{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Last 4 months</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-600 uppercase">Outstanding</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1 sm:mt-2">₹{totalOutstanding.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">{overdueBills.length} overdue</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-600 uppercase">Monthly Average</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">₹6,075</p>
              <p className="text-xs text-blue-600 mt-1">Last 4 months</p>
            </div>
            <TrendingDown className="w-8 h-8 text-blue-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase">Next Due</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1 sm:mt-2">31 Mar</p>
              <p className="text-xs text-purple-600 mt-1">₹6,000</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {overdueBills.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 text-sm">Overdue Payment Alert</p>
            <p className="text-xs text-slate-600 mt-1">You have {overdueBills.length} overdue bill(s) totaling ₹{overdueBills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}. Please pay immediately to avoid penalties.</p>
          </div>
        </div>
      )}

      {/* Autopay Management */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Automatic Payment Setup</h3>
            <p className="text-sm text-slate-600 mt-1">Pay bills automatically on the 25th of each month</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autopayEnabled}
              onChange={(e) => setAutopayEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">{autopayEnabled ? 'Active' : 'Inactive'}</span>
          </label>
        </div>

        {autopayEnabled && (
          <div className="bg-green-50 rounded p-3 text-sm">
            <p className="text-green-900 font-medium">Auto-payment enabled</p>
            <p className="text-green-700 text-xs mt-1">Monthly charge of ₹{autopayData.amount} will be deducted from {autopayData.method === 'bank_transfer' ? 'account ending' : 'card ending'} ...{autopayData.accountLast4 || autopayData.cardLast4} on the {autopayData.dueDate}th of each month.</p>
          </div>
        )}
      </div>

      {/* Outstanding Bills */}
      {(overdueBills.length > 0 || pendingBills.length > 0) && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Outstanding Bills</h3>
          <div className="space-y-3">
            {[...overdueBills, ...pendingBills].map(bill => (
              <div key={bill.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-slate-900">{bill.month}</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                      bill.status === 'overdue' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bill.status === 'overdue' ? 'OVERDUE' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{bill.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">₹{bill.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBreakdown(showBreakdown === bill.id ? null : bill.id)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                      >
                        Details
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                        Pay Now
                      </button>
                    </div>
                  </div>

                  {/* Breakdown */}
                  {showBreakdown === bill.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                      <p className="font-medium text-slate-700 mb-2">Bill Breakdown:</p>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>Maintenance:</span>
                          <span className="font-medium">₹{bill.breakdown.maintenance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Water Charges:</span>
                          <span className="font-medium">₹{bill.breakdown.water}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Electricity:</span>
                          <span className="font-medium">₹{bill.breakdown.electricity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parking:</span>
                          <span className="font-medium">₹{bill.breakdown.parking}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Payment History</h3>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        <div className="space-y-2">
          {safeBills.filter(b => b.status === 'paid').map(bill => (
            <div key={txn.id} className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-green-100 rounded">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{txn.billMonth}</p>
                  <p className="text-xs text-slate-600">{new Date(txn.date).toLocaleDateString()} • {txn.referenceNumber}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-slate-900">₹{txn.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-600">{txn.method === 'bank_transfer' ? 'Bank Transfer' : 'Credit Card'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Year Overview */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Year Overview</h3>
        <div className="space-y-2">
          {safeBills.map((bill, idx) => (
            <div key={bill.id} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-slate-600">{bill.month}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-colors ${
                    bill.status === 'paid' ? 'bg-green-500' : 
                    bill.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(bill.amount / 6500) * 100}%` }}
                />
              </div>
              <div className="text-right w-16">
                <p className="text-sm font-semibold text-slate-900">₹{bill.amount}</p>
                {bill.status === 'paid' && (
                  <p className="text-xs text-green-600">Paid</p>
                )}
                {bill.status === 'overdue' && (
                  <p className="text-xs text-red-600">Overdue</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
