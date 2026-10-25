import React from 'react'
import { Edit, Trash2, Eye, ChevronRight, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Transaction } from '@/contexts/FinancialContext'

interface TransactionCardProps {
  transaction: Transaction
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export function TransactionMobileCard({
  transaction,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}: TransactionCardProps) {
  const typeIcon = {
    payment: <DollarSign className="w-5 h-5" />,
    expense: <TrendingDown className="w-5 h-5" />,
    adjustment: <TrendingUp className="w-5 h-5" />,
  }

  const typeColor = {
    payment: 'text-green-600 bg-green-50',
    expense: 'text-red-600 bg-red-50',
    adjustment: 'text-blue-600 bg-blue-50',
  }

  const statusBadge = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }

  const isExpense = transaction.amount < 0

  return (
    <div
      className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer mb-3 overflow-hidden ${
        isSelected ? 'border-indigo-600 shadow-md' : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={() => onSelect(transaction.id)}
    >
      {/* Checkbox Area */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-14 flex items-center justify-center bg-slate-50 border-r border-slate-200">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(transaction.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded border-slate-300 cursor-pointer"
        />
      </div>

      {/* Content */}
      <div className="ml-12 sm:ml-14 p-4 sm:p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2.5 rounded-lg ${typeColor[transaction.type]}`}>
              {typeIcon[transaction.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                {transaction.description}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {transaction.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Amount Badge */}
          <div className={`px-3 py-1.5 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap ${
            isExpense ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {isExpense ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[transaction.status]}`}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
          {transaction.referenceNumber && (
            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Ref: {transaction.referenceNumber}
            </span>
          )}
        </div>

        {/* Action Buttons - Bottom Row */}
        <div className="flex gap-2 pt-3 border-t border-slate-200 -mx-4 sm:-mx-5 px-4 sm:px-5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(transaction.id)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(transaction.id)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors active:scale-95"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(transaction.id)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* Desktop Table Row Component */
export function TransactionTableRow({
  transaction,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const statusColor = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }

  const typeLabel = {
    payment: 'Payment',
    expense: 'Expense',
    adjustment: 'Adjustment',
  }

  const isExpense = transaction.amount < 0

  return (
    <tr className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
      isSelected ? 'bg-indigo-50' : ''
    }`}>
      <td className="px-4 py-3 w-12">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(transaction.id)}
          className="w-5 h-5 rounded border-slate-300 cursor-pointer"
        />
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="font-medium text-slate-900">{transaction.description}</div>
        <div className="text-xs text-slate-600">{transaction.referenceNumber}</div>
      </td>
      <td className="px-4 py-3 text-sm">
        {transaction.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          transaction.type === 'payment' ? 'bg-green-100 text-green-700' :
          transaction.type === 'expense' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {typeLabel[transaction.type]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold">
        <span className={isExpense ? 'text-red-600' : 'text-green-600'}>
          {isExpense ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[transaction.status]}`}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onEdit(transaction.id)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
