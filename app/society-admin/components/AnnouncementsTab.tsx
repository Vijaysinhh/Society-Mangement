'use client'

import { useState, useEffect } from 'react'
import { Announcement } from '@/types'
import { Plus, Trash2, AlertCircle, Bell, Calendar, Edit2, X } from 'lucide-react'

interface AnnouncementsTabProps {
  societyId: string
}

interface FormDataType {
  title: string
  description: string
  type: 'general' | 'emergency' | 'maintenance' | 'event'
  priority: 'low' | 'medium' | 'high'
  scheduledFor: string
}

export default function AnnouncementsTab({ societyId }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all')
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    scheduledFor: '',
  })

  useEffect(() => {
    let storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]')
    storedAnnouncements = storedAnnouncements.filter((a: Announcement) => a.societyId === societyId)

    if (storedAnnouncements.length === 0) {
      const mockAnnouncements: Announcement[] = [
        {
          id: 'ann-001',
          societyId,
          title: 'Water Supply Maintenance',
          description: 'Water supply will be shut down from 2 AM to 5 AM on Sunday for maintenance work.',
          type: 'maintenance',
          priority: 'high',
          status: 'published',
          createdBy: 'Admin',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'ann-002',
          societyId,
          title: 'Community Sports Day',
          description: 'Annual sports day on Saturday at 6 AM in the main ground. All residents are invited to participate.',
          type: 'event',
          priority: 'medium',
          status: 'scheduled',
          createdBy: 'Admin',
          createdAt: new Date(),
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]
      localStorage.setItem('announcements', JSON.stringify(mockAnnouncements))
      setAnnouncements(mockAnnouncements)
    } else {
      setAnnouncements(storedAnnouncements)
    }
  }, [societyId])

  const handleSaveAnnouncement = () => {
    if (!formData.title || !formData.description) return

    const allAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]')

    if (editingId) {
      // Update existing
      const updated = announcements.map((a) =>
        a.id === editingId
          ? {
              ...a,
              title: formData.title,
              description: formData.description,
              type: formData.type,
              priority: formData.priority,
              scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
            }
          : a
      )
      setAnnouncements(updated)

      const updatedAll = allAnnouncements.map((a: Announcement) =>
        a.id === editingId
          ? {
              ...a,
              title: formData.title,
              description: formData.description,
              type: formData.type,
              priority: formData.priority,
              scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
            }
          : a
      )
      localStorage.setItem('announcements', JSON.stringify(updatedAll))
      setEditingId(null)
    } else {
      // Create new
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        societyId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        createdBy: 'Admin',
        createdAt: new Date(),
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
        status: formData.scheduledFor ? 'scheduled' : 'published',
      }

      const updated = [newAnnouncement, ...announcements]
      setAnnouncements(updated)
      localStorage.setItem('announcements', JSON.stringify([newAnnouncement, ...allAnnouncements]))
    }

    setFormData({
      title: '',
      description: '',
      type: 'general',
      priority: 'medium',
      scheduledFor: '',
    })
    setShowForm(false)
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      description: announcement.description,
      type: announcement.type,
      priority: announcement.priority,
      scheduledFor: announcement.scheduledFor ? new Date(announcement.scheduledFor).toISOString().slice(0, 16) : '',
    })
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id)
    setAnnouncements(updated)

    const allAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]')
    const filtered = allAnnouncements.filter((a: Announcement) => a.id !== id)
    localStorage.setItem('announcements', JSON.stringify(filtered))
    setDeleteConfirm(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      type: 'general',
      priority: 'medium',
      scheduledFor: '',
    })
  }

  const filteredAnnouncements = filterStatus === 'all' ? announcements : announcements.filter((a) => a.status === filterStatus)

  const typeIcon = {
    general: Bell,
    emergency: AlertCircle,
    maintenance: AlertCircle,
    event: Calendar,
  }

  const priorityColor = {
    low: 'bg-blue-100 text-blue-800 border border-blue-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    high: 'bg-red-100 text-red-800 border border-red-200',
  }

  const statusColor = {
    draft: 'bg-slate-100 text-slate-800 border border-slate-200',
    scheduled: 'bg-blue-100 text-blue-800 border border-blue-200',
    published: 'bg-green-100 text-green-800 border border-green-200',
    archived: 'bg-slate-200 text-slate-700 border border-slate-300',
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Announcements</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 sm:mt-3">Create and manage society announcements and notifications</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Announcement</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h3 className="font-semibold text-lg sm:text-xl text-slate-900">
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded transition-colors">
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Title</label>
              <input
                type="text"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
              <textarea
                placeholder="Announcement details"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'general' | 'emergency' | 'maintenance' | 'event' })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Target Audience</label>
                <select
                  defaultValue="all"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Residents</option>
                  <option value="block-a">Block A</option>
                  <option value="block-b">Block B</option>
                  <option value="flats">Flats Only</option>
                  <option value="watchmen">Watchmen</option>
                  <option value="maintenance">Maintenance Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">Expiry Date (Optional)</label>
                <input
                  type="date"
                  placeholder="Auto-remove after date"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2">
                <input type="checkbox" className="w-4 h-4" />
                Send Push Notification to residents
              </label>
              <p className="text-xs text-slate-600">Residents will receive a notification on their app</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleSaveAnnouncement}
              disabled={!formData.title || !formData.description}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {editingId ? 'Update' : 'Publish'}
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
      <div className="flex gap-2 sm:gap-3 lg:gap-4 flex-wrap overflow-x-auto pb-2 sm:pb-3">
        {['all', 'published', 'scheduled', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as 'all' | 'published' | 'scheduled' | 'draft')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              filterStatus === status
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-12 text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-slate-600 font-medium text-sm sm:text-base">No announcements found</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Create an announcement to get started</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {filteredAnnouncements.map((announcement) => {
            const IconComponent = typeIcon[announcement.type]
            return (
              <div key={announcement.id} className="bg-white rounded-lg border border-slate-200 border-l-4 border-l-indigo-600 p-5 sm:p-6 lg:p-8 hover:border-slate-300 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-start gap-4 sm:gap-5 lg:gap-6">
                  <div className="mt-1 flex-shrink-0">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900 break-words">{announcement.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600 mt-3 sm:mt-3.5 break-words leading-relaxed">{announcement.description}</p>
                    <div className="flex items-center gap-3 mt-4 sm:mt-5 flex-wrap">
                      <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium ${priorityColor[announcement.priority]}`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </span>
                      <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium ${statusColor[announcement.status]}`}>
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </span>
                      {announcement.scheduledFor && (
                        <span className="text-xs sm:text-sm text-slate-500 bg-slate-50 px-3 sm:px-4 py-1.5 rounded-full">
                          {new Date(announcement.scheduledFor).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 flex-shrink-0 mt-1">
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="p-2 sm:p-2.5 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit announcement"
                    >
                      <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(announcement.id)}
                      className="p-2 sm:p-2.5 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Announcement?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAnnouncement(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
