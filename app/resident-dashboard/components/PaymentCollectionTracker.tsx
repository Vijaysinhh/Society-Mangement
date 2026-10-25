'use client'

import { useState } from 'react'
import { Users, AlertCircle, CheckCircle2, Clock, Send, Filter, Search, MapPin, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface ResidentPayment {
  id: string
  unit: string
  resident: string
  phone: string
  email: string
  status: 'paid' | 'pending' | 'overdue' | 'disputed'
  amountDue: number
  daysPending: number
  lastPaymentDate?: string
  lastReminderSentDate?: string
  reminderCount: number
  notes?: string
}

const mockResidents: ResidentPayment[] = [
  {
    id: 'r1',
    unit: '201',
    resident: 'Ajay Kumar',
    phone: '+91 98765 43210',
    email: 'ajay@email.com',
    status: 'paid',
    amountDue: 0,
    daysPending: 0,
    lastPaymentDate: '2024-03-15',
    reminderCount: 0
  },
  {
    id: 'r2',
    unit: '202',
    resident: 'Priya Singh',
    phone: '+91 87654 32109',
    email: 'priya@email.com',
    status: 'paid',
    amountDue: 0,
    daysPending: 0,
    lastPaymentDate: '2024-03-14',
    reminderCount: 0
  },
  {
    id: 'r3',
    unit: '203',
    resident: 'Rajesh Gupta',
    phone: '+91 76543 21098',
    email: 'rajesh@email.com',
    status: 'pending',
    amountDue: 2500,
    daysPending: 5,
    lastReminderSentDate: '2024-03-20',
    reminderCount: 1,
    notes: 'Promised payment by 25th'
  },
  {
    id: 'r4',
    unit: '204',
    resident: 'Neha Sharma',
    phone: '+91 65432 10987',
    email: 'neha@email.com',
    status: 'pending',
    amountDue: 2500,
    daysPending: 8,
    lastReminderSentDate: '2024-03-15',
    reminderCount: 2,
    notes: 'Recent transfer to new location'
  },
  {
    id: 'r5',
    unit: '205',
    resident: 'Vikram Patel',
    phone: '+91 54321 09876',
    email: 'vikram@email.com',
    status: 'overdue',
    amountDue: 5000,
    daysPending: 15,
    lastPaymentDate: '2024-01-20',
    lastReminderSentDate: '2024-03-18',
    reminderCount: 3,
    notes: 'Dispute claim filed - under review'
  },
  {
    id: 'r6',
    unit: '206',
    resident: 'Anita Verma',
    phone: '+91 43210 98765',
    email: 'anita@email.com',
    status: 'overdue',
    amountDue: 2500,
    daysPending: 10,
    lastPaymentDate: '2024-02-18',
    lastReminderSentDate: '2024-03-22',
    reminderCount: 2,
    notes: 'Medical emergency - requested extension'
  },
  {
    id: 'r7',
    unit: '207',
    resident: 'Suresh Kumar',
    phone: '+91 32109 87654',
    email: 'suresh@email.com',
    status: 'disputed',
    amountDue: 2500,
    daysPending: 20,
    lastPaymentDate: '2024-02-10',
    lastReminderSentDate: '2024-03-10',
    reminderCount: 4,
    notes: 'Disputes water charges - waiting for audit'
  }
]

// export default function PaymentCollectionTracker() {
  const [residents, setResidents] = useState<ResidentPayment[]>(mockResidents)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'disputed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'daysPending' | 'amountDue' | 'name'>('daysPending')
  const [selectedResident, setSelectedResident] = useState<ResidentPayment | null>(null)
  const [reminderMessage, setReminderMessage] = useState('')
  const [reminderMethod, setReminderMethod] = useState<'sms' | 'email' | 'whatsapp'>('sms')

  // Filter residents
  const filteredResidents = residents.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    const matchesSearch = r.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.unit.includes(searchTerm) ||
                         r.phone.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  // Sort residents
  const sortedResidents = [...filteredResidents].sort((a, b) => {
    switch (sortBy) {
      case 'daysPending':
        return b.daysPending - a.daysPending
      case 'amountDue':
        return b.amountDue - a.amountDue
      case 'name':
        return a.resident.localeCompare(b.resident)
      default:
        return 0
    }
  })

  // Calculations
  const totalDue = residents.filter(r => r.status !== 'paid').reduce((sum, r) => sum + r.amountDue, 0)
  const overdueDays = residents.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.daysPending, 0) / residents.filter(r => r.status === 'overdue').length || 0
  const pendingCount = residents.filter(r => r.status === 'pending' || r.status === 'overdue').length
  const paidCount = residents.filter(r => r.status === 'paid').length

  const handleSendReminder = () => {
    if (!selectedResident || !reminderMessage.trim()) {
      toast.error('Please enter a reminder message')
      return
    }

    toast.success(`Reminder sent via ${reminderMethod.toUpperCase()}`, {
      description: `Message sent to ${selectedResident.resident} (${selectedResident[reminderMethod === 'sms' ? 'phone' : 'email']})`
    })

    // Update resident with reminder
    setResidents(residents.map(r =>
      r.id === selectedResident.id
        ? {
            ...r,
            reminderCount: r.reminderCount + 1,
            lastReminderSentDate: new Date().toISOString().split('T')[0]
          }
        : r
    ))

    setReminderMessage('')
    setSelectedResident(null)
  }

  const markAsPaid = (residentId: string) => {
    setResidents(residents.map(r =>
      r.id === residentId
        ? {
            ...r,
            status: 'paid' as const,
            amountDue: 0,
            daysPending: 0,
            lastPaymentDate: new Date().toISOString().split('T')[0]
          }
        : r
    ))
    toast.success('Marked as paid')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Collection Tracker</h1>
        <p className="text-sm text-slate-600 mt-1">Monitor resident payment status and send reminders</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Total Due</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">₹{(totalDue / 100000).toFixed(2)}L</p>
          <p className="text-xs text-slate-600 mt-1">{residents.filter(r => r.status !== 'paid').length} residents</p>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4">
          <p className="text-xs font-semibold text-green-600 uppercase">Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{paidCount}</p>
          <p className="text-xs text-slate-600 mt-1">{((paidCount / residents.length) * 100).toFixed(1)}% collection rate</p>
        </div>

        <div className="bg-white rounded-lg border border-amber-200 p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {residents.filter(r => r.status === 'pending').length}
          </p>
          <p className="text-xs text-slate-600 mt-1">Avg {residents.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.daysPending, 0) / Math.max(1, residents.filter(r => r.status === 'pending').length) || 0 | 0} days pending</p>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4">
          <p className="text-xs font-semibold text-red-600 uppercase">Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {residents.filter(r => r.status === 'overdue').length}
          </p>
          <p className="text-xs text-slate-600 mt-1">Avg {Math.ceil(overdueDays)} days overdue</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All', count: residents.length },
            { key: 'paid', label: 'Paid', count: residents.filter(r => r.status === 'paid').length },
            { key: 'pending', label: 'Pending', count: residents.filter(r => r.status === 'pending').length },
            { key: 'overdue', label: 'Overdue', count: residents.filter(r => r.status === 'overdue').length },
            { key: 'disputed', label: 'Disputed', count: residents.filter(r => r.status === 'disputed').length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, unit, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="daysPending">Sort by Days Pending</option>
            <option value="amountDue">Sort by Amount Due</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Unit</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Resident</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">Amount Due</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">Days</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">Reminders</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedResidents.map((resident, idx) => (
                <tr key={resident.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 text-slate-900 font-semibold">{resident.unit}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-slate-900 font-semibold">{resident.resident}</p>
                      <p className="text-xs text-slate-600">{resident.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      resident.status === 'paid' ? 'bg-green-100 text-green-700' :
                      resident.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      resident.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {resident.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {resident.status === 'pending' && <Clock className="w-3 h-3" />}
                      {resident.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                      {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    {resident.amountDue > 0 ? `₹${resident.amountDue.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {resident.daysPending > 0 ? (
                      <span className={`font-semibold ${
                        resident.daysPending > 10 ? 'text-red-600' :
                        resident.daysPending > 5 ? 'text-amber-600' :
                        'text-slate-600'
                      }`}>
                        {resident.daysPending}d
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                      {resident.reminderCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {resident.status !== 'paid' && (
                      <>
                        <button
                          onClick={() => setSelectedResident(resident)}
                          className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-semibold"
                        >
                          Remind
                        </button>
                        <button
                          onClick={() => markAsPaid(resident.id)}
                          className="px-2 py-1 text-green-600 hover:bg-green-50 rounded text-xs font-semibold"
                        >
                          Paid
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="border-b border-slate-200 p-4">
              <h3 className="text-lg font-bold text-slate-900">Send Reminder</h3>
              <p className="text-sm text-slate-600 mt-1">{selectedResident.resident} (Unit {selectedResident.unit})</p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Reminder Method</label>
                <div className="flex gap-2">
                  {(['sms', 'email', 'whatsapp'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setReminderMethod(method)}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
                        reminderMethod === method
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {method === 'sms' ? 'SMS' : method === 'email' ? 'Email' : 'WhatsApp'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Your payment of ₹2,500 is due. Please pay by 25th March..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-2">{reminderMessage.length}/160 characters</p>
              </div>

              {selectedResident.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-900 uppercase">Notes</p>
                  <p className="text-sm text-blue-800 mt-1">{selectedResident.notes}</p>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="text-slate-600">
                  <strong>{selectedResident.resident}</strong> has received <strong>{selectedResident.reminderCount} reminder(s)</strong> before
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2">
              <button
                onClick={() => setSelectedResident(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
