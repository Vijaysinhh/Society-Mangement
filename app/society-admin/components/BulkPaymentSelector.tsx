'use client'

import { useState } from 'react'
import { Check, X, Plus, AlertCircle } from 'lucide-react'
import { recordMaintenancePayment, addOrUpdateMaintenanceFee } from '../lib/maintenanceFeeManager'

interface Unit {
  id: string
  unitId?: string
  unitNumber?: string
  owner?: string
  ownerName?: string
}

interface MaintenanceFee {
  id: string
  month?: string
  unitId?: string
}

interface BulkPaymentSelectorProps {
  allUnits?: Unit[]
  allMaintenanceFees?: MaintenanceFee[]
  onClose: () => void
}

export default function BulkPaymentSelector({ allUnits = [], allMaintenanceFees = [], onClose }: BulkPaymentSelectorProps) {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [bulkAmount, setBulkAmount] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Safely get units array
  const units = allUnits || []

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnits(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([])
    } else {
      setSelectedUnits(units.map(u => u.id))
    }
  }

  const handleApplyBulkPayment = async () => {
    if (!bulkAmount || selectedUnits.length === 0) {
      alert('Please select units and enter an amount')
      return
    }

    setIsProcessing(true)
    const amount = parseFloat(bulkAmount)
    let successCount = 0

    selectedUnits.forEach(unitId => {
      const unitFees = (allMaintenanceFees || []).filter(f => f.unitId === unitId)
      const currentMonth = new Date().toISOString().slice(0, 7)
      const currentFee = unitFees.find(f => f.month === currentMonth)

      if (currentFee) {
        const updatedFee = recordMaintenancePayment(currentFee, amount, 'partial', bulkNotes)
        addOrUpdateMaintenanceFee(updatedFee)
        successCount++
      }
    })

    setSuccess(true)
    console.log(`[v0] Bulk payment recorded for ${successCount} units`)
    setTimeout(() => {
      setSuccess(false)
      setBulkAmount('')
      setBulkNotes('')
      setSelectedUnits([])
      setIsProcessing(false)
      onClose?.()
    }, 2000)
  }

  // Show empty state if no units
  if (!units || units.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-slate-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">No units available for bulk payment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Bulk Payment Recording
      </h3>

      {/* Unit Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-900">Select Units</label>
          <button
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {selectedUnits.length === units.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {units.map(unit => (
            <label key={unit.id} className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-blue-50">
              <input
                type="checkbox"
                checked={selectedUnits.includes(unit.id)}
                onChange={() => handleSelectUnit(unit.id)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">{unit.unitNumber}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-900 mb-2">Payment Amount (₹)</label>
        <input
          type="number"
          value={bulkAmount}
          onChange={(e) => setBulkAmount(e.target.value)}
          placeholder="Enter amount to collect from each unit"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-900 mb-2">Notes (Optional)</label>
        <textarea
          value={bulkNotes}
          onChange={(e) => setBulkNotes(e.target.value)}
          placeholder="Add notes for this bulk payment..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
        />
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-slate-600 mb-1">Payment Summary</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-slate-600">Units Selected:</p>
            <p className="font-semibold text-slate-900">{selectedUnits.length}</p>
          </div>
          <div>
            <p className="text-slate-600">Total Collection:</p>
            <p className="font-semibold text-green-600">₹{(parseFloat(bulkAmount || 0) * selectedUnits.length).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyBulkPayment}
          disabled={isProcessing || selectedUnits.length === 0 || !bulkAmount}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : `Apply to ${selectedUnits.length} Units`}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-300"
        >
          Cancel
        </button>
      </div>

      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Payments recorded successfully!</p>
        </div>
      )}
    </div>
  )
}
