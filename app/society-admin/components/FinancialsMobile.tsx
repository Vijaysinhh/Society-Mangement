'use client'

import { useState } from 'react'
import { TrendingUp, Check, Clock, AlertCircle, Home, Download, ChevronDown, Plus, X } from 'lucide-react'

interface FinancialsMobileProps {
  societyId: string
}

export default function FinancialsMobile({ societyId }: FinancialsMobileProps) {
  const [selectedMonth, setSelectedMonth] = useState('May 2024')
  const [expandedForm, setExpandedForm] = useState<string | null>(null)
  const [incomeType, setIncomeType] = useState<'maintenance' | 'amenity' | 'others'>('maintenance')
  const [customIncomeType, setCustomIncomeType] = useState('')
  const [expenseType, setExpenseType] = useState<'maintenance' | 'utilities' | 'staff' | 'others'>('maintenance')
  const [customExpenseType, setCustomExpenseType] = useState('')
  
  const [incomeData, setIncomeData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  
  const [expenseData, setExpenseData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleRecordIncome = () => {
    console.log('[v0] Recording income:', { type: incomeType, customType: customIncomeType, ...incomeData })
    setIncomeData({ amount: '', description: '', date: new Date().toISOString().split('T')[0] })
    setIncomeType('maintenance')
    setCustomIncomeType('')
    setExpandedForm(null)
  }

  const handleRecordExpense = () => {
    console.log('[v0] Recording expense:', { type: expenseType, customType: customExpenseType, ...expenseData })
    setExpenseData({ amount: '', description: '', date: new Date().toISOString().split('T')[0] })
    setExpenseType('maintenance')
    setCustomExpenseType('')
    setExpandedForm(null)
  }

  const financialMetrics = [
    {
      id: 'collected',
      label: 'Total Collected',
      amount: '₹2,45,600',
      icon: '💵',
      backgroundColor: 'bg-green-50',
      accentColor: 'text-green-600',
      trend: '+12% vs Apr 2024',
    },
    {
      id: 'pending',
      label: 'Total Pending',
      amount: '₹74,400',
      icon: '📋',
      backgroundColor: 'bg-orange-50',
      accentColor: 'text-orange-600',
      trend: '+8% vs Apr 2024',
    },
    {
      id: 'rate',
      label: 'Collection Rate',
      amount: '76%',
      icon: '📊',
      backgroundColor: 'bg-blue-50',
      accentColor: 'text-blue-600',
      trend: 'vs 70% in Apr 2024',
    },
    {
      id: 'due',
      label: 'Due This Month',
      amount: '₹3,20,000',
      icon: '📅',
      backgroundColor: 'bg-purple-50',
      accentColor: 'text-purple-600',
      trend: 'from 120 units',
    },
  ]

  const paymentSummary = [
    { status: 'Paid', count: 91, percentage: 76, icon: '✓', color: 'bg-green-100', textColor: 'text-green-700' },
    { status: 'Pending', count: 20, percentage: 17, icon: '⏳', color: 'bg-orange-100', textColor: 'text-orange-700' },
    { status: 'Overdue', count: 9, percentage: 7, icon: '⚠️', color: 'bg-red-100', textColor: 'text-red-700' },
    { status: 'Vacant', count: 10, percentage: 8, icon: '🏠', color: 'bg-gray-100', textColor: 'text-gray-700' },
  ]

  const recentTransactions = [
    {
      id: '1',
      resident: 'Rajesh Kumar',
      flat: 'A-101',
      type: 'Maintenance + Sinking Fund',
      amount: '₹6,500',
      status: 'Paid',
      time: '24 May, 10:30 AM',
      icon: '✓',
      statusColor: 'bg-green-100',
      statusTextColor: 'text-green-700',
    },
    {
      id: '2',
      resident: 'Priya Sharma',
      flat: 'B-204',
      type: 'Maintenance',
      amount: '₹6,500',
      status: 'Pending',
      time: '24 May, 09:15 AM',
      icon: '⏳',
      statusColor: 'bg-orange-100',
      statusTextColor: 'text-orange-700',
    },
    {
      id: '3',
      resident: 'Neha Verma',
      flat: 'C-301',
      type: 'Maintenance + Sinking Fund',
      amount: '₹6,500',
      status: 'Overdue',
      time: 'Due on 20 May',
      icon: '⚠️',
      statusColor: 'bg-red-100',
      statusTextColor: 'text-red-700',
    },
    {
      id: '4',
      resident: 'Amit Patel',
      flat: 'A-502',
      type: 'Maintenance',
      amount: '₹6,500',
      status: 'Paid',
      time: '23 May, 07:45 PM',
      icon: '✓',
      statusColor: 'bg-green-100',
      statusTextColor: 'text-green-700',
    },
  ]

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Financials</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors active:scale-95">
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="px-4 py-4 border-b border-slate-100">
        <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
          <span className="text-slate-700 font-medium">{selectedMonth}</span>
          <span className="text-slate-400">▼</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="px-4 py-6 space-y-3">
        {financialMetrics.map((metric) => (
          <div key={metric.id} className={`${metric.backgroundColor} rounded-xl p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.accentColor}`}>{metric.amount}</p>
                <p className={`text-xs mt-2 ${metric.accentColor}`}>{metric.trend}</p>
              </div>
              <div className="text-2xl">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Income Section */}
      <div className="px-4 py-4 border-b border-slate-100">
        <button
          onClick={() => setExpandedForm(expandedForm === 'income' ? null : 'income')}
          className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Record Income</p>
              <p className="text-xs text-slate-600">Add maintenance fees, amenities, or other income</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${expandedForm === 'income' ? 'rotate-180' : ''}`} />
        </button>

        {/* Income Form */}
        {expandedForm === 'income' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Income Type</label>
              <select
                value={incomeType}
                onChange={(e) => {
                  setIncomeType(e.target.value as 'maintenance' | 'amenity' | 'others')
                  if (e.target.value !== 'others') setCustomIncomeType('')
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="maintenance">Maintenance Fees</option>
                <option value="amenity">Amenity Fees</option>
                <option value="others">Others</option>
              </select>
            </div>

            {incomeType === 'others' && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Specify Income Type</label>
                <input
                  type="text"
                  value={customIncomeType}
                  onChange={(e) => setCustomIncomeType(e.target.value)}
                  placeholder="e.g., Parking Fee, Guest House, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={incomeData.amount}
                onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
              <input
                type="text"
                value={incomeData.description}
                onChange={(e) => setIncomeData({ ...incomeData, description: e.target.value })}
                placeholder="e.g., May maintenance collection"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Date</label>
              <input
                type="date"
                value={incomeData.date}
                onChange={(e) => setIncomeData({ ...incomeData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRecordIncome}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors active:scale-95"
              >
                ✓ Record Income
              </button>
              <button
                onClick={() => setExpandedForm(null)}
                className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Expenses Section */}
      <div className="px-4 py-4 border-b border-slate-100">
        <button
          onClick={() => setExpandedForm(expandedForm === 'expense' ? null : 'expense')}
          className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💸</span>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Record Expenses</p>
              <p className="text-xs text-slate-600">Add maintenance, utilities, staff, or other expenses</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${expandedForm === 'expense' ? 'rotate-180' : ''}`} />
        </button>

        {/* Expense Form */}
        {expandedForm === 'expense' && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Expense Category</label>
              <select
                value={expenseType}
                onChange={(e) => {
                  setExpenseType(e.target.value as 'maintenance' | 'utilities' | 'staff' | 'others')
                  if (e.target.value !== 'others') setCustomExpenseType('')
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="staff">Staff Salary</option>
                <option value="others">Others</option>
              </select>
            </div>

            {expenseType === 'others' && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Specify Expense Type</label>
                <input
                  type="text"
                  value={customExpenseType}
                  onChange={(e) => setCustomExpenseType(e.target.value)}
                  placeholder="e.g., Repairs, Pest Control, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
              <input
                type="text"
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                placeholder="e.g., Plumbing repair, Water bill, etc."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Date</label>
              <input
                type="date"
                value={expenseData.date}
                onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRecordExpense}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors active:scale-95"
              >
                ✓ Record Expense
              </button>
              <button
                onClick={() => setExpandedForm(null)}
                className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collection Overview */}
      <div className="px-4 py-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Collection Overview</h3>
          <a href="#" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
            View Chart
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Collected (₹)
              </span>
              <span className="text-sm font-medium text-slate-900">2.4L</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '77%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Pending (₹)
              </span>
              <span className="text-sm font-medium text-slate-900">74K</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: '23%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="px-4 py-6 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">Payment Summary</h3>

        <div className="grid grid-cols-2 gap-3">
          {paymentSummary.map((item) => (
            <div key={item.status} className={`${item.color} rounded-lg p-4 text-center`}>
              <div className={`text-lg font-bold ${item.textColor} mb-1`}>{item.count}</div>
              <div className={`text-xs ${item.textColor} opacity-80`}>{item.status}</div>
              <div className={`text-xs font-medium ${item.textColor} mt-2`}>({item.percentage}%)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 py-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          <a href="#" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
            View All
          </a>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((txn) => (
            <div key={txn.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className={`${txn.statusColor} rounded-full p-2 flex-shrink-0`}>
                <span className={`text-lg ${txn.statusTextColor}`}>{txn.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{txn.resident}</p>
                <p className="text-xs text-slate-600">{txn.flat} • {txn.type}</p>
                <p className="text-xs text-slate-500 mt-1">{txn.time}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="font-semibold text-slate-900 text-sm">{txn.amount}</p>
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${txn.statusColor} ${txn.statusTextColor} mt-1`}>
                  {txn.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Reminders CTA */}
      <div className="px-4 py-6 pb-24">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">💬</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">Send Payment Reminders</h4>
              <p className="text-sm text-slate-600 mb-3">Send reminders to pending & overdue residents via SMS / WhatsApp</p>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors active:scale-95">
                → Send Reminders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
