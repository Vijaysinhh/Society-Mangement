'use client'

import { MaintenanceFeeRecord } from '../lib/maintenanceFeeManager'
import { Calendar, User, Banknote, FileText } from 'lucide-react'

interface PaymentHistoryProps {
  fee: MaintenanceFeeRecord
  unit: any
}

export default function PaymentHistory({ fee, unit }: PaymentHistoryProps) {
  const getDaysAgo = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return `${diff} days ago`
  }

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      'cash': 'bg-green-50 text-green-700 border-green-200',
      'cheque': 'bg-blue-50 text-blue-700 border-blue-200',
      'upi': 'bg-purple-50 text-purple-700 border-purple-200',
      'bank-transfer': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'online': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    }
    return colors[method] || 'bg-slate-50 text-slate-700 border-slate-200'
  }

  const totalPaid = fee.payments.length
  const totalAmount = fee.payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded p-3">
          <p className="text-xs text-slate-600 mb-1">Total Payments</p>
          <p className="text-lg font-bold text-slate-900">{totalPaid}</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-xs text-green-700 mb-1">Total Collected</p>
          <p className="text-lg font-bold text-green-700">₹{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Timeline */}
      {fee.payments.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">Payment Timeline</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fee.payments.map((payment, idx) => (
              <div key={payment.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                {/* Payment Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">₹{payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-600">{payment.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPaymentMethodColor(payment.paymentMethod || 'cash')}`}>
                    {(payment.paymentMethod || 'cash').replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Payment Details */}
                <div className="space-y-1.5 text-xs text-slate-600 ml-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(payment.paidDate).toLocaleDateString('en-IN')} • {getDaysAgo(payment.paidDate)}</span>
                  </div>

                  {payment.notes && (
                    <div className="flex items-start gap-2 mt-2">
                      <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">{payment.notes}</span>
                    </div>
                  )}
                </div>

                {/* Audit Info */}
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">Payment ID: {payment.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No payments recorded yet</p>
          <p className="text-xs text-slate-500 mt-1">Use "Record Payment" button to add a payment</p>
        </div>
      )}

      {/* Fee Summary */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Fee Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Amount Due</span>
            <span className="font-semibold text-slate-900">₹{fee.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Already Paid</span>
            <span className="font-semibold text-green-600">₹{fee.paidAmount.toFixed(2)}</span>
          </div>
          <div className="bg-slate-50 rounded p-2 flex justify-between">
            <span className="text-slate-900 font-semibold">Remaining Amount</span>
            <span className={`font-bold ${fee.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{fee.remainingAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Status</h4>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            fee.status === 'paid' ? 'bg-green-500' : 
            fee.status === 'partially_paid' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
          <span className={`text-sm font-medium ${
            fee.status === 'paid' ? 'text-green-700' : 
            fee.status === 'partially_paid' ? 'text-yellow-700' : 
            'text-red-700'
          }`}>
            {fee.status === 'paid' ? 'PAID' : fee.status === 'partially_paid' ? 'PARTIALLY PAID' : 'PENDING'}
            {fee.daysOverdue > 0 && fee.status !== 'paid' && ` • ${fee.daysOverdue} days overdue`}
          </span>
        </div>
      </div>
    </div>
  )
}
