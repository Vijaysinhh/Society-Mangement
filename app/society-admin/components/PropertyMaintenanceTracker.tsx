'use client'

import React, { useState } from 'react'
import { Search, Filter, AlertCircle, CheckCircle, Clock, Wrench, ChevronDown, ChevronUp, Home, Plus, X } from 'lucide-react'

interface MaintenanceTicket {
  id: string
  propertyId: string
  unitNumber: string
  category: 'plumbing' | 'electrical' | 'carpentry' | 'landscaping' | 'common-area' | 'other'
  description: string
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  reportedBy?: string
  reportedDate: string
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
  completionDate?: string
}

interface PropertyMaintenanceTrackerProps {
  societyId: string
}

export default function PropertyMaintenanceTracker({ societyId }: PropertyMaintenanceTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['pending', 'in-progress', 'resolved', 'closed'])
  const [selectedPriority, setSelectedPriority] = useState<string[]>(['low', 'medium', 'high'])

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    // Property A-101
    { id: 't1', propertyId: '1', unitNumber: 'A-101', category: 'plumbing', description: 'Tap leakage in kitchen', status: 'resolved', priority: 'medium', reportedBy: 'Rajesh Kumar', reportedDate: '22 May 2024', assignedTo: 'Plumber Ram', actualCost: 800, completionDate: '24 May 2024' },
    { id: 't2', propertyId: '1', unitNumber: 'A-101', category: 'electrical', description: 'Bedroom switch not working', status: 'pending', priority: 'low', reportedBy: 'Priya Sharma', reportedDate: '25 May 2024', estimatedCost: 500 },

    // Property A-102
    { id: 't3', propertyId: '2', unitNumber: 'A-102', category: 'carpentry', description: 'Door hinge broken', status: 'in-progress', priority: 'high', reportedBy: 'Amit Patel', reportedDate: '20 May 2024', assignedTo: 'Carpenter Rajesh', estimatedCost: 1200 },
    { id: 't4', propertyId: '2', unitNumber: 'A-102', category: 'other', description: 'Paint touch-up needed', status: 'pending', priority: 'low', reportedBy: 'Amit Patel', reportedDate: '23 May 2024', estimatedCost: 2000 },

    // Property B-201
    { id: 't5', propertyId: '3', unitNumber: 'B-201', category: 'plumbing', description: 'Bathroom shower head replacement', status: 'resolved', priority: 'medium', reportedBy: 'Vikram Singh', reportedDate: '18 May 2024', assignedTo: 'Plumber Ram', actualCost: 1500, completionDate: '21 May 2024' },
    { id: 't6', propertyId: '3', unitNumber: 'B-201', category: 'landscaping', description: 'Balcony garden maintenance', status: 'pending', priority: 'low', reportedBy: 'Suresh Iyer', reportedDate: '24 May 2024', estimatedCost: 3000 },

    // Property B-202
    { id: 't7', propertyId: '4', unitNumber: 'B-202', category: 'electrical', description: 'Main distribution box repair', status: 'in-progress', priority: 'high', reportedBy: 'Neha Verma', reportedDate: '19 May 2024', assignedTo: 'Electrician Vikram', estimatedCost: 5000 },

    // Property C-301
    { id: 't8', propertyId: '5', unitNumber: 'C-301', category: 'common-area', description: 'Staircase light installation', status: 'resolved', priority: 'medium', reportedBy: 'Vikram Singh', reportedDate: '15 May 2024', assignedTo: 'Electrician Vikram', actualCost: 2200, completionDate: '18 May 2024' },
  ])

  const properties = [
    { id: '1', unitNumber: 'A-101', floor: 1, owner: 'Rajesh Kumar' },
    { id: '2', unitNumber: 'A-102', floor: 1, owner: 'Amit Patel' },
    { id: '3', unitNumber: 'B-201', floor: 2, owner: 'Suresh Iyer' },
    { id: '4', unitNumber: 'B-202', floor: 2, owner: 'Neha Verma' },
    { id: '5', unitNumber: 'C-301', floor: 3, owner: 'Vikram Singh' },
  ]

  const getPropertyTickets = (pid: string) => {
    return tickets.filter(t => t.propertyId === pid)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing':
        return '🚰'
      case 'electrical':
        return '⚡'
      case 'carpentry':
        return '🪵'
      case 'landscaping':
        return '🌿'
      case 'common-area':
        return '🏢'
      default:
        return '🔧'
    }
  }

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      case 'resolved':
        return 'bg-green-100 text-green-700'
      case 'closed':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Wrench className="w-4 h-4 text-slate-600" />
    }
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) || p.owner.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    highPriority: tickets.filter(t => t.priority === 'high').length,
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Stats */}
      <div className="bg-white border-b border-slate-200 p-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Maintenance by Property</h2>

        <div className="grid grid-cols-5 gap-2">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-purple-700">{stats.total}</p>
            <p className="text-xs text-purple-600 font-semibold">Total</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-orange-700">{stats.pending}</p>
            <p className="text-xs text-orange-600 font-semibold">Pending</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-blue-700">{stats.inProgress}</p>
            <p className="text-xs text-blue-600 font-semibold">In Progress</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-green-700">{stats.resolved}</p>
            <p className="text-xs text-green-600 font-semibold">Resolved</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-red-700">{stats.highPriority}</p>
            <p className="text-xs text-red-600 font-semibold">High Priority</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFiltersModal(true)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
          >
            <Filter className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {filteredProperties.map((property) => {
          const propertyTickets = getPropertyTickets(property.id)
          const isExpanded = expandedPropertyId === property.id
          const pendingCount = propertyTickets.filter(t => t.status === 'pending').length
          const inProgressCount = propertyTickets.filter(t => t.status === 'in-progress').length
          const highPriorityCount = propertyTickets.filter(t => t.priority === 'high').length

          return (
            <div key={property.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Property Header */}
              <div
                onClick={() => setExpandedPropertyId(isExpanded ? null : property.id)}
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-slate-900">{property.unitNumber}</h3>
                      <span className="text-xs font-semibold text-slate-500">Floor {property.floor}</span>
                    </div>
                    <p className="text-sm text-slate-600">Owner: {property.owner}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{propertyTickets.length} tickets</p>
                      {highPriorityCount > 0 && (
                        <p className="text-xs text-red-600 font-semibold">{highPriorityCount} high priority</p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-2 mt-3">
                  {pendingCount > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                      {pendingCount} Pending
                    </span>
                  )}
                  {inProgressCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                      {inProgressCount} In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Tickets */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2">
                  {propertyTickets.length > 0 ? (
                    propertyTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-white rounded-lg p-3 border border-slate-100 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-slate-900">{ticket.description}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-slate-600">
                              <p><span className="font-semibold">Category:</span> {getCategoryLabel(ticket.category)}</p>
                              {ticket.reportedBy && <p><span className="font-semibold">Reported by:</span> {ticket.reportedBy}</p>}
                              <p><span className="font-semibold">Date:</span> {ticket.reportedDate}</p>
                              {ticket.assignedTo && <p><span className="font-semibold">Assigned to:</span> {ticket.assignedTo}</p>}
                              {ticket.completionDate && <p><span className="font-semibold">Completed:</span> {ticket.completionDate}</p>}
                            </div>
                          </div>

                          {/* Cost Info */}
                          <div className="text-right">
                            {ticket.estimatedCost && (
                              <p className="text-xs text-slate-600">Est: <span className="font-semibold">₹{ticket.estimatedCost.toLocaleString()}</span></p>
                            )}
                            {ticket.actualCost && (
                              <p className="text-xs text-slate-900 font-semibold">Actual: ₹{ticket.actualCost.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">No maintenance records</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Maintenance Filters</h3>
              <button onClick={() => setShowFiltersModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Ticket Status</label>
                <div className="space-y-2">
                  {['pending', 'in-progress', 'resolved', 'closed'].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300"
                        checked={selectedStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, status])
                          } else {
                            setSelectedStatus(selectedStatus.filter(s => s !== status))
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Priority</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300"
                        checked={selectedPriority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriority([...selectedPriority, priority])
                          } else {
                            setSelectedPriority(selectedPriority.filter(p => p !== priority))
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedStatus(['pending', 'in-progress', 'resolved', 'closed'])
                    setSelectedPriority(['low', 'medium', 'high'])
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
