'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Trash2, IndianRupee, X } from 'lucide-react'

interface TransactionsTabProps {
  searchTerm: string
  filters: {
    searchTerm: string
    dateFrom?: string
    dateTo?: string
  }
}

// Mock properties for dropdown
const properties = [
  { id: 'A-101', name: 'A-101 - Mr. Sharma' },
  { id: 'A-102', name: 'A-102 - Mrs. Patel' },
  { id: 'B-201', name: 'B-201 - Mr. Kumar' },
  { id: 'B-202', name: 'B-202 - Ms. Singh' },
  { id: 'C-301', name: 'C-301 - Mr. Reddy' },
]

// Mock income records
const initialIncomeRecords = [
  { id: '1', property: 'A-101', propertyName: 'Mr. Sharma', type: 'amenity', amount: 2000, date: '2026-05-28', description: 'Community Hall Booking', method: 'upi' },
  { id: '2', property: 'B-202', propertyName: 'Ms. Singh', type: 'other', amount: 500, date: '2026-05-27', description: 'Guest Parking Fee', method: 'cash' },
  { id: '3', property: 'C-301', propertyName: 'Mr. Reddy', type: 'amenity', amount: 500, date: '2026-05-25', description: 'Pool Usage', method: 'upi' },
]

// Mock expense records
const initialExpenseRecords = [
  { id: '1', property: 'Society', type: 'utility', amount: 45000, date: '2026-05-28', description: 'Electricity Bill - May', vendor: 'BESCOM' },
  { id: '2', property: 'Society', type: 'staff', amount: 25000, date: '2026-05-25', description: 'Security Guard Salary', vendor: 'Staff Payroll' },
  { id: '3', property: 'A-101', type: 'maintenance', amount: 3500, date: '2026-05-22', description: 'Plumbing Repair', vendor: 'Local Plumber' },
  { id: '4', property: 'Society', type: 'utility', amount: 12000, date: '2026-05-20', description: 'Water Bill - May', vendor: 'BWSSB' },
  { id: '5', property: 'Society', type: 'other', amount: 8000, date: '2026-05-15', description: 'Garden Maintenance', vendor: 'Green Gardens' },
]

const incomeTypes = [
  { id: 'amenity', label: 'Amenity Booking' },
  { id: 'other', label: 'Other Income' },
]

const expenseTypes = [
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'utility', label: 'Utility' },
  { id: 'staff', label: 'Staff' },
  { id: 'other', label: 'Other' },
]

const paymentMethods = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'bank', label: 'Bank Transfer' },
]

