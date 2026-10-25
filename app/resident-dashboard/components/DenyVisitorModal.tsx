'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Visitor {
  id: string
  name: string
  purpose: 'Delivery' | 'Guest' | 'Courier' | 'Maintenance' | 'Other'
  phone: string
  loggedByWatchman: {
    name: string
    id: string
  }
}

interface DenyVisitorModalProps {
  isOpen: boolean
  visitor: Visitor | null
  onConfirm: (visitor: Visitor, reason: string, addToBlacklist: boolean) => void
  onCancel: () => void
}

const DENY_REASONS = [
  'Not expected',
  'Suspicious behavior',
  'Harassment',
  'Unauthorized access attempt',
  'Other',
]

export default function DenyVisitorModal({ isOpen, visitor, onConfirm, onCancel }: DenyVisitorModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [addToBlacklist, setAddToBlacklist] = useState(false)

  if (!isOpen || !visitor) return null

  const handleConfirm = () => {
    if (!selectedReason) return
    onConfirm(visitor, selectedReason, addToBlacklist)
    setSelectedReason('')
    setAddToBlacklist(false)
  }

  const handleCancel = () => {
    setSelectedReason('')
    setAddToBlacklist(false)
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      {/* Modal */}
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl p-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Deny Visitor?</h2>
          <button
            onClick={handleCancel}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visitor Info */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="font-semibold text-slate-900">{visitor.name}</p>
          <p className="text-xs text-slate-600">{visitor.purpose} • {visitor.phone}</p>
        </div>

        {/* Reason Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Reason for denial
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="">Select a reason...</option>
            {DENY_REASONS.map(reason => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Blacklist Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={addToBlacklist}
              onChange={(e) => setAddToBlacklist(e.target.checked)}
              className="mt-1 w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">Add to Blacklist</p>
              <p className="text-xs text-slate-600 mt-0.5">Watchman will be notified and visitor denied at gate</p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Deny Visitor
          </button>
        </div>
      </div>
    </div>
  )
}
