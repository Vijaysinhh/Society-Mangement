'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle2, Clock, DollarSign, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'

interface ResidentPaymentStatus {
  id: string
  unit: string
  resident: string
  status: 'paid' | 'pending' | 'overdue'
  amountDue: number
  daysPending: number
}

const mockSocietyFinancials = {
  current_year: {
    total_collected: 850000,
    total_outstanding: 150000,
    total_residents: 80,
    residents_paid: 68,
    residents_pending: 8,
    residents_overdue: 4,
    total_expenses: 780000,
    collection_date: '2024-03-28',
    maintenance_fund: 120000,
    building_projects: [
      { name: 'Terrace Waterproofing', amount: 150000, status: 'in_progress' },
      { name: 'Elevator Maintenance', amount: 80000, status: 'completed' }
    ]
  },
  past_year: {
    total_collected: 750000,
    total_outstanding: 200000,
    total_residents: 80,
    residents_paid: 60,
    total_expenses: 720000
  },
  monthly_data: [
    { month: 'Jan', collected: 65000, expenses: 60000, target: 70000 },
    { month: 'Feb', collected: 68000, expenses: 62000, target: 70000 },
    { month: 'Mar', collected: 72000, expenses: 65000, target: 70000 },
    { month: 'Apr', collected: 75000, expenses: 68000, target: 70000 },
    { month: 'May', collected: 78000, expenses: 70000, target: 70000 },
    { month: 'Jun', collected: 82000, expenses: 72000, target: 70000 },
    { month: 'Jul', collected: 85000, expenses: 75000, target: 70000 },
    { month: 'Aug', collected: 88000, expenses: 80000, target: 70000 },
    { month: 'Sep', collected: 92000, expenses: 78000, target: 70000 },
    { month: 'Oct', collected: 95000, expenses: 82000, target: 70000 },
    { month: 'Nov', collected: 98000, expenses: 85000, target: 70000 },
    { month: 'Dec', collected: 150000, expenses: 125000, target: 100000 }
  ],
  revenue_breakdown: [
    { name: 'Maintenance Fees', value: 550000, color: '#3b82f6', percentage: 64.7 },
    { name: 'Parking Fees', value: 180000, color: '#10b981', percentage: 21.2 },
    { name: 'Amenity Bookings', value: 70000, color: '#f59e0b', percentage: 8.2 },
    { name: 'Miscellaneous', value: 50000, color: '#8b5cf6', percentage: 5.9 }
  ],
  expense_breakdown: [
    { name: 'Building Maintenance', value: 320000, color: '#3b82f6', percentage: 41.0 },
    { name: 'Staff Salaries', value: 250000, color: '#10b981', percentage: 32.1 },
    { name: 'Utilities', value: 150000, color: '#f59e0b', percentage: 19.2 },
    { name: 'Security', value: 60000, color: '#ef4444', percentage: 7.7 }
  ],
  resident_payments: [
    { id: 'r1', unit: '201', resident: 'Ajay Kumar', status: 'paid' as const, amountDue: 0, daysPending: 0 },
    { id: 'r2', unit: '202', resident: 'Priya Singh', status: 'paid' as const, amountDue: 0, daysPending: 0 },
    { id: 'r3', unit: '203', resident: 'Rajesh Gupta', status: 'pending' as const, amountDue: 2500, daysPending: 5 },
    { id: 'r4', unit: '204', resident: 'Neha Sharma', status: 'pending' as const, amountDue: 2500, daysPending: 8 },
    { id: 'r5', unit: '205', resident: 'Vikram Patel', status: 'overdue' as const, amountDue: 5000, daysPending: 15 },
    { id: 'r6', unit: '206', resident: 'Anita Verma', status: 'overdue' as const, amountDue: 2500, daysPending: 10 }
  ]
}

