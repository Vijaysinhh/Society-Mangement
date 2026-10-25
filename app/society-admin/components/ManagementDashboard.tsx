'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Send, CheckCircle2, X, DollarSign, TrendingUp, Clock, AlertCircle, Download } from 'lucide-react'

interface Expense {
  id: string
  category: 'Salary' | 'Utilities' | 'Repairs' | 'Supplies' | 'Other'
  vendor: string
  amount: number
  date: string
  description: string
  status: 'Pending' | 'Approved' | 'Paid'
}

const sampleExpenses: Expense[] = [
  { id: '1', category: 'Salary', vendor: 'Staff Payroll', amount: 50000, date: '2024-03-15', description: 'Monthly staff salaries', status: 'Approved' },
  { id: '2', category: 'Utilities', vendor: 'Water Department', amount: 5000, date: '2024-03-14', description: 'Monthly water bill', status: 'Paid' },
  { id: '3', category: 'Repairs', vendor: 'ABC Maintenance', amount: 15000, date: '2024-03-13', description: 'Elevator maintenance', status: 'Pending' },
  { id: '4', category: 'Supplies', vendor: 'Office Depot', amount: 3000, date: '2024-03-12', description: 'Cleaning supplies', status: 'Approved' },
  { id: '5', category: 'Utilities', vendor: 'Electricity Board', amount: 8000, date: '2024-03-11', description: 'Monthly electricity bill', status: 'Pending' },
]

const categoryColors = {
  Salary: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  Utilities: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  Repairs: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
  Supplies: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100' },
}

const statusColors = {
  Pending: { badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  Approved: { badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  Paid: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
}

export default function ManagementDashboard({ societyId }: { societyId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses)
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Paid'>('All')
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [newExpense, setNewExpense] = useState({ category: 'Other', vendor: '', amount: '', description: '', status: 'Pending' })

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || exp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    approved: expenses.filter(exp => exp.status === 'Approved').reduce((sum, exp) => sum + exp.amount, 0),
    pending: expenses.filter(exp => exp.status === 'Pending').length,
    paid: expenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0),
  }

  const handleRecordExpense = () => {
    if (newExpense.vendor && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: newExpense.category as any,
        vendor: newExpense.vendor,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0],
        description: newExpense.description,
        status: newExpense.status as any,
      }
      setExpenses([expense, ...expenses])
      setNewExpense({ category: 'Other', vendor: '', amount: '', description: '', status: 'Pending' })
      setShowRecordModal(false)
    }
  }

  const handleApproveSelected = () => {
    setExpenses(expenses.map(exp => selectedExpenses.includes(exp.id) ? { ...exp, status: 'Approved' as const } : exp))
    setSelectedExpenses([])
  }

  const handleMarkPaidSelected = () => {
    setExpenses(expenses.map(exp => selectedExpenses.includes(exp.id) ? { ...exp, status: 'Paid' as const } : exp))
    setSelectedExpenses([])
  }

  const toggleSelectExpense = (id: string) => {
    setSelectedExpenses(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelectedExpenses(selectedExpenses.length === filteredExpenses.length ? [] : filteredExpenses.map(e => e.id))
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Total Expenses</p>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{stats.totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Approved</p>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{stats.approved.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Pending</p>
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Paid This Month</p>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{stats.paid.toLocaleString()}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-3 items-center flex-wrap">
        <button onClick={() => setShowRecordModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search vendor or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Paid'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status as any)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-8 px-4 py-3">
                <input type="checkbox" checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredExpenses.map(expense => (
              <tr key={expense.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedExpenses.includes(expense.id)} onChange={() => toggleSelectExpense(expense.id)} className="w-4 h-4 rounded" />
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[expense.category].badge}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{expense.vendor}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{expense.description}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">₹{expense.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[expense.status].badge}`}>
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sticky Bulk Actions Bar */}
      {selectedExpenses.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-slate-200 rounded-lg shadow-lg p-4 flex items-center justify-between gap-4 z-40">
          <p className="text-sm font-semibold text-slate-900">{selectedExpenses.length} selected</p>
          <div className="flex gap-2">
            <button onClick={handleApproveSelected} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
              Approve
            </button>
            <button onClick={handleMarkPaidSelected} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
              Mark Paid
            </button>
            <button className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Record Expense</h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {['Salary', 'Utilities', 'Repairs', 'Supplies', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                <input type="text" value={newExpense.vendor} onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })} placeholder="Enter vendor name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="Enter amount" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="What is this expense for?" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {['Pending', 'Approved'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={newExpense.status === status} onChange={() => setNewExpense({ ...newExpense, status })} className="w-4 h-4" />
                      <span className="text-sm text-slate-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowRecordModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleRecordExpense} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
