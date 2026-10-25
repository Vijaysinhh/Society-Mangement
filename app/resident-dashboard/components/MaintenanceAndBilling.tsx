'use client'

import { DollarSign, Calendar, CreditCard, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useBills } from '@/hooks/useResidentData'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'overdue':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="w-5 h-5" />
    case 'pending':
      return <Clock className="w-5 h-5" />
    case 'overdue':
      return <AlertCircle className="w-5 h-5" />
    default:
      return null
  }
}

export default function MaintenanceAndBilling() {
  const { bills, loading, error, refetch } = useBills()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<any | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading bills...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading bills</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={refetch} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    )
  }

  const pendingBills = bills.filter((b) => b.status === 'pending' || b.status === 'overdue')
  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0)

  const handlePayNow = (bill: any) => {
    setSelectedBill(bill)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async () => {
    if (selectedBill) {
      try {
        // Submit payment via API
        const response = await fetch('/api/bills/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('user_id') || '',
            'x-society-id': localStorage.getItem('society_id') || '',
          },
          body: JSON.stringify({ billId: selectedBill.id, amount: selectedBill.amount }),
        })
        if (response.ok) {
          setShowPaymentModal(false)
          refetch()
        }
      } catch (err) {
        console.error('Payment failed:', err)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Maintenance & Billing</h2>
        <p className="text-slate-600">View payment history and manage maintenance fees</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Pending</p>
              <p className="text-2xl font-bold text-slate-900">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Next Due Date</p>
              <p className="text-xl font-bold text-slate-900">{pendingFees[0]?.dueDate || 'N/A'}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Paid in Last 30 Days</p>
              <p className="text-2xl font-bold text-green-600">₹0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Reminders */}
      {pendingFees.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">Payment Reminder</p>
              <p className="text-sm text-amber-700 mt-1">
                You have {pendingFees.length} pending payment(s) totaling ₹{totalPending.toLocaleString()}.
                Please pay before the due date to avoid late charges.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Fee History */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Payment History</h3>
        </div>

        <div className="divide-y divide-slate-200">
          {bills.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-slate-600">
              <p>No bills found</p>
            </div>
          ) : (
            bills.map((bill) => (
            <div key={bill.id} className="px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-slate-900">{bill.bill_type}</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        bill.status
                      )}`}
                    >
                      {getStatusIcon(bill.status)}
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ₹{bill.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {bill.due_date}
                    </div>
                  </div>
                </div>

                {bill.status !== 'paid' && (
                  <button
                    onClick={() => handlePayNow(bill)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                  >
                    Pay Now
                  </button>
                )}
                {bill.status === 'paid' && (
                  <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Receipt
                  </button>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Confirmation</h3>

            <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
              <p className="text-sm text-slate-600">Bill Amount</p>
              <p className="text-2xl font-bold text-slate-900">₹{selectedBill.amount.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Due: {selectedBill.due_date}</p>
            </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-semibold text-slate-900">₹{selectedFee.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Due Date:</span>
                <span className="font-semibold text-slate-900">{selectedFee.dueDate}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Redirecting to payment gateway. Select your preferred payment method.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay ₹{selectedFee.amount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
