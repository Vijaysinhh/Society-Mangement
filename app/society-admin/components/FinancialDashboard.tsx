'use client'

import React, { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Percent, Target } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FinancialDashboardProps {
  societyId: string
}

export default function FinancialDashboard({ societyId }: FinancialDashboardProps) {
  const [year] = useState(new Date().getFullYear())

  // Sample financial data for this year
  const financialData = {
    totalRevenue: 1250000,
    outstandingDues: 185000,
    totalExpenses: 620000,
    netBalance: 445000,
    collectionRate: 87.5,
  }

  // Monthly revenue vs expenses data for bar chart
  const monthlyData = [
    { month: 'Jan', revenue: 95000, expenses: 52000 },
    { month: 'Feb', revenue: 98000, expenses: 48000 },
    { month: 'Mar', revenue: 102000, expenses: 55000 },
    { month: 'Apr', revenue: 99000, expenses: 51000 },
    { month: 'May', revenue: 105000, expenses: 53000 },
    { month: 'Jun', revenue: 108000, expenses: 54000 },
    { month: 'Jul', revenue: 110000, expenses: 56000 },
    { month: 'Aug', revenue: 112000, expenses: 57000 },
    { month: 'Sep', revenue: 108000, expenses: 52000 },
    { month: 'Oct', revenue: 115000, expenses: 59000 },
    { month: 'Nov', revenue: 118000, expenses: 61000 },
    { month: 'Dec', revenue: 120000, expenses: 63000 },
  ]

  // Expense breakdown for pie chart
  const expenseBreakdown = [
    { name: 'Maintenance', value: 220000, color: '#4F46E5' },
    { name: 'Utilities', value: 155000, color: '#7C3AED' },
    { name: 'Staff', value: 145000, color: '#EC4899' },
    { name: 'Security', value: 80000, color: '#F59E0B' },
    { name: 'Others', value: 20000, color: '#10B981' },
  ]

  // Summary Card Component
  const SummaryCard = ({ icon: Icon, label, value, color, trend, trendValue }: any) => (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-6">
      {/* Year Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Viewing Financial Data for</p>
          <p className="text-2xl font-bold text-slate-900">{year}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600">Year-to-Date</p>
          <p className="text-sm font-semibold text-indigo-600">Current Year</p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${(financialData.totalRevenue / 100000).toFixed(2)}L`}
          color="bg-green-600"
          trend="up"
          trendValue="+12%"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Outstanding Dues"
          value={`₹${(financialData.outstandingDues / 1000).toFixed(0)}K`}
          color="bg-red-600"
          trend="down"
          trendValue="-8%"
        />
        <SummaryCard
          icon={DollarSign}
          label="Total Expenses"
          value={`₹${(financialData.totalExpenses / 100000).toFixed(2)}L`}
          color="bg-orange-600"
          trend="up"
          trendValue="+5%"
        />
        <SummaryCard
          icon={Target}
          label="Net Balance"
          value={`₹${(financialData.netBalance / 100000).toFixed(2)}L`}
          color="bg-indigo-600"
          trend="up"
          trendValue="+18%"
        />
        <SummaryCard
          icon={Percent}
          label="Collection Rate"
          value={`${financialData.collectionRate}%`}
          color="bg-blue-600"
          trend="up"
          trendValue="+3%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Revenue vs Expenses */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F1F5F9',
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#F59E0B" name="Expenses" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Expense Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}K`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F1F5F9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-green-600 pl-4">
            <p className="text-slate-600 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(financialData.totalRevenue / 100000).toFixed(2)}L</p>
            <p className="text-xs text-green-600 mt-2">+12% from last year</p>
          </div>
          <div className="border-l-4 border-orange-600 pl-4">
            <p className="text-slate-600 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(financialData.totalExpenses / 100000).toFixed(2)}L</p>
            <p className="text-xs text-orange-600 mt-2">+5% from last year</p>
          </div>
          <div className="border-l-4 border-indigo-600 pl-4">
            <p className="text-slate-600 text-sm">Net Profit</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(financialData.netBalance / 100000).toFixed(2)}L</p>
            <p className="text-xs text-indigo-600 mt-2">+18% from last year</p>
          </div>
        </div>
      </div>
    </div>
  )
}
