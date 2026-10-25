'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Calendar, ChevronDown, ChevronUp, Download, PieChart as PieChartIcon, TrendingUp, DollarSign } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { toast } from 'sonner'
import { dataStore } from '@/lib/centralDataStore'
import type { Bill, Payment } from '@/lib/centralDataStore'
import StatusLabel from './StatusLabel'

interface AmenityPayment {
  id: string
  amenity: string
  date: string
  timeSlot: string
  amount: number
  status: 'confirmed' | 'pending' | 'cancelled'
}

interface FinancialManagementProps {
  residentEmail: string
}

// export default function FinancialManagement({ residentEmail }: FinancialManagementProps) {
  const [tab, setTab] = useState<'overview' | 'amenities' | 'history'>('overview')
  const [expandedBill, setExpandedBill] = useState<string | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    // Load initial bills and payments for this resident (privacy: only this resident's data)
    setBills(residentBills)
    setPayments(residentPayments)

    // Subscribe to bill and payment events for real-time updates
      if (bill.residentId === residentEmail) {
        setBills(prev => [bill, ...prev])
      }
    })

      if (bill.residentId === residentEmail) {
        setBills(prev => prev.map(b => b.id === bill.id ? bill : b))
      }
    })

      if (payment.residentId === residentEmail) {
        setPayments(prev => [payment, ...prev])
        // Also update bill status when payment is recorded
        setBills(prev => prev.map(b => {
          if (b.id === payment.billId && payment.amount >= b.amount) {
            return { ...b, status: 'paid' as const, paidDate: new Date().toISOString() }
          }
          return b
        }))
      }
    })

    return () => {
      unsubBillAdded()
      unsubBillUpdated()
      unsubPaymentRecorded()
    }
  }, [residentEmail])

  const allBills = bills
  const handlePayBill = (billId: string, amount: number) => {
      billId,
      residentId: residentEmail,
      amount,
      method: 'online',
      reference: `PAY-${Date.now()}`,
      paymentDate: new Date().toISOString()
    })
    toast.success('Payment recorded successfully')
  }

  const categoryData = [
    { name: 'Maintenance', value: 1200, color: '#3b82f6' },
    { name: 'Water', value: 400, color: '#10b981' },
    { name: 'Electricity', value: 600, color: '#f59e0b' },
    { name: 'Parking', value: 300, color: '#8b5cf6' }
  ]

  const amenityPayments: AmenityPayment[] = [
    { id: 'gym-001', amenity: 'Gym Membership', date: '2024-03-01', timeSlot: 'Monthly', amount: 500, status: 'confirmed' },
    { id: 'pool-001', amenity: 'Swimming Pool', date: '2024-03-15', timeSlot: '6 Sessions', amount: 1200, status: 'confirmed' },
    { id: 'hall-001', amenity: 'Community Hall', date: '2024-03-20', timeSlot: '4 hours', amount: 2000, status: 'pending' }
  ]

  const paymentHistory: Payment[] = [
    { id: 'pay-001', date: '2024-02-24', amount: 2500, method: 'UPI', reference: 'UPI/12345', status: 'completed' },
    { id: 'pay-002', date: '2024-01-23', amount: 2500, method: 'Bank Transfer', reference: 'NEFT/67890', status: 'completed' },
    { id: 'pay-003', date: '2023-12-22', amount: 2500, method: 'Card', reference: 'CC/11111', status: 'completed' }
  ]

  const overdueBills = allBills.filter(b => b.status === 'overdue')
  const pendingBills = allBills.filter(b => b.status === 'pending')
  const paidBills = allBills.filter(b => b.status === 'paid')

  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount + (b.lateFee || 0), 0)
  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0)
  const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        {(['overview', 'amenities', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'amenities' ? 'Amenities' : 'History'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600 uppercase">Total Paid</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-2">{paidBills.length} paid this year</p>
            </div>

            <div className="bg-white rounded-lg border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase">Payment Due</p>
              <p className="text-3xl font-bold text-amber-700 mt-2">₹{totalOverdue.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-2">{overdueBills.length} needing attention</p>
            </div>

            <div className="bg-white rounded-lg border border-blue-200 p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">₹{totalPending.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-2">{pendingBills.length} due soon</p>
            </div>
          </div>

          {/* Smart Payment Reminder - Supportive not Punitive */}
          {overdueBills.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Payment Due</p>
                  <p className="text-sm text-amber-800 mt-1">
                    You have {overdueBills.length} payment{overdueBills.length > 1 ? 's' : ''} due totaling ₹{totalOverdue.toLocaleString()}. Please process payment to keep your account in good standing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Payment Alert */}
          {pendingBills.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Payment Coming Up</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {pendingBills[0].type} of ₹{pendingBills[0].amount.toLocaleString()} due on {new Date(pendingBills[0].dueDate).toLocaleDateString()}. Payment methods available whenever you&apos;re ready.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Expense Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={{ fill: '#666', fontSize: 12 }} outerRadius={80} fill="#8884d8" dataKey="value">
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bills by Status */}
          <div className="space-y-4">
            {/* Payment Due Now - Reframed from shame-inducing "Overdue" */}
            {overdueBills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-700 uppercase flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Payment Due Now ({overdueBills.length})
                </h3>
                {overdueBills.map(bill => (
                  <div key={bill.id} className="bg-white rounded-xl border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
                    <button
                      onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                      className="w-full p-4 hover:bg-amber-50 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{bill.month}</h4>
                            <StatusLabel status="overdue" size="sm" />
                          </div>
                          <p className="text-sm text-slate-600">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">₹{bill.amount.toLocaleString()}</p>
                            {bill.lateFee && <p className="text-xs text-amber-600 font-semibold">+₹{bill.lateFee} charge</p>}
                          </div>
                          {expandedBill === bill.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>

                    {expandedBill === bill.id && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                        {bill.lateFee && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-amber-700 uppercase">Additional Charge</p>
                            <p className="text-lg font-bold text-amber-900 mt-1">₹{bill.lateFee}</p>
                            <p className="text-xs text-amber-700 mt-1">{bill.daysOverdue} days past due</p>
                            <p className="text-xs text-amber-700 mt-2 font-medium">Total due: ₹{(bill.amount + (bill.lateFee || 0)).toLocaleString()}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-slate-900 uppercase">Breakdown</h5>
                          {bill.breakdown && bill.breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.category}</span>
                              <span className="font-semibold text-slate-900">₹{item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">Pay Now</button>
                          <button className="px-3 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300">Dispute Bill</button>
                          <button className="px-3 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200">Download</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Due Soon */}
            {pendingBills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-blue-700 uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Due Soon ({pendingBills.length})
                </h3>
                {pendingBills.map(bill => (
                  <div key={bill.id} className="bg-white rounded-xl border-l-4 border-l-blue-400 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{bill.month}</h4>
                        <p className="text-sm text-slate-600 mt-1">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">₹{bill.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paid */}
            {paidBills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-green-700 uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Paid ({paidBills.length})
                </h3>
                {paidBills.map(bill => (
                  <div key={bill.id} className="bg-green-50 rounded-xl border border-green-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{bill.month}</h4>
                        <p className="text-xs text-green-700">Paid on {bill.paidDate ? new Date(bill.paidDate).toLocaleDateString() : 'Date'}</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">✓ ₹{bill.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AMENITIES TAB */}
      {tab === 'amenities' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Amenity Bookings</h3>
          {amenityPayments.map(payment => (
            <div key={payment.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{payment.amenity}</h4>
                  <p className="text-sm text-slate-600 mt-1">{payment.timeSlot} • {new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">₹{payment.amount}</p>
                  <StatusLabel status={payment.status === 'confirmed' ? 'paid' : 'pending'} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Payment History</h3>
          {paymentHistory.map(payment => (
            <div key={payment.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-600 mt-1">{payment.method} • {new Date(payment.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Ref: {payment.reference}</p>
                </div>
                <button className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
