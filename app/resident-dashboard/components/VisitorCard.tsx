'use client'

import { useState, useEffect } from 'react'
import { Clock, Phone, MapPin, Users, CheckCircle2, XCircle } from 'lucide-react'

interface VisitorCardProps {
  id: string
  name: string
  phone: string
  purpose: string
  vehicle?: { number: string; color: string }
  people: number
  arrival: string
  timeRemaining?: number // in seconds
  isRecurring?: boolean
  isVerified?: boolean
  status: 'pending' | 'approved' | 'rejected' | 'at-gate'
  onApprove: () => void
  onDeny: () => void
  photo?: string | null
}

export default function VisitorCard({
  id,
  name,
  phone,
  purpose,
  vehicle,
  people,
  arrival,
  timeRemaining = 180,
  isRecurring = false,
  isVerified = false,
  status,
  onApprove,
  onDeny,
  photo,
}: VisitorCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining)
  const [isHeld, setIsHeld] = useState(false)

  useEffect(() => {
    if (status !== 'at-gate' || secondsLeft <= 0 || isHeld) return

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Auto-deny logic would go here
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, secondsLeft, isHeld])

  const getUrgencyColor = () => {
    if (secondsLeft < 10) return 'text-red-600'
    if (secondsLeft < 30) return 'text-orange-600'
    return 'text-green-600'
  }

  const getUrgencyBgColor = () => {
    if (secondsLeft < 10) return 'bg-red-50 border-red-300'
    if (secondsLeft < 30) return 'bg-orange-50 border-orange-300'
    return 'bg-white border-slate-200'
  }

  const getTimerRingColor = () => {
    if (secondsLeft < 10) return 'stroke-red-500'
    if (secondsLeft < 30) return 'stroke-orange-500'
    return 'stroke-green-500'
  }

  const progress = (secondsLeft / timeRemaining) * 100

  if (status === 'approved') {
    return (
      <div className="bg-green-50 rounded-lg border border-green-200 p-4 flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-600 mt-1">{purpose}</p>
          <p className="text-xs text-green-600 font-semibold mt-2">Approved</p>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4 flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-600 mt-1">{purpose}</p>
          <p className="text-xs text-red-600 font-semibold mt-2">Denied</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-colors ${
        status === 'at-gate' ? getUrgencyBgColor() : 'bg-white border-slate-200'
      }`}
    >
      {/* Header with Timer */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-slate-900">{name}</p>
            {isRecurring && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                Recurring
              </span>
            )}
            {isVerified && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{purpose}</p>
        </div>

        {status === 'at-gate' && (
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            {/* Circular Timer with SVG */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-200"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${(progress / 100) * 282.7} 282.7`}
                  className={`transition-all ${getTimerRingColor()}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-xl font-bold ${getUrgencyColor()}`}>{secondsLeft}</p>
                  <p className="text-xs text-slate-600">sec</p>
                </div>
              </div>
            </div>
            {secondsLeft < 10 && (
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone className="w-4 h-4 text-slate-400" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{people} person{people !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Arrived: {arrival}</span>
        </div>
        {vehicle && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              {vehicle.color} • {vehicle.number}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {status === 'at-gate' ? (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Entry
          </button>
          <button
            onClick={() => setIsHeld(!isHeld)}
            className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-colors text-sm ${
              isHeld
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isHeld ? 'Resume Timer' : 'Hold • Verify'}
          </button>
          <button
            onClick={onDeny}
            className="flex-1 px-4 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Deny
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Review
          </button>
        </div>
      )}

      {/* Trust Signal */}
      {isRecurring && status === 'pending' && (
        <p className="text-xs text-slate-600 mt-3 italic">
          This is a returning visitor. Consider quick approval.
        </p>
      )}
    </div>
  )
}
