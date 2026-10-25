'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, IndianRupee, ChevronDown, ChevronUp, FileText, BarChart3, User, Download, Share2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

interface OverviewReportsTabProps {
  searchTerm: string
  filters: {
    searchTerm: string
    dateFrom?: string
    dateTo?: string
  }
}

// Mock data
const monthlyTrend = [
  { month: 'Jan', income: 180000, expenses: 120000 },
  { month: 'Feb', income: 195000, expenses: 110000 },
  { month: 'Mar', income: 210000, expenses: 140000 },
  { month: 'Apr', income: 225000, expenses: 125000 },
  { month: 'May', income: 240000, expenses: 160000 },
]

const recentTransactions = [
  { id: '1', property: 'A-101', type: 'income', category: 'Maintenance', amount: 5000, date: '2026-05-28' },
  { id: '2', property: 'B-201', type: 'expense', category: 'Repairs', amount: 12000, date: '2026-05-27' },
  { id: '3', property: 'C-301', type: 'income', category: 'Amenity', amount: 2000, date: '2026-05-26' },
  { id: '4', property: 'A-102', type: 'income', category: 'Maintenance', amount: 5000, date: '2026-05-25' },
]

const propertyCollectionData = [
  { property: 'A-101', owner: 'Mr. Sharma', expected: 5000, collected: 5000, status: 'paid' },
  { property: 'A-102', owner: 'Mrs. Patel', expected: 5000, collected: 5000, status: 'paid' },
  { property: 'B-201', owner: 'Mr. Kumar', expected: 4500, collected: 0, status: 'pending' },
  { property: 'B-202', owner: 'Ms. Singh', expected: 4500, collected: 4500, status: 'paid' },
  { property: 'C-301', owner: 'Mr. Reddy', expected: 6000, collected: 0, status: 'overdue' },
]

export default function OverviewReportsTab({ searchTerm, filters }: OverviewReportsTabProps) {
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  const [selectedProperty, setSelectedProperty] = useState('')

  const stats = {
    totalIncome: 240000,
    totalExpenses: 160000,
    netBalance: 80000,
    defaulters: 3,
    defaulterAmount: 45000,
  }

  const toggleReport = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-slate-500">Income</span>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{(stats.totalIncome / 1000).toFixed(0)}K</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs text-slate-500">Expenses</span>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{(stats.totalExpenses / 1000).toFixed(0)}K</p>
          <p className="text-xs text-red-600 mt-1">+8% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <IndianRupee className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-slate-500">Net Balance</span>
          </div>
          <p className="text-xl font-bold text-slate-900">₹{(stats.netBalance / 1000).toFixed(0)}K</p>
          <p className="text-xs text-purple-600 mt-1">Surplus this month</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-slate-500">Defaulters</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.defaulters}</p>
          <p className="text-xs text-amber-600 mt-1">₹{(stats.defaulterAmount / 1000).toFixed(0)}K pending</p>
        </div>
      </div>

      {/* Income vs Expense Trend Chart */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Income vs Expenses Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [`₹${(value/1000).toFixed(0)}K`, '']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expenseGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-600">Expenses</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {tx.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{tx.category}</p>
                  <p className="text-xs text-slate-500">{tx.property} • {tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Reports</h3>

        {/* Monthly Collection Report */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleReport('collection')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Monthly Collection Report</p>
                <p className="text-xs text-slate-500">View collection status by property</p>
              </div>
            </div>
            {expandedReport === 'collection' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedReport === 'collection' && (
            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="flex items-center gap-2 my-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option>May 2026</option>
                  <option>April 2026</option>
                  <option>March 2026</option>
                </select>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <Download className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-slate-900">₹25K</p>
                    <p className="text-xs text-slate-500">Expected</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">₹19.5K</p>
                    <p className="text-xs text-slate-500">Collected</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">₹5.5K</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {propertyCollectionData.map((item) => (
                  <div key={item.property} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.property}</p>
                      <p className="text-xs text-slate-500">{item.owner}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">₹{item.expected.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'paid' ? 'bg-green-100 text-green-700' :
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Income vs Expense Report */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleReport('comparison')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Income vs Expense Comparison</p>
                <p className="text-xs text-slate-500">Analyze financial performance</p>
              </div>
            </div>
            {expandedReport === 'comparison' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedReport === 'comparison' && (
            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value: number) => [`₹${(value/1000).toFixed(0)}K`, '']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resident Statements */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleReport('statements')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Resident Statements</p>
                <p className="text-xs text-slate-500">Generate statements for residents</p>
              </div>
            </div>
            {expandedReport === 'statements' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedReport === 'statements' && (
            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Select Property</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Choose property...</option>
                    <option value="A-101">A-101 - Mr. Sharma</option>
                    <option value="A-102">A-102 - Mrs. Patel</option>
                    <option value="B-201">B-201 - Mr. Kumar</option>
                    <option value="B-202">B-202 - Ms. Singh</option>
                    <option value="C-301">C-301 - Mr. Reddy</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                  Statement will include last 3 months of transactions for the selected property.
                </div>

                <button
                  disabled={!selectedProperty}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${
                    selectedProperty 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Generate Statement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
