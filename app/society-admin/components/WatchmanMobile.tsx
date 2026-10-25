'use client'

import React, { useEffect, useState } from 'react'
import { X, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Phone, MapPin, Clock } from 'lucide-react'

interface Watchman {
  id: string
  name: string
  phone: string
  address: string
  shiftStart: string
  shiftEnd: string
  assignedArea: string
  status: 'active' | 'suspended' | 'deactivated'
  username?: string
  password?: string
}

interface DutyAssignment {
  id: string
  watchmanId: string
  date: string
  status: 'present' | 'absent' | 'leave' | 'holiday'
}

interface WatchmanIncident {
  id: string
  watchmanId: string
  watchmanName: string
  title: string
  description: string
  reportedAt: string
  status: 'reported' | 'investigating' | 'resolved'
}

interface DutyLog {
  id: string
  watchmanId: string
  date: string
  checkInTime: string
  checkOutTime: string | null
  duration: string
  status: 'present' | 'absent' | 'leave'
}

type TabType = 'watchmen' | 'logbook' | 'schedule'

const mockIncidents: WatchmanIncident[] = [
  {
    id: '1',
    watchmanId: '1',
    watchmanName: 'Ramesh Kumar',
    title: 'Unknown Vehicle in Parking',
    description: 'Unregistered vehicle spotted near block B parking at 2:45 AM',
    reportedAt: '2026-05-29T02:45:00',
    status: 'reported',
  },
  {
    id: '2',
    watchmanId: '2',
    watchmanName: 'Vikram Singh',
    title: 'Gate Left Open',
    description: 'Visitor gate was found open during night hours',
    reportedAt: '2026-05-28T23:30:00',
    status: 'investigating',
  },
  {
    id: '3',
    watchmanId: '1',
    watchmanName: 'Ramesh Kumar',
    title: 'Unauthorized Person',
    description: 'Person found loitering near main entrance without visitor pass',
    reportedAt: '2026-05-27T03:15:00',
    status: 'resolved',
  },
]

