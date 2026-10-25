'use client'

import { ReactNode } from 'react'

type StatusType = 'pending' | 'approved' | 'rejected' | 'paid' | 'unpaid' | 'overdue' | 'in-progress' | 'completed' | 'awaiting-payment' | 'cancelled'

interface StatusLabelProps {
  status: StatusType | string // Allow any string as fallback
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  icon?: ReactNode
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string; emoji: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', emoji: '⏳' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', emoji: '✓' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', emoji: '✗' },
  paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid', emoji: '✓' },
  unpaid: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unpaid', emoji: '⚠' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue', emoji: '⚡' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress', emoji: '🔄' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', emoji: '✓' },
  'awaiting-payment': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Awaiting Payment', emoji: '💳' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled', emoji: '✗' },
}

export default function StatusLabel({ status, size = 'md', showIcon = true }: StatusLabelProps) {
  const config = statusConfig[status as StatusType] || statusConfig.pending // Fallback to pending if status not found

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {showIcon && <span>{config.emoji}</span>}
      {config.label}
    </span>
  )
}
