'use client'

import { useState } from 'react'
import { Wrench, AlertCircle, CheckCircle2, Clock, DollarSign, Calendar, Filter, Search, Zap, Droplet, Hammer, Eye } from 'lucide-react'

interface MaintenanceRequest {
  id: string
  date: string
  category: 'plumbing' | 'electrical' | 'general' | 'hvac' | 'carpentry' | 'painting'
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  cost: number
  partsUsed: string[]
  laborHours: number
  technician: string
  completionDate?: string
  photos: string[]
}

interface MaintenanceStats {
  totalRequests: number
  avgCost: number
  totalSpent: number
  completedThisMonth: number
  averageResolutionTime: number
}

const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mr-001',
    date: '2024-03-15',
    category: 'plumbing',
    title: 'Water Leakage in Bathroom',
    description: 'Small leak detected in the bathroom tap. Needs repair.',
    status: 'completed',
    priority: 'high',
    cost: 850,
    partsUsed: ['Washers (₹150)', 'Pipe adapter (₹350)', 'Sealant (₹80)'],
    laborHours: 1.5,
    technician: 'Rajesh Plumber',
    completionDate: '2024-03-16',
    photos: []
  },
  {
    id: 'mr-002',
    date: '2024-03-10',
    category: 'electrical',
    title: 'Living Room Light Flicker',
    description: 'Living room ceiling light keeps flickering. Potential wiring issue.',
    status: 'completed',
    priority: 'medium',
    cost: 600,
    partsUsed: ['LED bulb (₹300)', 'Ballast replacement (₹250)'],
    laborHours: 2,
    technician: 'Vikram Electrician',
    completionDate: '2024-03-12',
    photos: []
  },
  {
    id: 'mr-003',
    date: '2024-03-20',
    category: 'hvac',
    title: 'AC Not Cooling Properly',
    description: 'AC unit running but not cooling the room effectively.',
    status: 'in-progress',
    priority: 'high',
    cost: 1200,
    partsUsed: ['Refrigerant refill', 'Condenser coil cleaning'],
    laborHours: 2.5,
    technician: 'Amit AC Technician',
    photos: []
  },
  {
    id: 'mr-004',
    date: '2024-02-28',
    category: 'general',
    title: 'Cabinet Door Repair',
    description: 'Kitchen cabinet door hinge damaged.',
    status: 'completed',
    priority: 'low',
    cost: 400,
    partsUsed: ['Cabinet hinge (₹200)', 'Screws (₹50)'],
    laborHours: 0.75,
    technician: 'Ramesh Carpenter',
    completionDate: '2024-03-01',
    photos: []
  },
  {
    id: 'mr-005',
    date: '2024-03-18',
    category: 'painting',
    title: 'Wall Paint Touch-up',
    description: 'Living room wall needs touch-up painting due to stain.',
    status: 'pending',
    priority: 'low',
    cost: 500,
    partsUsed: ['Paint (2L)', 'Primer'],
    laborHours: 3,
    technician: 'Pending',
    photos: []
  }
]

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplet className="w-5 h-5" />,
  electrical: <Zap className="w-5 h-5" />,
  general: <Wrench className="w-5 h-5" />,
  hvac: <Zap className="w-5 h-5" />,
  carpentry: <Hammer className="w-5 h-5" />,
  painting: <Hammer className="w-5 h-5" />
}

const categoryColors: Record<string, { bg: string; text: string; badge: string }> = {
  plumbing: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  electrical: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  general: { bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100' },
  hvac: { bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100' },
  carpentry: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
  painting: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100' }
}

// export default function MaintenanceInsights() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress' | 'pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)

  const stats: MaintenanceStats = {
    totalRequests: mockMaintenanceRequests.length,
    avgCost: Math.round(mockMaintenanceRequests.reduce((sum, r) => sum + r.cost, 0) / mockMaintenanceRequests.length),
    totalSpent: mockMaintenanceRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.cost, 0),
    completedThisMonth: mockMaintenanceRequests.filter(r => r.status === 'completed' && new Date(r.completionDate || '').getMonth() === new Date().getMonth()).length,
    averageResolutionTime: 2
  }

  const filteredRequests = mockMaintenanceRequests.filter(req => {
    const matchStatus = filterStatus === 'all' || req.status === filterStatus
    const matchSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       req.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-600 uppercase">Total Requests</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.totalRequests}</p>
              <p className="text-xs text-slate-600 mt-1">All time</p>
            </div>
            <Wrench className="w-8 h-8 text-slate-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-600 uppercase">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">{stats.completedThisMonth}</p>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-600 uppercase">Total Spent</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1 sm:mt-2">₹{stats.totalSpent.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">Completed work</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase">Avg Cost</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1 sm:mt-2">₹{stats.avgCost.toLocaleString()}</p>
              <p className="text-xs text-purple-600 mt-1">Per request</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'completed', 'in-progress', 'pending'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status === 'in-progress' ? 'In Progress' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No maintenance requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request.id}
              className={`rounded-lg border transition-all cursor-pointer ${
                expandedRequest === request.id
                  ? 'bg-white border-blue-300 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                className="p-4 sm:p-4 flex items-start gap-3"
              >
                <div className={`p-3 rounded-lg flex-shrink-0 ${categoryColors[request.category].badge}`}>
                  <div className={categoryColors[request.category].text}>
                    {categoryIcons[request.category]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{request.title}</h4>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700' :
                      request.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {request.status === 'in-progress' ? 'In Progress' : request.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{request.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Wrench className="w-4 h-4" />
                      {request.technician}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-900">
                      <DollarSign className="w-4 h-4" />
                      ₹{request.cost}
                    </span>
                  </div>
                </div>

                <Eye className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
              </div>

              {/* Expanded Details */}
              {expandedRequest === request.id && (
                <div className="border-t border-slate-200 p-4 sm:p-4 bg-slate-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Parts Used</p>
                      <div className="mt-2 space-y-1">
                        {request.partsUsed.map((part, idx) => (
                          <p key={idx} className="text-sm text-slate-700">• {part}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Cost Breakdown</p>
                      <div className="mt-2 space-y-1 text-sm text-slate-700">
                        <div className="flex justify-between">
                          <span>Labor ({request.laborHours}hrs @ ₹500/hr):</span>
                          <span className="font-medium">₹{(request.laborHours * 500).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parts:</span>
                          <span className="font-medium">₹{(request.cost - request.laborHours * 500).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-300">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold">₹{request.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.completionDate && (
                    <div className="p-3 bg-green-50 rounded text-sm text-green-700">
                      <p className="font-medium">Completed on {new Date(request.completionDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      View Photos
                    </button>
                    <button className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Download Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Maintenance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-slate-900 text-sm mb-2">Maintenance Tips</p>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>• Schedule preventive maintenance quarterly to avoid major repairs</li>
          <li>• Keep all maintenance receipts for warranty and insurance claims</li>
          <li>• Report issues immediately to prevent escalation</li>
        </ul>
      </div>
    </div>
  )
}
