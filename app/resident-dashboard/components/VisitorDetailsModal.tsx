'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Visitor {
  id: string
  name: string
  purpose: 'Delivery' | 'Guest' | 'Courier' | 'Maintenance' | 'Other'
  gateTime: string
  flatNumber: string
  residentName: string
  watchmanLogged: {
    name: string
    id: string
  }
  photo?: string
  status: 'pending' | 'approved' | 'denied'
}

interface VisitorDetailsModalProps {
  visitor: Visitor | null
  isOpen: boolean
  onClose: () => void
  onApprove: (visitorId: string) => void
  onDeny: (visitorId: string) => void
  onBlacklist: (visitorId: string) => void
}

export default function VisitorDetailsModal({
  visitor,
  isOpen,
  onClose,
  onApprove,
  onDeny,
  onBlacklist,
}: VisitorDetailsModalProps) {
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState('')
  const [buildingWideBlacklist, setBuildingWideBlacklist] = useState(false)

  if (!isOpen || !visitor) return null

  const handleBlacklistConfirm = () => {
    if (blacklistReason) {
      onBlacklist(visitor.id)
      setBlacklistReason('')
      setBuildingWideBlacklist(false)
      setIsBlacklistModalOpen(false)
      onClose()
    }
  }

  return (
    <>
      {/* Main Modal */}
      {!isBlacklistModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-5 sm:slide-in-from-center-0 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>

            {/* Header */}
            <h2 className="text-xl font-bold text-slate-900 mb-2">Visitor Details</h2>

            {/* Visitor Info */}
            <div className="space-y-4 mb-6 mt-6">
              {/* Name & Purpose */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-1">Visitor Name</p>
                <p className="text-2xl font-bold text-slate-900">{visitor.name}</p>
                <p className="text-sm text-slate-600 mt-2">{visitor.purpose}</p>
              </div>

              {/* Gate & Flat Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-medium">Gate Time</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{visitor.gateTime}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-medium">Flat Number</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{visitor.flatNumber}</p>
                </div>
              </div>

              {/* Resident & Watchman Info */}
              <div className="space-y-2 border border-slate-200 rounded-lg p-4">
                <div>
                  <p className="text-xs text-slate-600 font-medium">For Resident</p>
                  <p className="text-sm font-semibold text-slate-900">{visitor.residentName}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-600 font-medium">Logged by Watchman</p>
                  <p className="text-sm font-semibold text-slate-900">{visitor.watchmanLogged.name}</p>
                </div>
              </div>

              {/* Photo Placeholder */}
              <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onApprove(visitor.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors active:scale-95"
              >
                ✓ Approve Visitor
              </button>
              <button
                onClick={() => onDeny(visitor.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors active:scale-95"
              >
                ✗ Deny Visitor
              </button>
              <button
                onClick={() => setIsBlacklistModalOpen(true)}
                className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-lg transition-colors active:scale-95"
              >
                ⊕ Add to Blacklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {isBlacklistModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-5 sm:slide-in-from-center-0">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Add to Blacklist?</h2>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to blacklist <span className="font-semibold">{visitor.name}</span>?
            </p>

            {/* Reason Dropdown */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-700 mb-2 block">
                Reason for Blacklist *
              </label>
              <select
                value={blacklistReason}
                onChange={e => setBlacklistReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason...</option>
                <option value="suspicious">Suspicious behavior</option>
                <option value="harassment">Harassment</option>
                <option value="unauthorized">Unauthorized access attempt</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Building-Wide Toggle */}
            <div className="mb-6 bg-slate-50 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={buildingWideBlacklist}
                  onChange={e => setBuildingWideBlacklist(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-900 font-medium">Add to building-wide blacklist</span>
              </label>
              <p className="text-xs text-slate-600 mt-2 ml-7">
                Other units will be notified of this blacklist entry
              </p>
            </div>

            {/* Alert */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-red-700 font-medium">
                ⚠️ This action will mark the visitor as blacklisted{buildingWideBlacklist ? ' across the building' : ' for your unit'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsBlacklistModalOpen(false)
                  setBlacklistReason('')
                  setBuildingWideBlacklist(false)
                }}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlacklistConfirm}
                disabled={!blacklistReason}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Confirm Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
