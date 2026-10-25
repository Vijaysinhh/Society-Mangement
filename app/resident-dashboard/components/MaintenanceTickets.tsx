'use client'

import { useState } from 'react'
import { Wrench, Plus, AlertCircle, Clock, CheckCircle, Trash2, MessageSquare, Upload } from 'lucide-react'

interface Ticket {
  id: string
  title: string
  description: string
  category: 'maintenance' | 'repair' | 'cleaning' | 'plumbing' | 'electrical' | 'other'
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'assigned' | 'in-progress' | 'completed'
  createdDate: string
  assignedTo?: string
  comments: number
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Broken tap in kitchen',
    description: 'The kitchen tap is leaking water. Needs immediate repair.',
    category: 'plumbing',
    priority: 'high',
    status: 'in-progress',
    createdDate: '2024-03-20',
    assignedTo: 'Plumber Arun',
    comments: 3,
  },
  {
    id: '2',
    title: 'Light bulb replacement',
    description: 'Hallway light bulb needs to be replaced.',
    category: 'electrical',
    priority: 'low',
    status: 'assigned',
    createdDate: '2024-03-19',
    assignedTo: 'Electrician Mohan',
    comments: 1,
  },
  {
    id: '3',
    title: 'Air conditioner not cooling',
    description: 'AC in bedroom is not providing cold air despite being on.',
    category: 'repair',
    priority: 'high',
    status: 'open',
    createdDate: '2024-03-21',
    comments: 0,
  },
  {
    id: '4',
    title: 'Cleaning service required',
    description: 'General cleaning and mopping of flat required.',
    category: 'cleaning',
    priority: 'medium',
    status: 'completed',
    createdDate: '2024-03-15',
    assignedTo: 'Cleaning Staff',
    comments: 2,
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'maintenance':
      return 'bg-blue-100 text-blue-700'
    case 'repair':
      return 'bg-purple-100 text-purple-700'
    case 'cleaning':
      return 'bg-green-100 text-green-700'
    case 'plumbing':
      return 'bg-cyan-100 text-cyan-700'
    case 'electrical':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-50'
    case 'medium':
      return 'border-amber-200 bg-amber-50'
    case 'low':
      return 'border-green-200 bg-green-50'
    default:
      return 'border-slate-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open':
      return <AlertCircle className="w-4 h-4 text-red-600" />
    case 'assigned':
      return <Clock className="w-4 h-4 text-amber-600" />
    case 'in-progress':
      return <Wrench className="w-4 h-4 text-blue-600" />
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />
    default:
      return null
  }
}

// export default function MaintenanceTickets() {
  const [tickets, setTickets] = useState(mockTickets)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'maintenance' as const,
    priority: 'medium' as const,
  })

  const filteredTickets = filterStatus
    ? tickets.filter((t) => t.status === filterStatus)
    : tickets

  const handleCreateTicket = () => {
    if (newTicket.title && newTicket.description) {
      setTickets([
        ...tickets,
        {
          id: Date.now().toString(),
          ...newTicket,
          status: 'open',
          createdDate: new Date().toISOString().split('T')[0],
          comments: 0,
        },
      ])
      setShowCreateModal(false)
      setNewTicket({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
      })
    }
  }

  const openTickets = tickets.filter((t) => t.status === 'open')
  const inProgressTickets = tickets.filter((t) => t.status === 'in-progress' || t.status === 'assigned')
  const completedTickets = tickets.filter((t) => t.status === 'completed')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Maintenance Tickets</h2>
          <p className="text-slate-600">Create and track maintenance requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Ticket</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{openTickets.length}</p>
          <p className="text-xs text-red-700 mt-1">Open</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{inProgressTickets.length}</p>
          <p className="text-xs text-blue-700 mt-1">In Progress</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{completedTickets.length}</p>
          <p className="text-xs text-green-700 mt-1">Completed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: null, label: 'All', count: tickets.length },
          { id: 'open', label: 'Open', count: openTickets.length },
          { id: 'in-progress', label: 'In Progress', count: inProgressTickets.length },
          { id: 'completed', label: 'Completed', count: completedTickets.length },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setFilterStatus(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === filter.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white rounded-lg border p-4 sm:p-5 ${getPriorityColor(ticket.priority)}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                      {ticket.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{ticket.description}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : ticket.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    {getStatusIcon(ticket.status)}
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                  </span>
                  {ticket.assignedTo && (
                    <span className="ml-2">To: {ticket.assignedTo}</span>
                  )}
                  <span className="ml-2">Created: {ticket.createdDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.comments > 0 && (
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {ticket.comments}
                    </button>
                  )}
                  {ticket.status !== 'completed' && (
                    <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No tickets found</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Maintenance Ticket</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Title</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g., Leaking faucet"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
