'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Phone, RefreshCw, AlertTriangle } from 'lucide-react'

interface OfflineModeProps {
  onRetry?: () => void
  watchmanPhone?: string
  watchmanName?: string
  lastUpdated?: Date
}

// export default function OfflineMode({
  onRetry,
  watchmanPhone = '9876543210',
  watchmanName = 'Rajesh',
  lastUpdated,
}: OfflineModeProps) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  const lastUpdatedTime = lastUpdated ? (
    <>
      {lastUpdated.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} on{' '}
      {lastUpdated.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })}
    </>
  ) : (
    'Unknown'
  )

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Offline Banner */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="inline-block p-4 bg-red-100 rounded-full">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              You&apos;re Offline
            </h2>
            <p className="text-slate-600">
              Showing last updated data from{' '}
              <span className="font-semibold">{lastUpdatedTime}</span>
            </p>
          </div>

          {/* Limited Functionality Notice */}
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold text-slate-900 text-sm">
                  Limited Functionality
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  You cannot approve/deny visitors or make payments while offline.
                </p>
              </div>
            </div>
          </div>

          {/* Critical Security Note */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Critical:</span> If someone is at the gate, contact the watchman directly.
            </p>
          </div>

          {/* Retry Button */}
          <button
            onClick={onRetry}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </button>

          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 mb-4">
              Need immediate help? Contact the watchman:
            </p>
            <a
              href={`tel:+91${watchmanPhone}`}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-2"
            >
              <Phone className="w-5 h-5" />
              Call {watchmanName} - {watchmanPhone}
            </a>
            <p className="text-xs text-slate-600 text-center">
              Available 24/7 for security issues
            </p>
          </div>

          {/* Auto-deny Recovery */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">Note:</span> If a visitor was auto-denied while you were offline, the watchman can contact them to re-allow entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