export default function WatchmanMobile() {
  const [activeTab, setActiveTab] = useState<TabType>('watchmen')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 29))
  const [watchmen, setWatchmen] = useState<Watchman[]>([])
  const [expandedWatchmanId, setExpandedWatchmanId] = useState<string | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedWatchman, setSelectedWatchman] = useState<Watchman | null>(null)
  const [selectedWatchmanId, setSelectedWatchmanId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Watchman>>({})
  const [loadingWatchmen, setLoadingWatchmen] = useState(true)
  const [savingWatchman, setSavingWatchman] = useState(false)
  const [watchmanError, setWatchmanError] = useState('')
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; username: string; password: string } | null>(null)
  const [dutyLogs, setDutyLogs] = useState<DutyLog[]>([])
  const [loadingDutyLogs, setLoadingDutyLogs] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadWatchmen() {
      setLoadingWatchmen(true)
      setWatchmanError('')
      try {
        const response = await fetch('/api/watchmen')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load watchmen')
        if (!cancelled) {
          setWatchmen(result.data || [])
          setSelectedWatchmanId(result.data?.[0]?.id || null)
        }
      } catch (error) {
        if (!cancelled) setWatchmanError(error instanceof Error ? error.message : 'Could not load watchmen')
      } finally {
        if (!cancelled) setLoadingWatchmen(false)
      }
    }
    loadWatchmen()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadDutyLogs() {
      setLoadingDutyLogs(true)
      try {
        const response = await fetch('/api/watchmen/duty')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load duty history')
        if (!cancelled) setDutyLogs((result.data || []).map((log: any) => {
          const minutes = Number(log.durationMinutes) || 0
          return {
            id: log.id,
            watchmanId: log.watchmanId,
            date: log.date,
            checkInTime: new Date(log.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            checkOutTime: log.checkOutAt ? new Date(log.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On duty',
            duration: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
            status: 'present' as const,
          }
        }))
      } catch (error) {
        if (!cancelled) setWatchmanError(error instanceof Error ? error.message : 'Could not load duty history')
      } finally {
        if (!cancelled) setLoadingDutyLogs(false)
      }
    }
    void loadDutyLogs()
    return () => { cancelled = true }
  }, [])

  // Watchmen Management
  const handleAddWatchman = () => {
    setFormData({ shiftStart: '18:00', shiftEnd: '06:00' })
    setSelectedWatchman(null)
    setShowAddModal(true)
  }

  const handleEditWatchman = (watchman: Watchman) => {
    setFormData({ ...watchman, password: '' })
    setSelectedWatchman(watchman)
    setShowEditModal(true)
  }

  const handleDeleteWatchman = async (id: string) => {
    if (!window.confirm('Deactivate this watchman account? They will no longer be able to log in.')) return
    setWatchmanError('')
    try {
      const response = await fetch(`/api/watchmen/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'deactivated' }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not deactivate watchman')
      setWatchmen((current) => current.map((watchman) => watchman.id === id ? result.data : watchman))
    } catch (error) {
      setWatchmanError(error instanceof Error ? error.message : 'Could not deactivate watchman')
    }
  }

  const handleSaveWatchman = async () => {
    if (!formData.name || !formData.phone || (!selectedWatchman && (!formData.username || !formData.password))) {
      setWatchmanError('Name, mobile number, username, and password are required for a new watchman.')
      return
    }
    setSavingWatchman(true)
    setWatchmanError('')
    try {
      const isEditing = Boolean(selectedWatchman)
      const response = await fetch(isEditing ? `/api/watchmen/${selectedWatchman!.id}` : '/api/watchmen', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save watchman')
      if (isEditing) {
        setWatchmen((current) => current.map((watchman) => watchman.id === selectedWatchman!.id ? result.data : watchman))
      } else {
        setWatchmen((current) => [result.data, ...current])
        setSelectedWatchmanId(result.data.id)
        setCreatedCredentials({ name: formData.name!, username: formData.username!, password: formData.password! })
      }
      setShowAddModal(false)
      setShowEditModal(false)
      setFormData({})
    } catch (error) {
      setWatchmanError(error instanceof Error ? error.message : 'Could not save watchman')
    } finally {
      setSavingWatchman(false)
    }
  }

  // Calendar rendering
  const renderMonthCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50 h-16"></div>)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = formatDate(date)
      const dayStatus = getDutyStatus('1', dateStr) // Show first watchman by default

      days.push(
        <div key={day} className="bg-white border border-slate-200 p-2 h-20">
          <div className="font-semibold text-sm text-slate-900 mb-1">{day}</div>
          <div className={`px-2 py-1 rounded text-xs font-medium text-center ${getDutyStatusColor(dayStatus)}`}>
            {dayStatus ? dayStatus.charAt(0).toUpperCase() + dayStatus.slice(1) : 'Unassigned'}
          </div>
        </div>
      )
    }

    return days
  }

  // Render Tab Content
  const renderContent = () => {
    if (activeTab === 'watchmen') {
      return (
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Watchmen</h3>
            <button
              onClick={handleAddWatchman}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Watchman
            </button>
          </div>

          {watchmanError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{watchmanError}</p>}
          {loadingWatchmen && <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading watchmen...</p>}
          {!loadingWatchmen && watchmen.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center"><p className="font-medium text-slate-900">No watchmen added yet</p><p className="mt-1 text-sm text-slate-600">Create the first account to give security staff access.</p></div>}
          <div className="space-y-2">
            {watchmen.map(watchman => {
              const isExpanded = expandedWatchmanId === watchman.id
              
              // Calculate performance metrics
              const watchmanLogs = dutyLogs.filter(log => log.watchmanId === watchman.id)
              const daysWorked = watchmanLogs.filter(l => l.status === 'present').length
              const daysAbsent = watchmanLogs.filter(l => l.status === 'absent').length
              const daysOnLeave = watchmanLogs.filter(l => l.status === 'leave').length
              const attendanceRate = watchmanLogs.length > 0 
                ? Math.round((daysWorked / (watchmanLogs.length - daysOnLeave)) * 100) 
                : 0
              const visitorsLogged = 0

              return (
                <div key={watchman.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {/* Compact Header - Always Visible */}
                  <button
                    onClick={() => setExpandedWatchmanId(isExpanded ? null : watchman.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">🔒 {watchman.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${watchman.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {watchman.status === 'active' ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{watchman.assignedArea}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50">
                      {/* Performance Metrics Grid */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-600">Visitors Logged</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{visitorsLogged}</p>
                            <p className="text-xs text-blue-600 mt-1">Visitor records not connected yet</p>
                          </div>
                          <div className="bg-white border border-green-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-600">Attendance</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">{attendanceRate}%</p>
                            <p className="text-xs text-green-600 mt-1">{daysWorked} days worked</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                            <p className="text-xs font-medium text-slate-600">Worked</p>
                            <p className="text-lg font-bold text-slate-900 mt-1">{daysWorked}</p>
                          </div>
                          <div className="bg-white border border-orange-200 rounded-lg p-2 text-center">
                            <p className="text-xs font-medium text-orange-600">Absent</p>
                            <p className="text-lg font-bold text-orange-700 mt-1">{daysAbsent}</p>
                          </div>
                          <div className="bg-white border border-purple-200 rounded-lg p-2 text-center">
                            <p className="text-xs font-medium text-purple-600">Leave</p>
                            <p className="text-lg font-bold text-purple-700 mt-1">{daysOnLeave}</p>
                          </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">Trend</p>
                          {attendanceRate >= 90 && <span className="text-green-600 font-bold text-sm">Excellent ↑</span>}
                          {attendanceRate >= 75 && attendanceRate < 90 && <span className="text-blue-600 font-bold text-sm">Good →</span>}
                          {attendanceRate < 75 && <span className="text-orange-600 font-bold text-sm">Needs Improvement ↓</span>}
                        </div>

                        {/* Contact & Shift Details */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                          <div className="text-sm">
                            <p className="text-xs text-slate-600 font-medium">Login username</p>
                            <p className="text-slate-900 font-medium">{watchman.username}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-slate-600 font-medium">Contact</p>
                            <p className="text-slate-900 font-medium">{watchman.phone}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-slate-600 font-medium">Address</p>
                            <p className="text-slate-900 font-medium">{watchman.address || 'Not specified'}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-slate-600 font-medium">Shift</p>
                            <p className="text-slate-900 font-medium">{watchman.shiftStart} - {watchman.shiftEnd}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleEditWatchman(watchman)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWatchman(watchman.id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (activeTab === 'logbook') {
      const logs = dutyLogs.filter(log => log.watchmanId === selectedWatchmanId)
      const selectedWatchmanData = watchmen.find(w => w.id === selectedWatchmanId)
      
      // Calculate weekly summary
      const last7Days = logs.slice(0, 7)
      const totalHours = last7Days
        .filter(l => l.status === 'present')
        .reduce((sum, l) => {
          const [hours, mins] = l.duration.split('h').map(x => parseInt(x.trim()))
          return sum + hours + mins / 60
        }, 0)
      const daysPresent = last7Days.filter(l => l.status === 'present').length
      const avgDaily = daysPresent > 0 ? (totalHours / daysPresent).toFixed(2) : '0'

      return (
        <div className="space-y-4 pb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Select Watchman:</label>
              <select
                value={selectedWatchmanId}
                onChange={(e) => setSelectedWatchmanId(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                {watchmen.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedWatchmanData && (
            <>
              {/* Watchman Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-slate-900">{selectedWatchmanData.name}</p>
                <p className="text-sm text-slate-600">Area: {selectedWatchmanData.assignedArea}</p>
                <p className="text-sm text-slate-600">Shift: {selectedWatchmanData.shiftStart} - {selectedWatchmanData.shiftEnd}</p>
              </div>

              {/* Daily Logs */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Daily Logs (Past 7 Days)</h3>
                {loadingDutyLogs && <p role="status" className="text-sm text-slate-600">Loading duty history...</p>}
                {!loadingDutyLogs && logs.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-600">No duty records yet.</p>}
                <div className="space-y-2">
                  {logs.slice(0, 7).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {log.status === 'present' ? `${log.checkInTime} → ${log.checkOutTime}` : log.status.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{log.duration}</span>
                        <span className={`text-xl ${
                          log.status === 'present' ? '🟢' : log.status === 'leave' ? '🟡' : '🔴'
                        }`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Summary */}
              <div className="mt-6 bg-white border-2 border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Weekly Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Total Hours Worked</p>
                    <p className="text-lg font-bold text-slate-900">{totalHours.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Days Present</p>
                    <p className="text-lg font-bold text-slate-900">{daysPresent}/7</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Daily Hours</p>
                    <p className="text-lg font-bold text-slate-900">{avgDaily}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Leave/Absent</p>
                    <p className="text-lg font-bold text-slate-900">{7 - daysPresent}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )
    }

    if (activeTab === 'schedule') {
      return (
        <div className="space-y-4 pb-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Duty Schedule</h3>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="space-y-3">
            {watchmen.map(watchman => (
              <div key={watchman.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{watchman.name}</p>
                    <p className="text-sm text-slate-600">Area: {watchman.assignedArea}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    watchman.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {watchman.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-slate-600">Shift:</span>
                    <span className="font-semibold text-slate-900">{watchman.shiftStart} - {watchman.shiftEnd}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-slate-600">Contact:</span>
                    <span className="font-semibold text-slate-900">{watchman.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setSelectedWatchman(watchman)
                      setShowEditModal(true)
                    }}
                    className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg font-medium text-sm hover:bg-purple-200 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteWatchman(watchman.id)}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium text-sm hover:bg-red-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Schedule Button */}
          <button
            onClick={() => {
              setSelectedWatchman(null)
              setShowAddModal(true)
            }}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-5 h-5" />
            Add New Watchman Schedule
          </button>
        </div>
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-0 border-b border-slate-200 bg-white rounded-t-lg overflow-hidden">
        {(['watchmen', 'logbook', 'schedule'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'watchmen' && 'Watchmen'}
            {tab === 'logbook' && 'Duty Logbook'}
            {tab === 'schedule' && 'Duty Schedule'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg p-4">
        {renderContent()}
      </div>

      {/* Add/Edit Watchman Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{selectedWatchman ? 'Edit Watchman' : 'Add New Watchman'}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                }}
                className="p-2 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Watchman name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Login Username *</label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="e.g., gate_guard_1"
                  autoComplete="username"
                  disabled={Boolean(selectedWatchman)}
                />
                <p className="mt-1 text-xs text-slate-500">3-50 characters: letters, numbers, underscore or hyphen.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Watchman Quarter, Block A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{selectedWatchman ? 'New Password' : 'Password *'}</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={selectedWatchman ? 'Leave blank to keep current password' : 'At least 8 characters'}
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={formData.shiftStart || '18:00'}
                    onChange={e => setFormData({ ...formData, shiftStart: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shift End</label>
                  <input
                    type="time"
                    value={formData.shiftEnd || '06:00'}
                    onChange={e => setFormData({ ...formData, shiftEnd: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Area</label>
                <input
                  type="text"
                  value={formData.assignedArea || ''}
                  onChange={e => setFormData({ ...formData, assignedArea: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Main Gate, Parking"
                />
              </div>
              {watchmanError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{watchmanError}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                }}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWatchman}
                disabled={savingWatchman}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:cursor-wait disabled:opacity-60"
              >
                {savingWatchman ? 'Saving...' : selectedWatchman ? 'Update' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="watchman-credentials-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="watchman-credentials-title" className="text-lg font-bold text-slate-950">Watchman account created</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Share these credentials securely with {createdCredentials.name}. The password will not be shown again.</p>
            <dl className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div><dt className="text-slate-500">Login URL</dt><dd className="mt-1 break-all font-mono font-semibold text-slate-900">/watchman-login</dd></div>
              <div><dt className="text-slate-500">Username</dt><dd className="mt-1 font-mono font-semibold text-slate-900">{createdCredentials.username}</dd></div>
              <div><dt className="text-slate-500">Password</dt><dd className="mt-1 break-all font-mono font-semibold text-slate-900">{createdCredentials.password}</dd></div>
            </dl>
            <button onClick={() => setCreatedCredentials(null)} className="mt-5 min-h-11 w-full rounded-lg bg-purple-700 px-4 font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">I have saved the credentials</button>
          </div>
        </div>
      )}
    </div>
  )
}
