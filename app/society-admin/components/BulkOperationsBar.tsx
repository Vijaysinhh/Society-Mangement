import React from 'react'
import { Trash2, Check, Download, ChevronDown, Loader } from 'lucide-react'
import { useFinancial } from '@/contexts/FinancialContext'

export function BulkOperationsBar() {
  const { bulkState, clearSelection, bulkDelete, bulkMarkAsPaid, bulkExport } = useFinancial()
  const selectedCount = bulkState.selectedIds.size
  const isActive = selectedCount > 0

  if (!isActive) return null

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-2xl p-4 sm:p-5 z-40">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/20 rounded-lg">
            <span className="text-white font-bold text-lg">{selectedCount}</span>
            <span className="text-white/90 text-sm ml-2">selected</span>
          </div>
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 text-white/90 hover:text-white font-medium text-sm transition-colors hover:underline"
          >
            Clear
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={bulkMarkAsPaid}
            disabled={bulkState.actionInProgress}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
          >
            {bulkState.actionInProgress ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Mark as Paid
              </>
            )}
          </button>

          <button
            onClick={bulkExport}
            disabled={bulkState.actionInProgress}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={bulkDelete}
            disabled={bulkState.actionInProgress}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
          >
            {bulkState.actionInProgress ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
