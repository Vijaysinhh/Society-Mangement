import { useState } from 'react'
import { AlertTriangle, X, Clock, MapPin, Phone, AlertCircle } from 'lucide-react'

  id: string
  timestamp: string
  reason: string
  location: string
  watchmanName: string
  status: 'active' | 'resolved'
  responseTime?: string
}

  onClose: () => void
  onSubmit: (reason: string) => void
  t: any
}

  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason)
      setSubmitted(true)
      setTimeout(() => {
        setReason('')
        setSubmitted(false)
        onClose()
      }, 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {!submitted ? (
          <>
            {/* Header */}
            <div className="bg-red-600 text-white p-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">EMERGENCY ALERT</h2>
              <p className="text-red-100 text-sm mt-1">Security Incident Detected</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs text-red-700 font-medium">
                  An alert will be sent to all supervisors and security team immediately. Please provide details about the incident.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Incident Type/Description</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select incident type...</option>
                  <option value="Unauthorized entry attempt">Unauthorized entry attempt</option>
                  <option value="Suspicious activity">Suspicious activity</option>
                  <option value="Violence or threat">Violence or threat</option>
                  <option value="Theft in progress">Theft in progress</option>
                  <option value="Medical emergency">Medical emergency</option>
                  <option value="Fire/Safety hazard">Fire/Safety hazard</option>
                  <option value="Other security issue">Other security issue</option>
                </select>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add additional details (optional)..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  SEND ALERT
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700">Alert Sent!</h3>
              <p className="text-sm text-slate-600 mt-1">Security team has been notified. Help is on the way.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

  t: any
}

  return (
    <div className="space-y-2">
      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-3 border ${
              alert.status === 'active'
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  alert.status === 'active' ? 'text-red-600' : 'text-green-600'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900">{alert.reason}</p>
                <div className="flex gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {alert.location}
                  </span>
                </div>
                {alert.responseTime && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    Resolved at {alert.responseTime}
                  </p>
                )}
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                  alert.status === 'active'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-green-200 text-green-800'
                }`}
              >
                {alert.status === 'active' ? 'ACTIVE' : 'RESOLVED'}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-slate-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">No emergency alerts</p>
        </div>
      )}
    </div>
  )
}
