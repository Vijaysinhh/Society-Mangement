'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Clock, User, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DutySchedule {
  id: string
  watchmanName: string
  watchmanPhone: string
  dayOfWeek: string
  startTime: string
  endTime: string
  createdAt: string
}

const mockSchedules: DutySchedule[] = [
  {
    id: '1',
    watchmanName: 'Ramesh Kumar',
    watchmanPhone: '98765 43210',
    dayOfWeek: 'Monday',
    startTime: '06:00 AM',
    endTime: '02:00 PM',
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    watchmanName: 'Ramesh Kumar',
    watchmanPhone: '98765 43210',
    dayOfWeek: 'Monday',
    startTime: '02:00 PM',
    endTime: '10:00 PM',
    createdAt: '2026-03-01',
  },
  {
    id: '3',
    watchmanName: 'Priya Singh',
    watchmanPhone: '87654 32109',
    dayOfWeek: 'Tuesday',
    startTime: '06:00 AM',
    endTime: '02:00 PM',
    createdAt: '2026-03-02',
  },
]

export default function ScheduleMobile() {
  const [schedules, setSchedules] = useState<DutySchedule[]>(mockSchedules)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
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

  const handleAddSchedule = () => {
    if (!formData.watchmanName.trim() || !formData.watchmanPhone.trim()) {
      toast.error('Missing Information', {
        description: 'Please fill in watchman name and phone number',
      })
      return
    }

    if (editingId) {
      // Update existing schedule
      setSchedules(schedules.map(s =>
        s.id === editingId
          ? { ...s, ...formData, createdAt: s.createdAt }
          : s
      ))
      toast.success('Schedule Updated', {
        description: `${formData.watchmanName}'s duty updated for ${formData.dayOfWeek}`,
      })
      setEditingId(null)
    } else {
      // Add new schedule
      const newSchedule: DutySchedule = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setSchedules([...schedules, newSchedule])
      toast.success('Schedule Created', {
        description: `Duty assigned to ${formData.watchmanName} on ${formData.dayOfWeek}`,
      })
    }

    setFormData({
      watchmanName: '',
      watchmanPhone: '',
      dayOfWeek: 'Monday',
      startTime: '06:00 AM',
      endTime: '02:00 PM',
    })
    setShowForm(false)
  }

  const handleEditSchedule = (schedule: DutySchedule) => {
    setFormData({
      watchmanName: schedule.watchmanName,
      watchmanPhone: schedule.watchmanPhone,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })
    setEditingId(schedule.id)
    setShowForm(true)
  }

  const handleDeleteSchedule = (id: string, watchmanName: string) => {
    if (confirm(`Remove ${watchmanName}'s shift?`)) {
      setSchedules(schedules.filter(s => s.id !== id))
      toast.success('Schedule Deleted', {
        description: `${watchmanName}'s duty has been removed`,
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
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
              <input
                type="text"
                placeholder="Enter watchman name"
                value={formData.watchmanName}
                onChange={(e) => setFormData({ ...formData, watchmanName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Watchman Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={formData.watchmanPhone}
                onChange={(e) => setFormData({ ...formData, watchmanPhone: e.target.value })}
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