export default function SocietyFinancialDashboard() {
  const [year, setYear] = useState<'current' | 'past'>('current')
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showResidents, setShowResidents] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const current = mockSocietyFinancials.current_year
  const past = mockSocietyFinancials.past_year

  // Calculations
  const collectedChange = current.total_collected - past.total_collected
  const collectedChangePercent = ((collectedChange / past.total_collected) * 100).toFixed(1)

  const outstandingChange = current.total_outstanding - past.total_outstanding
  const outstandingChangePercent = ((outstandingChange / past.total_outstanding) * 100).toFixed(1)

  const collectionRate = ((current.residents_paid / current.total_residents) * 100).toFixed(1)
  const collectionRatePast = ((past.residents_paid / past.total_residents) * 100).toFixed(1)
  const rateChange = (parseFloat(collectionRate) - parseFloat(collectionRatePast)).toFixed(1)

  const expenseChange = current.total_expenses - past.total_expenses
  const expenseChangePercent = ((expenseChange / past.total_expenses) * 100).toFixed(1)

  const surplus = current.total_collected - current.total_expenses

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Society Financial Dashboard</h2>
        <p className="text-sm text-slate-600">Building A • Comprehensive financial overview and transparency</p>
      </div>

      {/* Year Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setYear('current')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${year === 'current' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          2024
        </button>
        <button
          onClick={() => setYear('past')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${year === 'past' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          2023
        </button>
      </div>

      {/* Key Metrics - Top 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹{(current.total_collected / 100000).toFixed(1)}L</p>
          <div className="flex items-center gap-1 mt-1">
            {collectedChange >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${collectedChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(parseFloat(collectedChangePercent))}% {collectedChange >= 0 ? 'increase' : 'decrease'}
            </span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Outstanding Dues</p>
          <p className="text-2xl font-bold text-red-600 mt-2">₹{(current.total_outstanding / 100000).toFixed(2)}L</p>
          <div className="flex items-center gap-1 mt-1">
            {outstandingChange <= 0 ? <TrendingDown className="w-4 h-4 text-green-600" /> : <TrendingUp className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${outstandingChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(parseFloat(outstandingChangePercent))}% {outstandingChange <= 0 ? 'decrease' : 'increase'}
            </span>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase">Collection Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{collectionRate}%</p>
          <div className="flex items-center gap-1 mt-1">
            {parseFloat(rateChange) >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${parseFloat(rateChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {rateChange}% vs last year
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Total Expenses</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">₹{(current.total_expenses / 100000).toFixed(1)}L</p>
          <div className="flex items-center gap-1 mt-1">
            {expenseChange <= 0 ? <TrendingDown className="w-4 h-4 text-green-600" /> : <TrendingUp className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(parseFloat(expenseChangePercent))}% {expenseChange <= 0 ? 'decrease' : 'increase'}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Status Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Budget Status & Surplus</h3>
          {surplus >= 0 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
        </div>
        <p className="text-3xl font-bold text-green-600 mb-1">₹{(surplus / 100000).toFixed(1)}L {surplus >= 0 ? 'Surplus' : 'Deficit'}</p>
        <p className="text-sm text-slate-600 mb-4">Collected ₹{(current.total_collected / 100000).toFixed(1)}L - Spent ₹{(current.total_expenses / 100000).toFixed(1)}L</p>
        
        {/* Maintenance Fund */}
        <div className="bg-white rounded-lg p-4 mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Building Maintenance Fund</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(current.maintenance_fund / 100000).toFixed(1)}L</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">For emergency repairs & upgrades</p>
            <p className="text-sm font-semibold text-green-600 mt-2">Healthy Reserve</p>
          </div>
        </div>
      </div>

      {/* Charts Row - Revenue & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockSocietyFinancials.revenue_breakdown} cx="50%" cy="50%" labelLine={false} label={({ percentage }) => `${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {mockSocietyFinancials.revenue_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-2">
            {mockSocietyFinancials.revenue_breakdown.map((revenue) => (
              <div key={revenue.name} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{revenue.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: revenue.color }}></div>
                  <span className="font-semibold text-slate-900">₹{(revenue.value / 100000).toFixed(2)}L ({revenue.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Expense Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockSocietyFinancials.expense_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-2">
            {mockSocietyFinancials.expense_breakdown.map((expense) => (
              <div key={expense.name} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{expense.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: expense.color }}></div>
                  <span className="font-semibold text-slate-900">₹{(expense.value / 100000).toFixed(2)}L ({expense.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Monthly Trends (2024)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockSocietyFinancials.monthly_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Building Projects */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Building Projects & Fund Allocation</h3>
        <div className="space-y-3">
          {current.building_projects.map((project) => (
            <div key={project.name} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{project.name}</p>
                <p className="text-sm text-slate-600 mt-1">Allocated: ₹{(project.amount / 100000).toFixed(1)}L</p>
              </div>
              <div className="flex items-center gap-2">
                {project.status === 'completed' ? (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">In Progress</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-xs font-semibold text-green-700 uppercase">Residents Paid</p>
          <p className="text-2xl font-bold text-green-700 mt-2">{current.residents_paid}/{current.total_residents}</p>
          <p className="text-xs text-green-600 mt-1">{collectionRate}% collection rate</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-xs font-semibold text-orange-700 uppercase">Pending Payment</p>
          <p className="text-2xl font-bold text-orange-700 mt-2">{current.residents_pending}</p>
          <p className="text-xs text-orange-600 mt-1">Due within 7 days</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-xs font-semibold text-red-700 uppercase">Overdue Payment</p>
          <p className="text-2xl font-bold text-red-700 mt-2">{current.residents_overdue}</p>
          <p className="text-xs text-red-600 mt-1">Action required</p>
        </div>
      </div>

      {/* Payment Collection Details */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Resident Payment Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Unit</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Resident</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Amount Due</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Days Pending</th>
              </tr>
            </thead>
            <tbody>
              {mockSocietyFinancials.resident_payments.map((resident) => (
                <tr key={resident.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{resident.unit}</td>
                  <td className="px-4 py-3 text-slate-700">{resident.resident}</td>
                  <td className="px-4 py-3">
                    {resident.status === 'paid' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Paid</span>}
                    {resident.status === 'pending' && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Pending</span>}
                    {resident.status === 'overdue' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Overdue</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">₹{resident.amountDue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{resident.daysPending} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Key Insights & Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Annual surplus: <span className="font-semibold">₹{(surplus / 100000).toFixed(1)}L</span></li>
          <li>✓ Maintenance fund: <span className="font-semibold">₹{(current.maintenance_fund / 100000).toFixed(1)}L</span></li>
          <li>• Consider allocating surplus to community amenities or reserves</li>
          <li>• Follow up with {current.residents_overdue} overdue residents for payment</li>
        </ul>
      </div>
    </div>
  )
}
