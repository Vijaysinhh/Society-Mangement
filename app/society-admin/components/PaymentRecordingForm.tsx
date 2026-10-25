'use client'

import { useState } from 'react'
import { X, DollarSign, Calendar, MessageSquare, CreditCard, AlertCircle } from 'lucide-react'
import { MaintenanceFeeRecord, recordMaintenancePayment } from '../lib/maintenanceFeeManager'

interface PaymentRecordingFormProps {
  fee: MaintenanceFeeRecord
  unit: any
  onClose: () => void
  onPaymentRecorded: (updatedFee: MaintenanceFeeRecord) => void
}

export default function PaymentRecordingForm({ fee, unit, onClose, onPaymentRecorded }: PaymentRecordingFormProps) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque' | 'upi' | 'bank-transfer' | 'online'>('cash')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const remainingAmount = fee.remainingAmount
  const isFullPayment = amount === remainingAmount.toString()
  const amountNum = parseFloat(amount) || 0

  const handleRecordPayment = async () => {
    setError('')

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNum > remainingAmount) {
      setError(`Amount cannot exceed remaining balance of ₹${remainingAmount.toFixed(2)}`)
      return
    }

    setIsProcessing(true)
    try {
      const paymentType = isFullPayment ? 'full' : 'partial'
      const updatedFee = recordMaintenancePayment(
        fee,
        amountNum,
        paymentType,
        notes,
        paymentMethod
      )

      onPaymentRecorded(updatedFee)
      onClose()
    } catch (err) {
      setError('Failed to record payment. Please try again.')
      console.error('[v0] Payment recording error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Unit & Fee Info */}
        <div className="bg-slate-50 rounded p-4 space-y-2">
          <p className="text-sm text-slate-600">Unit <span className="font-semibold text-slate-900">{unit?.unitNumber}</span></p>
          <p className="text-sm text-slate-600">Month <span className="font-semibold text-slate-900">{fee.month}</span></p>
          <div className="border-t border-slate-200 pt-2 mt-2">
            <p className="text-xs text-slate-600">Due Amount: <span className="font-bold text-slate-900">₹{remainingAmount.toFixed(2)}</span></p>
            <p className="text-xs text-slate-600">Already Paid: <span className="font-bold text-green-600">₹{fee.paidAmount.toFixed(2)}</span></p>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={remainingAmount}
              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">Max: ₹{remainingAmount.toFixed(2)}</p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
            <option value="bank-transfer">Bank Transfer</option>
            <option value="online">Online Payment</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reference number, receipt details, etc."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            rows={3}
          />
        </div>

        {/* Payment Type Indicator */}
        {amount && (
          <div className={`p-3 rounded-lg flex items-start gap-3 ${isFullPayment ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isFullPayment ? 'text-green-600' : 'text-blue-600'}`} />
            <p className={`text-sm ${isFullPayment ? 'text-green-700' : 'text-blue-700'}`}>
              {isFullPayment ? '✓ This will mark the fee as FULLY PAID' : `Partial payment of ₹${amountNum.toFixed(2)} (₹${(remainingAmount - amountNum).toFixed(2)} remaining)`}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleRecordPayment}
            disabled={isProcessing || !amount || amountNum <= 0}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            {isProcessing ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}