export default function TransactionsTab({ searchTerm, filters }: TransactionsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'income' | 'expenses'>('income')
  const [incomeRecords, setIncomeRecords] = useState(initialIncomeRecords)
  const [expenseRecords, setExpenseRecords] = useState(initialExpenseRecords)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  
  const [incomeForm, setIncomeForm] = useState({
    property: '',
    type: 'amenity',
    amount: '',
    date: '',
    description: '',
    method: 'cash',
  })

  const [expenseForm, setExpenseForm] = useState({
    property: 'Society',
    type: 'maintenance',
    amount: '',
    date: '',
    description: '',
    vendor: '',
  })

  // Calculate stats
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = expenseRecords.reduce((sum, r) => sum + r.amount, 0)

  const incomeByType = {
    amenity: incomeRecords.filter(r => r.type === 'amenity').reduce((sum, r) => sum + r.amount, 0),
    other: incomeRecords.filter(r => r.type === 'other').reduce((sum, r) => sum + r.amount, 0),
  }

  const expenseByType = {
    maintenance: expenseRecords.filter(r => r.type === 'maintenance').reduce((sum, r) => sum + r.amount, 0),
    utility: expenseRecords.filter(r => r.type === 'utility').reduce((sum, r) => sum + r.amount, 0),
    staff: expenseRecords.filter(r => r.type === 'staff').reduce((sum, r) => sum + r.amount, 0),
    other: expenseRecords.filter(r => r.type === 'other').reduce((sum, r) => sum + r.amount, 0),
  }

  // Filter records
  const filteredIncome = incomeRecords.filter(r =>
    r.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExpenses = expenseRecords.filter(r =>
    r.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddIncome = () => {
    const newRecord = {
      id: Date.now().toString(),
      property: incomeForm.property,
      propertyName: properties.find(p => p.id === incomeForm.property)?.name.split(' - ')[1] || '',
      type: incomeForm.type,
      amount: parseInt(incomeForm.amount),
      date: incomeForm.date,
      description: incomeForm.description,
      method: incomeForm.method,
    }
    setIncomeRecords([newRecord, ...incomeRecords])
    setShowIncomeModal(false)
    setIncomeForm({ property: '', type: 'amenity', amount: '', date: '', description: '', method: 'cash' })
  }

  const handleAddExpense = () => {
    const newRecord = {
      id: Date.now().toString(),
      property: expenseForm.property,
      type: expenseForm.type,
      amount: parseInt(expenseForm.amount),
      date: expenseForm.date,
      description: expenseForm.description,
      vendor: expenseForm.vendor,
    }
    setExpenseRecords([newRecord, ...expenseRecords])
    setShowExpenseModal(false)
    setExpenseForm({ property: 'Society', type: 'maintenance', amount: '', date: '', description: '', vendor: '' })
  }

  const handleDeleteIncome = (id: string) => {
    setIncomeRecords(incomeRecords.filter(r => r.id !== id))
  }

  const handleDeleteExpense = (id: string) => {
    setExpenseRecords(expenseRecords.filter(r => r.id !== id))
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Sub-tabs */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveSubTab('income')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeSubTab === 'income'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Income
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeSubTab === 'expenses'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Expenses
        </button>
      </div>

      {/* Income Tab */}
      {activeSubTab === 'income' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Total Income</p>
              <p className="text-xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Amenity Income</p>
              <p className="text-xl font-bold text-slate-900">₹{incomeByType.amenity.toLocaleString()}</p>
            </div>
          </div>

          {/* Add Income Button */}
          <button
            onClick={() => setShowIncomeModal(true)}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Income
          </button>

          {/* Income List */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900">Recent Income</h4>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {filteredIncome.map((record) => (
                <div key={record.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{record.description}</p>
                      <p className="text-xs text-slate-500">{record.property} • {record.date} • {record.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">+₹{record.amount.toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteIncome(record.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredIncome.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No income records found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Utilities</p>
              <p className="text-xl font-bold text-slate-900">₹{expenseByType.utility.toLocaleString()}</p>
            </div>
          </div>

          {/* Expense Type Breakdown */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <h4 className="text-xs font-medium text-slate-500 mb-3">Expense Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(expenseByType).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      type === 'maintenance' ? 'bg-blue-500' :
                      type === 'utility' ? 'bg-amber-500' :
                      type === 'staff' ? 'bg-purple-500' : 'bg-slate-500'
                    }`} />
                    <span className="text-sm text-slate-600 capitalize">{type}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowExpenseModal(true)}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>

          {/* Expense List */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900">Recent Expenses</h4>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {filteredExpenses.map((record) => (
                <div key={record.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{record.description}</p>
                      <p className="text-xs text-slate-500">{record.property} • {record.date} • {record.vendor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-600">-₹{record.amount.toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteExpense(record.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredExpenses.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No expense records found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowIncomeModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Record Income</h3>
              <button onClick={() => setShowIncomeModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
                <select
                  value={incomeForm.property}
                  onChange={(e) => setIncomeForm({ ...incomeForm, property: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">Select property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Income Type</label>
                <div className="flex gap-2">
                  {incomeTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setIncomeForm({ ...incomeForm, type: type.id })}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border ${
                        incomeForm.type === type.id
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="e.g., Community Hall Booking"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setIncomeForm({ ...incomeForm, method: method.id })}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border ${
                        incomeForm.method === method.id
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddIncome}
                disabled={!incomeForm.property || !incomeForm.amount || !incomeForm.date || !incomeForm.description}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 rounded-lg text-white font-medium"
              >
                Record Income
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowExpenseModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Record Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property / Location</label>
                <select
                  value={expenseForm.property}
                  onChange={(e) => setExpenseForm({ ...expenseForm, property: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="Society">Society (Common)</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expense Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {expenseTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setExpenseForm({ ...expenseForm, type: type.id })}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border ${
                        expenseForm.type === type.id
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g., Electricity Bill - May"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                  placeholder="e.g., BESCOM"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!expenseForm.amount || !expenseForm.date || !expenseForm.description}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 rounded-lg text-white font-medium"
              >
                Record Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
