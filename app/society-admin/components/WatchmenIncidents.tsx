'use client'

import { useState, useEffect } from 'react'
import { AlertOctagon, Search, CheckCircle2 } from 'lucide-react'
import { dataStore } from '@/lib/centralDataStore'
import type { Incident } from '@/lib/centralDataStore'
import { toast } from 'sonner'

interface IncidentEntry {
  id: string
  watchmanName: string
  date: string
  time: string
  type: string
  description: string
  severity: 'high' | 'medium' | 'low'
  status: 'resolved' | 'open' | 'pending'
  location: string
}

interface WatchmenIncidentsProps {
  societyId: string
}

export default function WatchmenIncidents({ societyId }: WatchmenIncidentsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [incidents, setIncidents] = useState<IncidentEntry[]>([])

  useEffect(() => {
    // Load real incidents from dataStore
    const mappedIncidents: IncidentEntry[] = allIncidents.map(incident => ({
      id: incident.id,
      watchmanName: incident.reportedBy || 'Unknown Watchman',
      date: new Date(incident.timestamp).toLocaleDateString(),
      time: new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: incident.type.charAt(0).toUpperCase() + incident.type.slice(1),
      description: incident.description,
      severity: (incident.severity || 'medium') as 'high' | 'medium' | 'low',
      status: (incident.status || 'open') as 'resolved' | 'open' | 'pending',
      location: incident.location || 'Unknown Location',
    }))
    setIncidents(mappedIncidents)

    // Subscribe to incident events for real-time updates
      const mappedIncident: IncidentEntry = {
        id: newIncident.id,
        watchmanName: newIncident.reportedBy || 'Unknown Watchman',
        date: new Date(newIncident.timestamp).toLocaleDateString(),
        time: new Date(newIncident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: newIncident.type.charAt(0).toUpperCase() + newIncident.type.slice(1),
        description: newIncident.description,
        severity: (newIncident.severity || 'medium') as 'high' | 'medium' | 'low',
        status: (newIncident.status || 'open') as 'resolved' | 'open' | 'pending',
        location: newIncident.location || 'Unknown Location',
      }
      setIncidents(prev => [mappedIncident, ...prev])
    })

      setIncidents(prev => prev.map(i => i.id === ackIncident.id ? { ...i, status: 'pending' } : i))
    })

    return () => {
      unsubAdd()
      unsubAck()
    }
  }, [societyId])

  // Filter incidents based on search and severity
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.watchmanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity
    return matchesSearch && matchesSeverity
  })

  // Handle acknowledge incident action
  const handleAcknowledge = (incidentId: string) => {
    toast.success('Incident acknowledged and status updated to pending')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50 border-green-200'
      case 'open':
        return 'bg-red-50 border-red-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search watchman, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === severity
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid gap-4">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <div key={incident.id} className={`rounded-lg border p-4 ${getStatusColor(incident.status)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-slate-900">{incident.type}</h4>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{incident.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {incident.watchmanName}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {incident.date} at {incident.time}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {incident.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(incident.status)}`}>
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </span>
                  {incident.status === 'open' && (
                    <button
                      onClick={() => handleAcknowledge(incident.id)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <AlertOctagon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No incidents found</p>
          </div>
        )}
      </div>
    </div>
  )
}
