'use client'

import { useState, useEffect } from 'react'
import { dataStore } from '@/lib/centralDataStore'
import { Search, Filter, Download, Clock, User, AlertCircle } from 'lucide-react'

interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userRole: string
  action: string
  resource: string
  details: string
  status: 'success' | 'failure'
}

export default function AuditLogTab() {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<'all' | 'created' | 'updated' | 'deleted' | 'approved' | 'denied'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failure'>('all')

  useEffect(() => {
    // Load audit logs from dataStore
    const mappedLogs: AuditEntry[] = logs
      .map(log => ({
        id: log.id,
        timestamp: new Date(log.timestamp).toLocaleString(),
        userId: log.userId || 'system',
        userRole: log.userRole || 'unknown',
        action: log.action,
        resource: log.resource || 'N/A',
        details: log.details || '',
        status: log.status || 'success' as const,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setAuditLogs(mappedLogs)

    // Real-time updates disabled - using API instead
    // Data fetched from /api endpoints during initialization
    return () => {}
  }, [])

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === 'all' || 
      log.action.toLowerCase().includes(filterAction.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus

    return matchesSearch && matchesAction && matchesStatus
  })

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-blue-100 text-blue-800'
    if (action.includes('update')) return 'bg-amber-100 text-amber-800'
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-800'
    if (action.includes('approve')) return 'bg-green-100 text-green-800'
    if (action.includes('deny')) return 'bg-red-100 text-red-800'
    return 'bg-slate-100 text-slate-800'
  }

  const getStatusColor = (status: string) => {
    return status === 'success' 
      ? 'bg-green-50 border-green-200' 
      : 'bg-red-50 border-red-200'
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'User ID', 'Role', 'Action', 'Resource', 'Status', 'Details'].join(','),
      ...filteredLogs.map(log => 
        [log.timestamp, log.userId, log.userRole, log.action, log.resource, log.status, log.details]
          .map(field => `"${field}"`)
          .join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-slate-900 text-sm">Audit Log</p>
          <p className="text-xs text-slate-600 mt-1">Complete activity log for compliance and security monitoring. All system actions are tracked including user activities, administrative changes, and system events.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action, resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleExportLogs}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 items-center flex-wrap">
            <span className="text-xs font-medium text-slate-600">Action:</span>
            {(['all', 'created', 'updated', 'deleted', 'approved', 'denied'] as const).map(action => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterAction === action
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-1 items-center flex-wrap">
            <span className="text-xs font-medium text-slate-600">Status:</span>
            {(['all', 'success', 'failure'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-medium text-slate-700">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">User</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Role</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Action</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Resource</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className={`border-b border-slate-200 hover:bg-slate-50 ${getStatusColor(log.status)}`}>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{log.userId}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{log.resource}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(log.status)}`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Total Logs</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{auditLogs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Successful</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{auditLogs.filter(l => l.status === 'success').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-600 uppercase">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{auditLogs.filter(l => l.status === 'failure').length}</p>
        </div>
      </div>
    </div>
  )
}
