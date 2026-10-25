'use client'

import React, { useState } from 'react'
import { ChevronDown, Download, AlertCircle, Upload, Check, X } from 'lucide-react'
import ConnectedResidentBills from './ConnectedResidentBills'

interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: 'Online' | 'Check' | 'Cash'
  status: 'Paid' | 'Pending' | 'Failed'
  proofImage?: string
}

interface ExpenseCategory {
  name: string
  amount: number
  percentage: number
  details?: string[]
}

export default function FinanceConsolidated() {
  const [activeTab, setActiveTab] = useState<'my-finances' | 'society' | 'billing'>('my-finances')
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [proofImage, setProofImage] = useState<string | null>(null)
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)

  // Mock data for resident
  const outstandingDues = {
    amount: 5000,
    dueDate: '15 May 2026',
    daysOverdue: 5,
  }

  const paymentHistory: PaymentRecord[] = [
    { id: '1', date: 'May 10, 2026', amount: 10000, method: 'Online', status: 'Paid' },
    { id: '2', date: 'Apr 10, 2026', amount: 10000, method: 'Online', status: 'Paid' },
    { id: '3', date: 'Mar 10, 2026', amount: 10000, method: 'Check', status: 'Paid' },
    { id: '4', date: 'Feb 10, 2026', amount: 10000, method: 'Cash', status: 'Paid' },
    { id: '5', date: 'Jan 10, 2026', amount: 10000, method: 'Online', status: 'Paid' },
    { id: '6', date: 'Dec 10, 2025', amount: 10000, method: 'Online', status: 'Paid' },
  ]

  // Amenities payment data
  const amenitiesPayments = [
    { id: 'a1', name: 'Gym Membership', amount: 500, dueDate: '15 May 2026', status: 'Paid' as const },
    { id: 'a2', name: 'Swimming Pool', amount: 300, dueDate: '15 May 2026', status: 'Paid' as const },
    { id: 'a3', name: 'Parking Fee', amount: 1000, dueDate: '15 May 2026', status: 'Pending' as const },
    { id: 'a4', name: 'Community Hall Booking', amount: 2000, dueDate: '20 May 2026', status: 'Pending' as const },
    { id: 'a5', name: 'Elevator Maintenance', amount: 200, dueDate: '10 May 2026', status: 'Paid' as const },
  ]

  const amenitiesTotal = amenitiesPayments.reduce((sum, item) => sum + item.amount, 0)
  const amenitiesPending = amenitiesPayments.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0)

  // Society financial data for different months
  const societyFinancials = {
    'May 2026': {
      monthlyCollection: 45000,
      monthlyExpenses: 40000,
      ytdCollection: 225000,
      ytdExpenses: 200000,
      totalFundBalance: 250000,
      outstandingDuesTotal: 40000,
    },
    'Apr 2026': {
      monthlyCollection: 44500,
      monthlyExpenses: 39500,
      ytdCollection: 180000,
      ytdExpenses: 160000,
      totalFundBalance: 245000,
      outstandingDuesTotal: 35000,
    },
    'Mar 2026': {
      monthlyCollection: 45500,
      monthlyExpenses: 41000,
      ytdCollection: 135500,
      ytdExpenses: 120500,
      totalFundBalance: 240500,
      outstandingDuesTotal: 30000,
    },
  }

  const expenseBreakdown: ExpenseCategory[] = [
    {
      name: 'Security',
      amount: 14000,
      percentage: 35,
      details: ['Watchmen Salary: ₹8,000', 'Equipment: ₹4,000', 'Allowances: ₹2,000'],
    },
    {
      name: 'Maintenance',
      amount: 16000,
      percentage: 40,
      details: ['Building Repairs: ₹9,000', 'Common Area: ₹5,000', 'Infrastructure: ₹2,000'],
    },
    {
      name: 'Water/Utilities',
      amount: 6000,
      percentage: 15,
      details: ['Water Bill: ₹4,000', 'Electricity: ₹2,000'],
    },
    {
      name: 'Other',
      amount: 4000,
      percentage: 10,
      details: ['Administrative: ₹2,000', 'Miscellaneous: ₹2,000'],
    },
  ]

  const currentData = societyFinancials[selectedMonth as keyof typeof societyFinancials] || societyFinancials['May 2026']

  const handleProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProofImage(result)
        setShowUploadSuccess(true)
        setTimeout(() => setShowUploadSuccess(false), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">💰 Finances</h1>
        <p className="text-purple-100 text-sm mt-1">Manage your dues and view society financials</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-0 bg-white border-b border-slate-200 sticky top-16 z-10">
        <button
          onClick={() => setActiveTab('my-finances')}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm transition-colors ${
            activeTab === 'my-finances'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Finances
        </button>
        <button
          onClick={() => setActiveTab('society')}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm transition-colors ${
            activeTab === 'society'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Society
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm transition-colors ${
            activeTab === 'billing'
              ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bills
        </button>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {/* My Finances Tab */}
        {activeTab === 'my-finances' && (
          <div className="space-y-4 p-4">
            {/* Outstanding Dues Alert */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-900">Payment Due</p>
                  <p className="text-red-700 text-sm mt-1">Outstanding Amount: ₹{outstandingDues.amount.toLocaleString()}</p>
                  <p className="text-red-600 text-xs mt-0.5">Due Date: {outstandingDues.dueDate}</p>
                  <p className="text-red-600 text-xs">Days Overdue: {outstandingDues.daysOverdue} days</p>
                  
                  <div className="mt-3 space-y-2">
                    {/* Proof Upload Section */}
                    {!proofImage && (
                      <div className="bg-white rounded-lg p-3 border-2 border-dashed border-red-300">
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-600">Upload Payment Proof (Optional)</span>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Proof Uploaded Confirmation */}
                    {proofImage && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-semibold text-green-700">Proof image uploaded</p>
                        </div>
                        <img src={proofImage} alt="Payment proof" className="w-full max-h-32 object-cover rounded border border-green-200" />
                        <button
                          onClick={() => setProofImage(null)}
                          className="mt-2 w-full text-xs text-green-700 hover:text-green-900 font-semibold py-1 transition-colors"
                        >
                          Remove & Upload Different
                        </button>
                      </div>
                    )}

                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                      Pay Now (Online)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3">Payment History (Last 6 Months)</h3>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{payment.date}</p>
                      <p className="text-xs text-slate-600 mt-0.5">Method: {payment.method}</p>
                      {payment.proofImage && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-green-700 mb-1">Proof attached</p>
                          <img src={payment.proofImage} alt="Payment proof" className="w-20 h-20 object-cover rounded border border-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                      <span className={`text-xs font-semibold ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-600 font-semibold">Total Paid (6 months)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">₹60,000</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-600 font-semibold">Pending Amount</p>
                <p className="text-xl font-bold text-red-600 mt-1">₹5,000</p>
              </div>
            </div>

            {/* Amenities Payments Section */}
            <div className="mt-6 pt-6 border-t border-slate-300">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Amenities Payments</h3>
              
              {/* Amenities Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                  <p className="text-xs text-blue-600 font-semibold">Total Amenities</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">₹{amenitiesTotal.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-3">
                  <p className="text-xs text-orange-600 font-semibold">Pending</p>
                  <p className="text-xl font-bold text-orange-900 mt-1">₹{amenitiesPending.toLocaleString()}</p>
                </div>
              </div>

              {/* Amenities List */}
              <div className="space-y-2">
                {amenitiesPayments.map((amenity) => (
                  <div key={amenity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{amenity.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">Due: {amenity.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{amenity.amount.toLocaleString()}</p>
                      <span className={`text-xs font-semibold ${amenity.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {amenity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pay Pending Amenities Button */}
              {amenitiesPending > 0 && (
                <button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Pay Pending Amenities (₹{amenitiesPending.toLocaleString()})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Society Tab */}
        {activeTab === 'society' && (
          <div className="space-y-4 p-4">
            {/* Month Selector */}
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <label className="text-xs font-semibold text-slate-600 block mb-2">Select Month:</label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 bg-white cursor-pointer appearance-none"
                >
                  <option>May 2026</option>
                  <option>Apr 2026</option>
                  <option>Mar 2026</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-600 pointer-events-none" />
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3">Financial Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-600 font-semibold">Total Fund Balance</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">₹{currentData.totalFundBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-semibold">Monthly Collection</p>
                  <p className="text-lg font-bold text-green-700 mt-1">₹{currentData.monthlyCollection.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Income vs Expenses */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3">Income vs Expenses - {selectedMonth}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Monthly Income</p>
                    <p className="text-sm font-bold text-green-700 mt-1">₹{currentData.monthlyCollection.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Monthly Expenses</p>
                    <p className="text-sm font-bold text-red-700 mt-1">₹{currentData.monthlyExpenses.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">📉</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Month Balance</p>
                    <p className="text-sm font-bold text-blue-700 mt-1">
                      ₹{(currentData.monthlyCollection - currentData.monthlyExpenses).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-2xl">⚖️</span>
                </div>
              </div>

              {/* YTD Summary */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Year-to-Date Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs">
                    <p className="text-slate-600">YTD Income</p>
                    <p className="font-bold text-slate-900">₹{currentData.ytdCollection.toLocaleString()}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-600">YTD Expenses</p>
                    <p className="font-bold text-slate-900">₹{currentData.ytdExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3">Expense Breakdown - {selectedMonth}</h3>
              <div className="space-y-2">
                {expenseBreakdown.map((expense) => (
                  <div key={expense.name}>
                    <button
                      onClick={() => setExpandedExpense(expandedExpense === expense.name ? null : expense.name)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-slate-900">{expense.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">₹{expense.amount.toLocaleString()} ({expense.percentage}%)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              expense.name === 'Security'
                                ? 'bg-red-500'
                                : expense.name === 'Maintenance'
                                  ? 'bg-blue-500'
                                  : expense.name === 'Water/Utilities'
                                    ? 'bg-cyan-500'
                                    : 'bg-amber-500'
                            }`}
                            style={{ width: `${expense.percentage}%` }}
                          />
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-600 transition-transform ${
                            expandedExpense === expense.name ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedExpense === expense.name && expense.details && (
                      <div className="ml-3 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Breakdown:</p>
                        <div className="space-y-1">
                          {expense.details.map((detail, idx) => (
                            <p key={idx} className="text-xs text-slate-600">
                              • {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Outstanding Dues Summary */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200 p-4">
              <h3 className="font-bold text-slate-900 mb-2">Outstanding Dues (Society)</h3>
              <p className="text-xs text-slate-600 mb-2">Total dues across all units</p>
              <p className="text-3xl font-bold text-orange-700">₹{currentData.outstandingDuesTotal.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-2">This includes dues from units that haven&apos;t made payment yet</p>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="p-4">
            <ConnectedResidentBills embedded />
          </div>
        )}
      </div>
    </div>
  )
}

