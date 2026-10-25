'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Clock, User, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DutySchedule {
  id: string
  watchmanId: string
  watchmanName: string
  watchmanPhone: string
  dayOfWeek: string
  startTime: string
  endTime: string
  createdAt: string
}

interface WatchmanOption { id: string; name: string; phone: string; status: string }

const to24Hour = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/)
  if (!match) return value
  let hour = Number(match[1]); if (match[3] === 'AM' && hour === 12) hour = 0; if (match[3] === 'PM' && hour !== 12) hour += 12
  return `${String(hour).padStart(2, '0')}:${match[2]}`
}

export default function ScheduleMobile() {
  const [schedules, setSchedules] = useState<DutySchedule[]>([])
  const [watchmen, setWatchmen] = useState<WatchmanOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    watchmanId: '',
    watchmanName: '',
    watchmanPhone: '',
    dayOfWeek: 'Monday',
    startTime: '06:00 AM',
    endTime: '02:00 PM',
  })

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const times = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
    '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '02:00 AM'
  ]

  useEffect(() => {
    let cancelled = false
    Promise.all(['/api/watchman-schedules', '/api/watchmen'].map(async url => {
      const response = await fetch(url); const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load duty schedule')
      return result.data || []
    })).then(([scheduleData, watchmanData]) => {
      if (!cancelled) { setSchedules(scheduleData); setWatchmen(watchmanData.filter((watchman: WatchmanOption) => watchman.status === 'active')) }
    }).catch(error => { if (!cancelled) toast.error('Could not load duty schedule', { description: error instanceof Error ? error.message : 'Try again.' }) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleAddSchedule = async () => {
    if (!formData.watchmanId) {
      toast.error('Missing Information', {
        description: 'Please select a watchman',
      })
      return
    }

    try {
      const response = await fetch(editingId ? `/api/watchman-schedules/${editingId}` : '/api/watchman-schedules', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ watchmanId: formData.watchmanId, dayOfWeek: formData.dayOfWeek, startTime: to24Hour(formData.startTime), endTime: to24Hour(formData.endTime) }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save duty schedule')
      if (editingId) {
        setSchedules(schedules.map(s => s.id === editingId ? result.data : s))
      toast.success('Schedule Updated', {
        description: `${formData.watchmanName}'s duty updated for ${formData.dayOfWeek}`,
      })
      setEditingId(null)
      } else {
      setSchedules([...schedules, result.data])
      toast.success('Schedule Created', {
        description: `Duty assigned to ${formData.watchmanName} on ${formData.dayOfWeek}`,
      })
      }

    setFormData({
      watchmanId: '',
      watchmanName: '',
      watchmanPhone: '',
      dayOfWeek: 'Monday',
      startTime: '06:00 AM',
      endTime: '02:00 PM',
    })
    setShowForm(false)
    } catch (error) { toast.error('Could not save schedule', { description: error instanceof Error ? error.message : 'Try again.' }) }
  }

  const handleEditSchedule = (schedule: DutySchedule) => {
    setFormData({
      watchmanId: schedule.watchmanId,
      watchmanName: schedule.watchmanName,
      watchmanPhone: schedule.watchmanPhone,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })
    setEditingId(schedule.id)
    setShowForm(true)
  }

  const handleDeleteSchedule = async (id: string, watchmanName: string) => {
    if (confirm(`Remove ${watchmanName}'s shift?`)) {
      try {
        const response = await fetch(`/api/watchman-schedules/${id}`, { method: 'DELETE' }); const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not delete duty schedule')
        setSchedules(schedules.filter(s => s.id !== id))
      toast.success('Schedule Deleted', {
        description: `${watchmanName}'s duty has been removed`,
      })
      } catch (error) { toast.error('Could not delete schedule', { description: error instanceof Error ? error.message : 'Try again.' }) }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      watchmanId: '',
      watchmanName: '',
      watchmanPhone: '',
      dayOfWeek: 'Monday',
      startTime: '06:00 AM',
      endTime: '02:00 PM',
    })
  }

  // Group schedules by day
  const schedulesByDay = days.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.dayOfWeek === day)
    return acc
  }, {} as Record<string, DutySchedule[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duty Schedule</h1>
          <p className="text-sm text-slate-600 mt-1">Manage watchman duty assignments and shifts</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Duty
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5 space-y-4">
          <h3 className="font-semibold text-slate-900">
            {editingId ? 'Edit Duty Schedule' : 'Create New Duty Schedule'}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Watchman Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Watchman Name</label>
              <select
                value={formData.watchmanId}
                onChange={(e) => { const watchman = watchmen.find(item => item.id === e.target.value); setFormData({ ...formData, watchmanId: e.target.value, watchmanName: watchman?.name || '', watchmanPhone: watchman?.phone || '' }) }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Select watchman</option>
                {watchmen.map(watchman => <option key={watchman.id} value={watchman.id}>{watchman.name}</option>)}
              </select>
            </div>

            {/* Watchman Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={formData.watchmanPhone}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {times.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {times.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSchedule}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              {editingId ? 'Update' : 'Create'} Duty
            </button>
          </div>
        </div>
      )}

      {/* Schedules by Day */}
      <div className="space-y-4">
        {loading && <p role="status" className="py-6 text-center text-sm text-slate-600">Loading duty schedule...</p>}
        {days.map(day => (
          <div key={day}>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              {day}
            </h3>

            {schedulesByDay[day].length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-500 text-sm">
                No duties scheduled for {day}
              </div>
            ) : (
              <div className="grid gap-3">
                {schedulesByDay[day].map(schedule => (
                  <div key={schedule.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-600" />
                          <p className="font-semibold text-slate-900">{schedule.watchmanName}</p>
                        </div>
                        <p className="text-xs text-slate-500">{schedule.watchmanPhone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id, schedule.watchmanName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium text-slate-900">{schedule.startTime}</span>
                        <span className="text-slate-500">to</span>
                        <span className="font-medium text-slate-900">{schedule.endTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Shifts Summary */}
      {schedules.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
          <p className="text-sm font-medium text-slate-900">
            Total Scheduled Shifts: <span className="text-indigo-600 font-bold">{schedules.length}</span>
          </p>
        </div>
      )}
    </div>
  )
}
