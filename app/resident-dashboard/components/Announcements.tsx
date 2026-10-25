'use client'

import { useState } from 'react'
import { Bell, Calendar, Pin, Trash2, MoreVertical } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  category: 'maintenance' | 'event' | 'update' | 'emergency'
  date: string
  author: string
  isPinned: boolean
  isRead: boolean
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Water Supply Maintenance',
    content: 'Water supply will be disrupted on March 23rd from 8 AM to 2 PM for pipeline maintenance. Please store sufficient water.',
    category: 'maintenance',
    date: '2024-03-22',
    author: 'Society Admin',
    isPinned: true,
    isRead: false,
  },
  {
    id: '2',
    title: 'Annual General Meeting (AGM)',
    content: 'All residents are invited to the Annual General Meeting on March 30th at 5:00 PM in the community hall. Refreshments will be served.',
    category: 'event',
    date: '2024-03-21',
    author: 'Society Admin',
    isPinned: true,
    isRead: false,
  },
  {
    id: '3',
    title: 'Maintenance Fee Payment Due',
    content: 'Q2 maintenance fees are now due. Please pay by March 25th to avoid late charges. Online payment options available.',
    category: 'update',
    date: '2024-03-20',
    author: 'Finance Committee',
    isPinned: false,
    isRead: true,
  },
  {
    id: '4',
    title: 'Garden Area Repair Work',
    content: 'The garden area will undergo beautification and repair work starting April 1st. Expect minimal disruption.',
    category: 'maintenance',
    date: '2024-03-19',
    author: 'Maintenance Team',
    isPinned: false,
    isRead: true,
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'maintenance':
      return 'bg-amber-50 border-amber-200 text-amber-700'
    case 'event':
      return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'update':
      return 'bg-green-50 border-green-200 text-green-700'
    case 'emergency':
      return 'bg-red-50 border-red-200 text-red-700'
    default:
      return 'bg-slate-50 border-slate-200 text-slate-700'
  }
}

const getCategoryLabel = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// export default function Announcements() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const filteredAnnouncements = filterCategory
    ? announcements.filter((a) => a.category === filterCategory)
    : announcements

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned)
  const normalAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned)

  const unreadCount = announcements.filter((a) => !a.isRead).length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Announcements</h2>
        <p className="text-slate-600">Building updates and community news</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filterCategory === null
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          All
        </button>
        {['maintenance', 'event', 'update', 'emergency'].map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 px-1">PINNED</p>
          {pinnedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white border-2 rounded-lg p-4 sm:p-5 space-y-2 relative ${
                announcement.isRead ? 'border-slate-200' : 'border-indigo-300 bg-indigo-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Pin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{announcement.content}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                      announcement.category
                    )}`}
                  >
                    {getCategoryLabel(announcement.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {announcement.date}
                  </span>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Normal Announcements */}
      <div className="space-y-2">
        {normalAnnouncements.length > 0 && pinnedAnnouncements.length > 0 && (
          <p className="text-xs font-semibold text-slate-600 px-1">ALL ANNOUNCEMENTS</p>
        )}
        {normalAnnouncements.length > 0 ? (
          normalAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white border rounded-lg p-4 sm:p-5 space-y-2 ${
                announcement.isRead ? 'border-slate-200' : 'border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{announcement.content}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                      announcement.category
                    )}`}
                  >
                    {getCategoryLabel(announcement.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {announcement.date}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No announcements available</p>
          </div>
        )}
      </div>
    </div>
  )
}
