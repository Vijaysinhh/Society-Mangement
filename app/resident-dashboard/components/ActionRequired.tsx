'use client'

import { AlertCircle, DollarSign, Clock, X } from 'lucide-react'
import { useState } from 'react'

interface ActionItem {
  id: string
  type: 'visitor' | 'bill' | 'issue'
  title: string
  description: string
  urgency: 'critical' | 'high' | 'medium'
  actionButtons: { label: string; onClick: () => void; variant: 'primary' | 'danger' }[]
  timer?: number
  onDismiss?: () => void
}

// export default function ActionRequired({ items }: { items: ActionItem[] }) {
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set())

  if (items.length === 0) {
    return null
  }

  const visibleItems = items.filter(item => !dismissedItems.has(item.id))

  if (visibleItems.length === 0) {
    return null
  }

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-50 border-2 border-red-300'
      case 'high':
        return 'bg-orange-50 border-2 border-orange-300'
      case 'medium':
        return 'bg-yellow-50 border border-yellow-200'
      default:
        return 'bg-slate-50 border border-slate-200'
    }
  }

  const getUrgencyIcon = (urgency: string, type: string) => {
    if (urgency === 'critical') return '🚨'
    if (type === 'bill') return '💰'
    if (type === 'issue') return '🔧'
    return '⚡'
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'NEEDS YOUR ATTENTION NOW'
      case 'high':
        return 'IMPORTANT'
      case 'medium':
        return 'REMINDER'
      default:
        return 'NOTICE'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Action Required</h3>
        {visibleItems.length > 0 && (
          <span className="ml-auto text-xs font-medium text-slate-600">
            {visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {visibleItems.slice(0, 3).map((item) => (
        <div
          key={item.id}
          className={`rounded-lg p-4 relative ${getUrgencyStyles(item.urgency)}`}
        >
          {/* Close button */}
          {item.onDismiss && (
            <button
              onClick={() => {
                setDismissedItems(new Set([...dismissedItems, item.id]))
                item.onDismiss?.()
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-start gap-3 mb-3 pr-6">
            <span className="text-2xl flex-shrink-0">{getUrgencyIcon(item.urgency, item.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                {getUrgencyLabel(item.urgency)}
              </p>
              <p className="font-semibold text-slate-900 mt-1">{item.title}</p>
              <p className="text-sm text-slate-700 mt-1">{item.description}</p>
              
              {item.timer !== undefined && (
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className={item.timer < 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'}>
                    {item.timer} seconds remaining
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {item.actionButtons.length > 0 && (
            <div className={`flex gap-2 ${item.actionButtons.length > 2 ? 'flex-col' : ''}`}>
              {item.actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`flex-1 px-4 py-2 font-semibold rounded-lg transition-colors text-sm ${
                    btn.variant === 'primary'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {visibleItems.length > 3 && (
        <p className="text-xs text-slate-600 text-center">
          +{visibleItems.length - 3} more in notification center
        </p>
      )}
    </div>
  )
}
