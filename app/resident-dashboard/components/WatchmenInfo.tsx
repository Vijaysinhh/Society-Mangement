'use client'

import { useState } from 'react'
import { User, Clock, AlertOctagon, Zap, MapPin, Phone, Calendar } from 'lucide-react'

interface Watchman {
  id: string
  name: string
  shift: string
  phone: string
  status: 'on-duty' | 'off-duty'
  shiftStart: string
  shiftEnd: string
  area: string
}

interface Incident {
  id: string
  type: string
  description: string
  date: string
  reportedBy: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'investigating' | 'resolved'
  location: string
}

const mockWatchmen: Watchman[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    shift: 'Morning',
    phone: '+91 98765 43210',
    status: 'on-duty',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    area: 'Gate & Parking',
  },
  {
    id: '2',
    name: 'Ramesh Singh',
    shift: 'Evening',
    phone: '+91 97654 32109',
    status: 'off-duty',
    shiftStart: '02:00 PM',
    shiftEnd: '10:00 PM',
    area: 'Main Gate & Lobby',
  },
]

const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'Security',
    description: 'Suspicious person spotted near gate',
    date: '2024-03-21',
    reportedBy: 'Watchman Rajesh',
    severity: 'high',
    status: 'resolved',
    location: 'Main Gate',
  },
  {
    id: '2',
    type: 'Maintenance',
    description: 'Water leakage in common area',
    date: '2024-03-20',
    reportedBy: 'Watchman Ramesh',
    severity: 'medium',
    status: 'investigating',
    location: 'Staircase B',
  },
  {
    id: '3',
    type: 'Theft',
    description: 'Bike missing from parking area',
    date: '2024-03-19',
    reportedBy: 'Watchman Rajesh',
    severity: 'high',
    status: 'open',
    location: 'Parking Lot',
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-red-100 text-red-700'
    case 'investigating':
      return 'bg-amber-100 text-amber-700'
    case 'resolved':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

// export default function WatchmenInfo() {
  const [watchmen] = useState(mockWatchmen)
  const [incidents] = useState(mockIncidents)
  const [activeTab, setActiveTab] = useState<'watchmen' | 'incidents'>('watchmen')

  const onDutyWatchmen = watchmen.filter((w) => w.status === 'on-duty')
  const openIncidents = incidents.filter((i) => i.status !== 'resolved')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Watchmen & Incidents</h2>
        <p className="text-slate-600">View current duty and reported incidents</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 bg-white rounded-lg overflow-hidden">
        {[
          { id: 'watchmen', label: 'Watchmen', count: onDutyWatchmen.length },
          { id: 'incidents', label: 'Incidents', count: openIncidents.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-slate-200">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Watchmen Tab */}
      {activeTab === 'watchmen' && (
        <div className="space-y-3">
          {/* On Duty Alert */}
          {onDutyWatchmen.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">On Duty Now</p>
                  <p className="text-sm text-green-700 mt-1">
                    {onDutyWatchmen.length} watchman on duty. Available for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Watchmen List */}
          {watchmen.map((watchman) => (
            <div
              key={watchman.id}
              className={`bg-white rounded-lg border p-4 sm:p-5 ${
                watchman.status === 'on-duty'
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{watchman.name}</p>
                  <p className="text-sm text-slate-600">{watchman.shift} Shift</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    watchman.status === 'on-duty'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {watchman.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  {watchman.shiftStart} - {watchman.shiftEnd}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {watchman.area}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  {watchman.phone}
                </div>
              </div>

              {watchman.status === 'on-duty' && (
                <button className="w-full mt-4 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                  Contact Watchman
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-3">
          {/* Active Incidents Alert */}
          {openIncidents.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">Active Incidents</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {openIncidents.length} incident(s) require attention.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Incidents List */}
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`bg-white rounded-lg border p-4 sm:p-5 ${
                incident.status === 'resolved' ? 'border-slate-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{incident.type}</p>
                  <p className="text-sm text-slate-600 mt-1">{incident.description}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                      incident.severity
                    )}`}
                  >
                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Severity
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {incident.date}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {incident.location}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  Reported by: {incident.reportedBy}
                </div>
              </div>
            </div>
          ))}

          {incidents.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No incidents reported</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
