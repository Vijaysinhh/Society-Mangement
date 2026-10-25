'use client'

import { useState } from 'react'
import { Download, Calendar, TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Filter } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface FinancialReport {
  period: string
  collected: number
  expenses: number
  surplus: number
  collectionRate: number
  averageBill: number
}

const annualReports: FinancialReport[] = [
  { period: 'Q1 2024', collected: 205000, expenses: 187000, surplus: 18000, collectionRate: 68.5, averageBill: 2504 },
  { period: 'Q2 2024', collected: 235000, expenses: 210000, surplus: 25000, collectionRate: 72.1, averageBill: 2510 },
  { period: 'Q3 2024', collected: 265000, expenses: 232000, surplus: 33000, collectionRate: 75.3, averageBill: 2515 },
  { period: 'Q4 2024', collected: 145000, expenses: 151000, surplus: -6000, collectionRate: 71.2, averageBill: 2500 }
]

const monthlyTrends = [
  { month: 'Jan', avgPaymentTime: 15, collectionGap: 5, residents: 68 },
  { month: 'Feb', avgPaymentTime: 14, collectionGap: 4, residents: 68 },
  { month: 'Mar', avgPaymentTime: 13, collectionGap: 3, residents: 70 },
  { month: 'Apr', avgPaymentTime: 12, collectionGap: 2, residents: 72 },
  { month: 'May', avgPaymentTime: 11, collectionGap: 2, residents: 73 },
  { month: 'Jun', avgPaymentTime: 10, collectionGap: 1, residents: 74 },
  { month: 'Jul', avgPaymentTime: 9, collectionGap: 1, residents: 75 },
  { month: 'Aug', avgPaymentTime: 9, collectionGap: 0, residents: 76 }
]

const expensesTrend = [
  { month: 'Jan', maintenance: 48000, salaries: 20000, utilities: 12000, security: 5000 },
  { month: 'Feb', maintenance: 49500, salaries: 20000, utilities: 13000, security: 5000 },
  { month: 'Mar', maintenance: 51000, salaries: 20000, utilities: 14000, security: 5000 },
  { month: 'Apr', maintenance: 52000, salaries: 21000, utilities: 13500, security: 5000 },
  { month: 'May', maintenance: 53000, salaries: 21000, utilities: 14500, security: 5000 },
  { month: 'Jun', maintenance: 54000, salaries: 21000, utilities: 15000, security: 5000 }
]

// export default function FinancialReports() {
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly')
  const [selectedMetric, setSelectedMetric] = useState<'collected' | 'expenses' | 'surplus' | 'collectionRate'>('collected')
  const [showComparison, setShowComparison] = useState(false)

  // Calculate trends
  const latestReport = annualReports[annualReports.length - 1]
  const previousReport = annualReports[annualReports.length - 2]

  const collectedTrend = latestReport.collected - previousReport.collected
  const collectedTrendPercent = ((collectedTrend / previousReport.collected) * 100).toFixed(1)

  const expenseTrend = latestReport.expenses - previousReport.expenses
  const expenseTrendPercent = ((expenseTrend / previousReport.expenses) * 100).toFixed(1)

  const surplusTrend = latestReport.surplus - previousReport.surplus
  const surplusTrendPercent = previousReport.surplus !== 0 ? ((surplusTrend / Math.abs(previousReport.surplus)) * 100).toFixed(1) : 'N/A'

  const collectionRateTrend = (latestReport.collectionRate - previousReport.collectionRate).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports & Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">Detailed trends and performance analysis</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { key: 'monthly', label: 'Monthly' },
          { key: 'quarterly', label: 'Quarterly' },
          { key: 'annual', label: 'Annual' }
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setReportPeriod(p.key as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              reportPeriod === p.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹{(latestReport.collected / 100000).toFixed(1)}L</p>
          <div className="flex items-center gap-1 mt-2">
            {collectedTrend >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${collectedTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {collectedTrendPercent}% last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Total Expenses</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">₹{(latestReport.expenses / 100000).toFixed(1)}L</p>
          <div className="flex items-center gap-1 mt-2">
            {expenseTrend <= 0 ? <TrendingDown className="w-4 h-4 text-green-600" /> : <TrendingUp className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${expenseTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expenseTrendPercent}% last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Net Surplus</p>
          <p className={`text-2xl font-bold mt-2 ${latestReport.surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{(latestReport.surplus / 100000).toFixed(1)}L
          </p>
          <div className="flex items-center gap-1 mt-2">
            {surplusTrend >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${surplusTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {surplusTrendPercent}% last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Collection Rate</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{latestReport.collectionRate}%</p>
          <div className="flex items-center gap-1 mt-2">
            {parseFloat(collectionRateTrend) >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={`text-xs font-semibold ${parseFloat(collectionRateTrend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {collectionRateTrend}% last period
            </span>
          </div>
        </div>
      </div>

      {/* Quarterly Performance Table */}
      {reportPeriod === 'quarterly' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Quarterly Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Period</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Collected</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Expenses</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Surplus</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Collection Rate</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Avg Bill</th>
                </tr>
              </thead>
              <tbody>
                {annualReports.map((report, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 text-slate-900 font-semibold">{report.period}</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹{(report.collected / 100000).toFixed(1)}L</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹{(report.expenses / 100000).toFixed(1)}L</td>
                    <td className={`px-4 py-3 text-right font-semibold ${report.surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(report.surplus / 100000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">{report.collectionRate}%</td>
                    <td className="px-4 py-3 text-right text-slate-900">₹{report.averageBill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collected vs Expenses Trend */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <LineChartIcon className="w-5 h-5" />
          Collection vs Expense Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="avgPaymentTime" stroke="#3b82f6" name="Avg Payment Days" />
            <Line yAxisId="right" type="monotone" dataKey="residents" stroke="#10b981" name="Residents Paid" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown Trend */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Expense Category Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expensesTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="maintenance" fill="#3b82f6" name="Maintenance" />
            <Bar dataKey="salaries" fill="#10b981" name="Salaries" />
            <Bar dataKey="utilities" fill="#f59e0b" name="Utilities" />
            <Bar dataKey="security" fill="#ef4444" name="Security" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Key Insights & Recommendations</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span><strong>Collection Efficiency:</strong> Collection rate has improved from 68.5% (Q1) to 75.3% (Q3), indicating better payment discipline</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span><strong>Expense Control:</strong> Maintenance costs increasing at 2% monthly. Review contractor agreements to optimize</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span><strong>Surplus Generation:</strong> ₹76L surplus generated in 9 months. Allocate for pending terrace waterproofing project</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-0.5">•</span>
            <span><strong>Q4 Planning:</strong> Q4 typically shows collection dips. Start reminder campaigns 2 weeks before due dates</span>
          </li>
        </ul>
      </div>

      {/* Year-over-Year Comparison */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Year-over-Year Comparison</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">2024 Performance (So Far)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Collected:</span>
                <span className="font-bold text-slate-900">₹8.5L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Expenses:</span>
                <span className="font-bold text-slate-900">₹7.8L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Net Surplus:</span>
                <span className="font-bold text-green-600">₹70k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Collection Rate:</span>
                <span className="font-bold text-slate-900">72.8%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">2023 Full Year</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Collected:</span>
                <span className="font-bold text-slate-900">₹7.5L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Expenses:</span>
                <span className="font-bold text-slate-900">₹7.2L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Net Surplus:</span>
                <span className="font-bold text-green-600">₹30k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Collection Rate:</span>
                <span className="font-bold text-slate-900">75.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
