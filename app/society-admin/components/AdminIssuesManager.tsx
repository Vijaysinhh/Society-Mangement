'use client'

import { useState } from 'react'
import { Plus, Filter, Search, AlertCircle, Wrench, Clock, CheckCircle2, X, Edit2, Send } from 'lucide-react'

interface Issue {
  id: string
  type: 'admin' | 'resident' | 'watchman'
  title: string
  description: string
  category: string
  unit?: string
  createdBy: string
  status: 'created' | 'started' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdDate: string
  updates: { date: string; message: string; status: string }[]
  affectedUnits?: string[]
}

export default function AdminIssuesManager() {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'resident' | 'watchman'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'created' | 'started' | 'in-progress' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      type: 'resident',
      title: 'AC Not Working in Bedroom',
      description: 'AC unit making noise and not cooling properly',
      category: 'HVAC',
      unit: '401',
      createdBy: 'Mr. Sharma',
      status: 'in-progress',
      priority: 'high',
      createdDate: '2026-03-25',
      updates: [
        { date: '2026-03-25', message: 'Issue reported', status: 'created' },
        { date: '2026-03-26', message: 'Technician assigned - Amit Kumar', status: 'started' },
        { date: '2026-03-27', message: 'Work in progress - Will be completed by tomorrow', status: 'in-progress' }
      ],
      affectedUnits: ['401']
    },
    {
      id: '2',
      type: 'admin',
      title: 'Common Area Renovation',
      description: 'Lobby and corridor renovation scheduled for Q2 2026',
      category: 'Structural',
      createdBy: 'Admin - Building Care',
      status: 'started',
      priority: 'medium',
      createdDate: '2026-03-20',
      updates: [
        { date: '2026-03-20', message: 'Issue created', status: 'created' },
        { date: '2026-03-21', message: 'Contractor engaged', status: 'started' }
      ],
      affectedUnits: ['All']
    },
    {
      id: '3',
      type: 'resident',
      title: 'Noise from Neighboring Unit',
      description: 'Loud music disturbing sleep between 11 PM - 2 AM',
      category: 'Neighbor Concern',
      unit: '405',
      createdBy: 'Ms. Priya',
      status: 'created',
      priority: 'medium',
      createdDate: '2026-03-27',
      updates: [
        { date: '2026-03-27', message: 'Issue reported', status: 'created' }
      ],
      affectedUnits: ['405']
    },
    {
      id: '4',
      type: 'watchman',
      title: 'Unknown Vehicle in Parking',
      description: 'Unregistered vehicle spotted near block B parking at 2:45 AM',
      category: 'Security Alert',
      createdBy: 'Watchman - Ramesh Kumar',
      status: 'in-progress',
      priority: 'high',
      createdDate: '2026-03-28',
      updates: [
        { date: '2026-03-28', message: 'Incident reported by watchman', status: 'created' },
        { date: '2026-03-28', message: 'Security team investigating', status: 'in-progress' }
      ],
      affectedUnits: ['All']
    },
    {
      id: '5',
      type: 'watchman',
      title: 'Gate Left Open During Night',
      description: 'Visitor gate found open during night hours without authorization',
      category: 'Security Concern',
      createdBy: 'Watchman - Vikram Singh',
      status: 'completed',
      priority: 'high',
      createdDate: '2026-03-27',
      updates: [
        { date: '2026-03-27', message: 'Incident reported', status: 'created' },
        { date: '2026-03-27', message: 'Gate repaired and secured', status: 'completed' }
      ],
      affectedUnits: ['All']
    }
  ])

  const filteredIssues = issues.filter(issue => {
    const matchesTab = activeTab === 'all' || issue.type === activeTab
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.unit?.includes(searchTerm)
    return matchesTab && matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-blue-100 text-blue-700'
      case 'started':
        return 'bg-amber-100 text-amber-700'
      case 'in-progress':
        return 'bg-cyan-100 text-cyan-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'medium':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <AlertCircle className="w-4 h-4" />
      case 'started':
        return <Clock className="w-4 h-4" />
      case 'in-progress':
        return <Wrench className="w-4 h-4" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleStatusUpdate = (issueId: string, newStatus: 'created' | 'started' | 'in-progress' | 'completed') => {
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: newStatus,
          updates: [...issue.updates, {
            date: new Date().toISOString().split('T')[0],
            message: updateMessage || `Status updated to ${newStatus}`,
            status: newStatus
          }]
        }
      }
      return issue
    }))
    setShowUpdateForm(false)
    setUpdateMessage('')
    setSelectedIssue(null)
  }

  const currentIssue = selectedIssue ? issues.find(i => i.id === selectedIssue) : null

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Issues & Building Care</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Create Building Care Work Order</h3>
            <button onClick={() => setShowCreateForm(false)}>
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g., Plumbing repair in common area"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              placeholder="Describe the work needed..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>HVAC</option>
                <option>Structural</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Create Work Order
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Work Orders
          </button>
          <button
            onClick={() => setActiveTab('resident')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'resident' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Resident Reports
          </button>
          <button
            onClick={() => setActiveTab('watchman')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'watchman' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Watchman Incidents
          </button>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-lg">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.map(issue => (
          <div key={issue.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    issue.type === 'admin' ? 'bg-purple-100 text-purple-700' : 
                    issue.type === 'watchman' ? 'bg-orange-100 text-orange-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {issue.type === 'admin' ? 'WORK ORDER' : issue.type === 'watchman' ? 'WATCHMAN INCIDENT' : 'RESIDENT REPORT'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(issue.status)}`}>
                    {getStatusIcon(issue.status)}
                    {issue.status.toUpperCase().replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
                    {issue.priority.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{issue.title}</h3>
                <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{issue.unit && `Unit ${issue.unit}`}</span>
                  <span>{issue.category}</span>
                  <span>Reported: {issue.createdDate}</span>
                  <span>By: {issue.createdBy}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedIssue(issue.id)
                  setShowUpdateForm(true)
                }}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Update
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Progress</span>
                <span>{['created', 'started', 'in-progress', 'completed'].indexOf(issue.status) + 1}/4</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((['created', 'started', 'in-progress', 'completed'].indexOf(issue.status) + 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Recent Updates */}
            {issue.updates.length > 0 && (
              <div className="text-xs text-slate-600 space-y-1 border-t border-slate-200 pt-2">
                <p className="font-medium">Latest Update:</p>
                <p>{issue.updates[issue.updates.length - 1].message}</p>
                <p className="text-slate-500">{issue.updates[issue.updates.length - 1].date}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {showUpdateForm && currentIssue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-900">Update Issue Status</h3>
              <button onClick={() => setShowUpdateForm(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{currentIssue.title}</p>
                <p className="text-xs text-slate-600 mt-1">Current Status: {currentIssue.status}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Update Message</label>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Add update message (will be visible to residents)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Next Status</label>
                <div className="space-y-2">
                  {['created', 'started', 'in-progress', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(currentIssue.id, status as any)}
                      className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-colors ${
                        status === 'created' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                        status === 'started' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                        status === 'in-progress' ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' :
                        'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {status.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredIssues.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No issues found</p>
        </div>
      )}
    </div>
  )
}
