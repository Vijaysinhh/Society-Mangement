'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Phone, Clock, X } from 'lucide-react'

interface Watchman {
  id: string
  name: string
  phone: string
  shift: 'morning' | 'evening' | 'night'
  startTime: string
  endTime: string
  gate: string
}

interface WatchmenListProps {
  societyId: string
}

export default function WatchmenList({ societyId }: WatchmenListProps) {
  const [watchmen, setWatchmen] = useState<Watchman[]>([
    { id: '1', name: 'Rajesh Kumar', phone: '9876543210', shift: 'morning', startTime: '06:00', endTime: '14:00', gate: 'Main Gate' },
    { id: '2', name: 'Suresh Patel', phone: '9876543211', shift: 'evening', startTime: '14:00', endTime: '22:00', gate: 'Back Gate' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shift: 'morning' as const,
    startTime: '06:00',
    endTime: '14:00',
    gate: '',
  })

  const handleAdd = () => {
    if (formData.name && formData.phone && formData.gate) {
      if (editingId) {
        setWatchmen(watchmen.map(w => w.id === editingId ? { ...w, ...formData, id: w.id } : w))
        setEditingId(null)
      } else {
        setWatchmen([...watchmen, { ...formData, id: Date.now().toString() }])
      }
      setFormData({ name: '', phone: '', shift: 'morning', startTime: '06:00', endTime: '14:00', gate: '' })
      setShowForm(false)
    }
  }

  const handleEdit = (watchman: Watchman) => {
    setFormData(watchman)
    setEditingId(watchman.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setWatchmen(watchmen.filter(w => w.id !== id))
  }

  const shiftBadgeColor = {
    morning: 'bg-amber-100 text-amber-800',
    evening: 'bg-blue-100 text-blue-800',
    night: 'bg-slate-800 text-white',
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <button
        onClick={() => {
          setShowForm(!showForm)
          setEditingId(null)
          if (!showForm) setFormData({ name: '', phone: '', shift: 'morning', startTime: '06:00', endTime: '14:00', gate: '' })
        }}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        {showForm ? 'Cancel' : 'Add Watchman'}
      </button>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5">
          <h3 className="font-semibold text-slate-900 mb-4">{editingId ? 'Edit Watchman' : 'Add New Watchman'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Gate/Area"
              value={formData.gate}
              onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="morning">Morning (06:00 - 14:00)</option>
              <option value="evening">Evening (14:00 - 22:00)</option>
              <option value="night">Night (22:00 - 06:00)</option>
            </select>
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Watchmen List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {watchmen.map((watchman) => (
          <div key={watchman.id} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{watchman.name}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />
                  {watchman.phone}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${shiftBadgeColor[watchman.shift]}`}>
                {watchman.shift}
              </span>
            </div>

            <div className="space-y-1 text-sm mb-4 pb-4 border-b border-slate-100">
              <p className="text-slate-600"><span className="font-medium">Gate:</span> {watchman.gate}</p>
              <p className="text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {watchman.startTime} - {watchman.endTime}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(watchman)}
                className="flex-1 flex items-center justify-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(watchman.id)}
                className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
