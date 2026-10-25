'use client'

import { useState, useEffect } from 'react'
import { MaintenanceTicket } from '@/types'
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Edit2, X } from 'lucide-react'

interface MaintenanceTabProps {
  societyId: string
}

interface FormDataType {
  category: 'plumbing' | 'electrical' | 'carpentry' | 'landscaping' | 'common-area' | 'other'
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedDays: number
}

export default function MaintenanceTab({ societyId }: MaintenanceTabProps) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all')
  const [formData, setFormData] = useState<FormDataType>({
    category: 'plumbing',
    description: '',
    priority: 'medium',
    estimatedDays: 1,
  })

  useEffect(() => {
    let storedTickets = JSON.parse(localStorage.getItem('maintenance-tickets') || '[]')
    storedTickets = storedTickets.filter((t: MaintenanceTicket) => t.societyId === societyId)

    if (storedTickets.length === 0) {
      const mockTickets: MaintenanceTicket[] = [
        {
          id: 'mt-001',
          societyId,
          category: 'plumbing',
          description: 'Leaking tap in common area bathroom',
          status: 'resolved',
          priority: 'medium',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          estimatedDays: 1,
        },
        {
          id: 'mt-002',
          societyId,
          category: 'electrical',
          description: 'Common area lights not working',
          status: 'in-progress',
          priority: 'high',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          assignedTo: 'Electrician Team',
          estimatedDays: 1,
        },
        {
          id: 'mt-003',
          societyId,
          category: 'landscaping',
          description: 'Garden maintenance and pruning',
          status: 'pending',
          priority: 'low',
          createdAt: new Date(),
          updatedAt: new Date(),
          estimatedDays: 3,
        },
      ]
      localStorage.setItem('maintenance-tickets', JSON.stringify(mockTickets))
      setTickets(mockTickets)
    } else {
      setTickets(storedTickets)
    }
  }, [societyId])

  const handleSaveTicket = () => {
    if (!formData.description) return

    const allTickets = JSON.parse(localStorage.getItem('maintenance-tickets') || '[]')

    if (editingId) {
      const updated = tickets.map((t) =>
        t.id === editingId
          ? {
              ...t,
              category: formData.category,
              description: formData.description,
              priority: formData.priority,
              estimatedDays: formData.estimatedDays,
              updatedAt: new Date(),
            }
          : t
      )
      setTickets(updated)

      const updatedAll = allTickets.map((t: MaintenanceTicket) =>
        t.id === editingId
          ? {
              ...t,
              category: formData.category,
              description: formData.description,
              priority: formData.priority,
              estimatedDays: formData.estimatedDays,
              updatedAt: new Date(),
            }
          : t
      )
      localStorage.setItem('maintenance-tickets', JSON.stringify(updatedAll))
      setEditingId(null)
    } else {
      const newTicket: MaintenanceTicket = {
        id: `mt-${Date.now()}`,
        societyId,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDays: formData.estimatedDays,
      }

      const updated = [newTicket, ...tickets]
      setTickets(updated)
      localStorage.setItem('maintenance-tickets', JSON.stringify([newTicket, ...allTickets]))
    }

    setFormData({
      category: 'plumbing',
      description: '',
      priority: 'medium',
      estimatedDays: 1,
    })
    setShowForm(false)
  }

  const handleEditTicket = (ticket: MaintenanceTicket) => {
    setFormData({
      category: ticket.category,
      description: ticket.description,
      priority: ticket.priority,
      estimatedDays: ticket.estimatedDays || 1,
    })
    setEditingId(ticket.id)
    setShowForm(true)
  }

  const handleDeleteTicket = (id: string) => {
    const updated = tickets.filter((t) => t.id !== id)
    setTickets(updated)

    const allTickets = JSON.parse(localStorage.getItem('maintenance-tickets') || '[]')
    const filtered = allTickets.filter((t: MaintenanceTicket) => t.id !== id)
    localStorage.setItem('maintenance-tickets', JSON.stringify(filtered))
    setDeleteConfirm(null)
  }

  const handleUpdateStatus = (id: string, newStatus: MaintenanceTicket['status']) => {
    const updated = tickets.map((t) =>
      t.id === id
        ? {
            ...t,
            status: newStatus,
            updatedAt: new Date(),
            resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
          }
        : t
    )
    setTickets(updated)

    const allTickets = JSON.parse(localStorage.getItem('maintenance-tickets') || '[]')
    const mapped = allTickets.map((t: MaintenanceTicket) =>
      t.id === id
        ? {
            ...t,
            status: newStatus,
            updatedAt: new Date(),
            resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
          }
        : t
    )
    localStorage.setItem('maintenance-tickets', JSON.stringify(mapped))
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      category: 'plumbing',
      description: '',
      priority: 'medium',
      estimatedDays: 1,
    })
  }

  const filteredTickets =
    filterStatus === 'all' ? tickets : tickets.filter((t) => t.status === filterStatus)

  const stats = {
    pending: tickets.filter((t) => t.status === 'pending').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }

  const priorityColor = {
    low: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    high: 'bg-red-100 text-red-800 border border-red-200',
  }

  const statusIcon = {
    pending: Clock,
    'in-progress': AlertCircle,
    resolved: CheckCircle2,
    closed: CheckCircle2,
  }

  const statusColor = {
    pending: 'text-orange-600',
    'in-progress': 'text-indigo-600',
    resolved: 'text-green-600',
    closed: 'text-slate-600',
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-5 text-center hover:border-slate-300 transition-colors">
          <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-xs text-slate-600 mt-1 sm:mt-2 uppercase font-semibold">Pending</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-5 text-center hover:border-slate-300 transition-colors">
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.inProgress}</p>
          <p className="text-xs text-slate-600 mt-1 sm:mt-2 uppercase font-semibold">In Progress</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-5 text-center hover:border-slate-300 transition-colors">
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-xs text-slate-600 mt-1 sm:mt-2 uppercase font-semibold">Resolved</p>
        </div>
      </div>

      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Maintenance Tickets</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Track and manage maintenance requests</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              {editingId ? 'Edit Maintenance Ticket' : 'Create New Ticket'}
            </h3>
            <button onClick={handleCancel} className="p-1 hover:bg-slate-100 rounded transition-colors">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="landscaping">Landscaping</option>
                <option value="common-area">Common Area</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Description</label>
              <textarea
                placeholder="Describe the maintenance issue"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">
                  Estimated Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.estimatedDays}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleSaveTicket}
              disabled={!formData.description}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-200 text-slate-900 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 sm:gap-2 flex-wrap overflow-x-auto pb-2">
        {['all', 'pending', 'in-progress', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              filterStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all'
              ? 'All'
              : status === 'in-progress'
              ? 'In Progress'
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-12 text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-slate-600 font-medium text-sm sm:text-base">No maintenance tickets found</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Create a ticket to get started</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredTickets.map((ticket) => {
            const StatusIcon = statusIcon[ticket.status]
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 flex-shrink-0 ${statusColor[ticket.status]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {ticket.category.replace('-', ' ').charAt(0).toUpperCase() +
                          ticket.category.replace('-', ' ').slice(1)}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          priorityColor[ticket.priority]
                        }`}
                      >
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 break-words">{ticket.description}</p>
                    
                    {/* Assignment and SLA */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="bg-slate-50 p-1.5 sm:p-2 rounded">
                        <p className="text-slate-600">Assigned to</p>
                        <p className="text-slate-900 font-medium">Electrician - Ramesh</p>
                      </div>
                      <div className="bg-orange-50 p-1.5 sm:p-2 rounded">
                        <p className="text-slate-600">SLA Timer</p>
                        <p className="text-orange-700 font-medium">{ticket.estimatedDays} day(s) left</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditTicket(ticket)}
                      className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Edit ticket"
                    >
                      <Edit2 className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ticket.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Status Buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 flex-wrap">
                  {ticket.status !== 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'pending')}
                      className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors font-medium"
                    >
                      Mark Pending
                    </button>
                  )}
                  {ticket.status !== 'in-progress' && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'in-progress')}
                      className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors font-medium"
                    >
                      In Progress
                    </button>
                  )}
                  {ticket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                      className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors font-medium"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Ticket?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete this maintenance ticket? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTicket(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
