'use client'

import { useState } from 'react'
import { Download, Calendar, BarChart3, TrendingUp, Users, AlertCircle, DollarSign, Wrench, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ReportsTabProps {
  societyId: string
}

export default function ReportsTab({ societyId }: ReportsTabProps) {
  const [activeReport, setActiveReport] = useState<'financial' | 'occupancy' | 'maintenance' | 'analytics'>('financial')
  const [dateRange, setDateRange] = useState({ startDate: '2024-01-01', endDate: '2024-03-31' })

  // Financial Data
  const financialData = [
    { month: 'January', collected: 85000, target: 90000, expenses: 25000 },
    { month: 'February', collected: 92000, target: 90000, expenses: 28000 },
    { month: 'March', collected: 88000, target: 90000, expenses: 26000 },
  ]

  const financialSummary = {
    totalCollected: 265000,
    totalTarget: 270000,
    totalExpenses: 79000,
    netBalance: 186000,
  }

  // Occupancy Data
  const occupancyData = [
    { month: 'January', occupied: 78, vacant: 22, rented: 15 },
    { month: 'February', occupied: 82, vacant: 18, rented: 18 },
    { month: 'March', occupied: 85, vacant: 15, rented: 20 },
  ]

  const occupancySummary = {
    currentOccupancy: 85,
    vacant: 15,
    rented: 20,
    owned: 65,
  }

  // Maintenance Data
  const maintenanceData = [
    { category: 'Plumbing', count: 34, resolved: 32, pending: 2, avgTime: 2.1 },
    { category: 'Electrical', count: 28, resolved: 26, pending: 2, avgTime: 1.9 },
    { category: 'Carpentry', count: 18, resolved: 18, pending: 0, avgTime: 1.5 },
    { category: 'Landscaping', count: 22, resolved: 20, pending: 2, avgTime: 3.2 },
    { category: 'Common Area', count: 15, resolved: 15, pending: 0, avgTime: 1.8 },
  ]

  const maintenanceSummary = {
    totalTickets: 117,
    resolved: 111,
    pending: 6,
    avgResolutionTime: 2.1,
  }

  // Analytics Data
  const expensePieData = [
    { name: 'Staff', value: 32000 },
    { name: 'Maintenance', value: 28000 },
    { name: 'Utilities', value: 15000 },
    { name: 'Security', value: 4000 },
  ]

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']

  // Export to PDF function
  const exportReportPDF = (reportType: string) => {
    const element = document.getElementById(`report-${reportType}`)
    if (!element) return

    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Society Report - ${reportType}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: white; }
          h1 { color: #1e293b; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
          h2 { color: #475569; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .metric { display: inline-block; margin: 10px 20px 10px 0; }
          .metric-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .metric-label { font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
        <p>Date Range: ${dateRange.startDate} to ${dateRange.endDate}</p>
        ${element.innerHTML}
        <script>
          setTimeout(() => window.print(), 250);
          setTimeout(() => window.close(), 500);
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header with Date Range and Export */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Reports & Analytics</h2>
            <p className="text-sm text-slate-600 mt-1">Generate and export detailed society reports</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => exportReportPDF(activeReport)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveReport('financial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeReport === 'financial'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Financial
        </button>
        <button
          onClick={() => setActiveReport('occupancy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeReport === 'occupancy'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Occupancy
        </button>
        <button
          onClick={() => setActiveReport('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeReport === 'maintenance'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Maintenance
        </button>
        <button
          onClick={() => setActiveReport('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeReport === 'analytics'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Financial Report */}
      {activeReport === 'financial' && (
        <div id="report-financial" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase">Total Collected</p>
              <p className="text-2xl font-bold text-green-900 mt-2">₹{financialSummary.totalCollected.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase">Target</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">₹{financialSummary.totalTarget.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
              <p className="text-xs font-semibold text-orange-700 uppercase">Total Expenses</p>
              <p className="text-2xl font-bold text-orange-900 mt-2">₹{financialSummary.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
              <p className="text-xs font-semibold text-purple-700 uppercase">Net Balance</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">₹{financialSummary.netBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Collection vs Target Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 mb-4">Collection vs Target</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                  <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 overflow-x-auto">
            <h3 className="font-bold text-slate-900 mb-4">Monthly Breakdown</h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">Collected</th>
                  <th className="px-4 py-2 text-right">Target</th>
                  <th className="px-4 py-2 text-right">Expenses</th>
                  <th className="px-4 py-2 text-right">Collection %</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((item, i) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{item.month}</td>
                    <td className="px-4 py-2 text-right">₹{item.collected.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">₹{item.target.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">₹{item.expenses.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-600">{Math.round((item.collected / item.target) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Occupancy Report */}
      {activeReport === 'occupancy' && (
        <div id="report-occupancy" className="space-y-6">
          {/* Occupancy Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase">Occupancy Rate</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{occupancySummary.currentOccupancy}%</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-4">
              <p className="text-xs font-semibold text-yellow-700 uppercase">Vacant Units</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">{occupancySummary.vacant}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase">Rented Units</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{occupancySummary.rented}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
              <p className="text-xs font-semibold text-purple-700 uppercase">Owner Occupied</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">{occupancySummary.owned}</p>
            </div>
          </div>

          {/* Occupancy Trend Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 mb-4">Occupancy Trend</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="occupied" stroke="#10b981" strokeWidth={2} name="Occupied" />
                  <Line type="monotone" dataKey="vacant" stroke="#f59e0b" strokeWidth={2} name="Vacant" />
                  <Line type="monotone" dataKey="rented" stroke="#3b82f6" strokeWidth={2} name="Rented" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 overflow-x-auto">
            <h3 className="font-bold text-slate-900 mb-4">Monthly Details</h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">Occupied</th>
                  <th className="px-4 py-2 text-right">Vacant</th>
                  <th className="px-4 py-2 text-right">Rented</th>
                  <th className="px-4 py-2 text-right">Rate %</th>
                </tr>
              </thead>
              <tbody>
                {occupancyData.map((item, i) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{item.month}</td>
                    <td className="px-4 py-2 text-right">{item.occupied}</td>
                    <td className="px-4 py-2 text-right">{item.vacant}</td>
                    <td className="px-4 py-2 text-right">{item.rented}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-600">{item.occupied}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance Report */}
      {activeReport === 'maintenance' && (
        <div id="report-maintenance" className="space-y-6">
          {/* Maintenance Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 p-4">
              <p className="text-xs font-semibold text-indigo-700 uppercase">Total Tickets</p>
              <p className="text-2xl font-bold text-indigo-900 mt-2">{maintenanceSummary.totalTickets}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
              <p className="text-xs font-semibold text-green-700 uppercase">Resolved</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{maintenanceSummary.resolved}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
              <p className="text-xs font-semibold text-orange-700 uppercase">Pending</p>
              <p className="text-2xl font-bold text-orange-900 mt-2">{maintenanceSummary.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase">Avg Resolution</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{maintenanceSummary.avgResolutionTime} days</p>
            </div>
          </div>

          {/* Maintenance Category Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 overflow-x-auto">
            <h3 className="font-bold text-slate-900 mb-4">By Category</h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Resolved</th>
                  <th className="px-4 py-2 text-right">Pending</th>
                  <th className="px-4 py-2 text-right">Avg Time (days)</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceData.map((item, i) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{item.category}</td>
                    <td className="px-4 py-2 text-right">{item.count}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-semibold">{item.resolved}</td>
                    <td className="px-4 py-2 text-right text-orange-600 font-semibold">{item.pending}</td>
                    <td className="px-4 py-2 text-right">{item.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resolution Rate Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 mb-4">Ticket Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={maintenanceData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Report */}
      {activeReport === 'analytics' && (
        <div id="report-analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown Pie Chart */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h3 className="font-bold text-slate-900 mb-4">Expense Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value / 1000}k`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Summary */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Expense Categories</h3>
              {expensePieData.map((item, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <span className="text-sm font-bold text-indigo-600">₹{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full`}
                      style={{
                        width: `${(item.value / 79000) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{Math.round((item.value / 79000) * 100)}% of total expenses</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              Key Insights
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Collection rate is at 98% - excellent performance</li>
              <li>✓ Occupancy increased from 78% to 85% over the quarter</li>
              <li>✓ Maintenance resolution time improved to 2.1 days average</li>
              <li>⚠ Staff expenses are 40% of total - consider optimization</li>
              <li>⚠ 6 pending maintenance tickets - priority action needed</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
