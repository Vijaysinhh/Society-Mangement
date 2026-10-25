'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Heart, MessageSquare, Share2, Clock, MapPin, Users, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { dataStore } from '@/lib/centralDataStore'
import ResponsiveTabs from './ResponsiveTabs'
import StatusLabel from './StatusLabel'

interface Amenity {
  id: string
  name: string
  description: string
  cost: number
  capacity: number
  availability: string[]
  createdDate: string
  timing?: string
}

interface BookingRequest {
  id: string
  amenityId: string
  amenityName: string
  bookingDate: string
  timeSlot: string
  status: 'pending' | 'approved' | 'awaiting-payment' | 'paid' | 'rejected' | 'cancelled'
  cost: number
  requestDate: string
}

interface BoardPost {
  id: string
  author: string
  unit: string
  timestamp: string
  message: string
  likes: number
  replies: number
  liked: boolean
  type: 'announcement' | 'post'
  category?: 'safety' | 'maintenance' | 'event' | 'general'
  canEdit?: boolean
}

// Mock data - in real app, this would come from admin dashboard
const mockAmenities: Amenity[] = [
  {
    id: 'amenity-001',
    name: 'Community Hall',
    description: 'Large hall for events, parties, and gatherings',
    cost: 1500,
    capacity: 150,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdDate: '2024-01-15'
  },
  {
    id: 'amenity-002',
    name: 'Lawn/Terrace',
    description: 'Open space for outdoor events',
    cost: 800,
    capacity: 100,
    availability: ['Sat', 'Sun'],
    createdDate: '2024-02-10'
  },
  {
    id: 'amenity-003',
    name: 'Meeting Room',
    description: 'Conference room for meetings and discussions',
    cost: 500,
    capacity: 30,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    createdDate: '2024-03-01'
  }
]

const mockBoardPosts: BoardPost[] = [
  {
    id: '1',
    author: 'Priya Singh',
    unit: '301',
    timestamp: '2 hours ago',
    message: 'Community Hall is available this weekend for a birthday party! Join us if interested.',
    likes: 8,
    replies: 3,
    liked: false
  },
  {
    id: '2',
    author: 'Rajesh Patel',
    unit: '405',
    timestamp: '5 hours ago',
    message: 'Great maintenance work on the garden area. Looks amazing now!',
    likes: 12,
    replies: 5,
    liked: false
  },
  {
    id: '3',
    author: 'Anita Verma',
    unit: '202',
    timestamp: '1 day ago',
    message: 'Who wants to organize a fitness group in the community? Let me know!',
    likes: 15,
    replies: 7,
    liked: false
  }
]

const mockMyBookings: BookingRequest[] = [
  {
    id: 'booking-001',
    amenityId: 'amenity-001',
    amenityName: 'Community Hall',
    bookingDate: '2024-04-20',
    timeSlot: '6:00 PM - 10:00 PM',
    status: 'paid',
    cost: 1500,
    requestDate: '2024-03-15'
  },
  {
    id: 'booking-002',
    amenityId: 'amenity-003',
    amenityName: 'Meeting Room',
    bookingDate: '2024-04-10',
    timeSlot: '2:00 PM - 4:00 PM',
    status: 'awaiting-payment',
    cost: 500,
    requestDate: '2024-03-25'
  }
]

const mockAnnouncements = [
  {
    id: '1',
    title: 'Water Supply Maintenance',
    content: 'Water supply will be shut down from 2 AM to 5 AM on Sunday for maintenance work.',
    category: 'maintenance',
    status: 'published',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Community Meeting',
    content: 'Monthly meeting scheduled for next Saturday at 6 PM in Community Hall. All residents welcome!',
    category: 'event',
    status: 'published',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Safety Alert',
    content: 'Please report any suspicious activity to the watchman immediately. Stay safe!',
    category: 'safety',
    status: 'published',
    createdAt: new Date(),
  },
]

function AmenityBookingModal({ amenity, onClose, onSuccess }: {
  amenity: Amenity
  onClose: () => void
  onSuccess: (booking: { amenityId: string; amenityName: string; date: Date; time: string; cost: number }) => void | Promise<void>
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const minimumDate = new Date().toISOString().split('T')[0]
  const submit = async () => {
    if (!date || !time) return toast.error('Please select a date and time slot')
    setSubmitting(true)
    try { await onSuccess({ amenityId: amenity.id, amenityName: amenity.name, date: new Date(`${date}T12:00:00`), time, cost: amenity.cost }) }
    finally { setSubmitting(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between mb-5">
          <div><h3 className="text-lg font-semibold text-slate-900">Book {amenity.name}</h3><p className="text-sm text-slate-600 mt-1">Select your preferred date and time</p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Close booking"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Booking date</label><input type="date" min={minimumDate} value={date} onChange={event => setDate(event.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Time slot</label><input type="text" value={time} onChange={event => setTime(event.target.value)} placeholder={amenity.timing || 'e.g., 6 PM - 8 PM'} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"><span className="text-sm text-slate-600">Booking charge</span><span className="font-bold text-slate-900">₹{amenity.cost}</span></div>
          <div className="flex gap-3"><button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button onClick={submit} disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60">{submitting ? 'Sending...' : 'Request Booking'}</button></div>
        </div>
      </div>
    </div>
  )
}

export default function Community() {
  const [activeTab, setActiveTab] = useState<'board' | 'amenities' | 'mybookings'>('board')
  const [announcements, setAnnouncements] = useState<typeof mockAnnouncements>([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [myBookings, setMyBookings] = useState<BookingRequest[]>([])
  const [currentUnitId, setCurrentUnitId] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostText, setNewPostText] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [lastBookingRef, setLastBookingRef] = useState('')
  const [currentUserUnit, setCurrentUserUnit] = useState('201') // Mock current user unit
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/community/posts')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load community posts')
        return result.data || []
      })
      .then((posts) => {
        if (!cancelled) setBoardPosts(posts.map((post: any) => ({ ...post, timestamp: new Date(post.timestamp).toLocaleDateString() })))
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load community posts', { description: error instanceof Error ? error.message : 'Try again.' })
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all(['/api/amenities', '/api/amenity-bookings', '/api/resident/context'].map(async (url) => {
      const response = await fetch(url); const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load amenity information')
      return result.data
    })).then(([amenityData, bookingData, context]) => {
      if (cancelled) return
      setAmenities(amenityData || [])
      setMyBookings(bookingData || [])
      const unit = context?.assignments?.[0]?.unit
      setCurrentUnitId(unit?.id || '')
      setCurrentUserUnit(unit?.unit_number || '')
    }).catch((error) => {
      if (!cancelled) toast.error('Could not load amenities', { description: error instanceof Error ? error.message : 'Try again.' })
    })
    return () => { cancelled = true }
  }, [])

  // Combine announcements and board posts into unified feed
  const getUnifiedFeed = () => boardPosts

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not delete post')
      setBoardPosts(boardPosts.filter(post => post.id !== postId))
      toast.success('Post deleted', { description: 'Your post has been removed from the board.' })
    } catch (error) {
      toast.error('Could not delete post', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const handleEditPost = async (postId: string, newMessage: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: newMessage }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update post')
      setBoardPosts(boardPosts.map(post => post.id === postId ? { ...post, message: result.data.message } : post))
      setEditingPostId(null)
      setNewPostText('')
      toast.success('Post updated', { description: 'Your post has been updated successfully.' })
    } catch (error) {
      toast.error('Could not update post', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
      case 'approved':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      case 'awaiting-payment':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      case 'paid':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border border-slate-300'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const handleBookAmenity = (amenity: Amenity) => {
    setSelectedAmenity(amenity)
    setShowBookingModal(true)
  }

  const handleSubmitBooking = () => {
    if (!selectedAmenity || !bookingDate || !bookingTime) {
      toast.error('Please fill in all fields', {
        description: 'Select date and time slot to continue booking'
      })
      return
    }

    // Create new booking request with reference number
    const bookingRef = `BK-${Date.now().toString().slice(-6)}`
    const newBooking: BookingRequest = {
      id: `booking-${Date.now()}`,
      amenityId: selectedAmenity.id,
      amenityName: selectedAmenity.name,
      bookingDate: bookingDate,
      timeSlot: bookingTime,
      status: 'pending',
      cost: selectedAmenity.cost,
      requestDate: new Date().toISOString().split('T')[0]
    }

    // Add to myBookings
    setMyBookings([newBooking, ...myBookings])
    
    // Show success screen instead of closing
    setLastBookingRef(bookingRef)
    setShowSuccessScreen(true)
  }

  const handlePostMessage = async () => {
    if (newPostText.trim()) {
      try {
        const response = await fetch('/api/community/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: newPostText }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not create post')
        const newPost: BoardPost = { ...result.data, timestamp: 'now', canEdit: true }
        setBoardPosts([newPost, ...boardPosts])
        setNewPostText('')
        setShowNewPost(false)
      } catch (error) {
        toast.error('Could not create post', { description: error instanceof Error ? error.message : 'Try again.' })
      }
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update like')
      setBoardPosts(boardPosts.map(post => post.id === postId ? { ...post, liked: result.data.liked, likes: result.data.likes } : post))
    } catch (error) {
      toast.error('Could not update like', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(`/api/amenity-bookings/${bookingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not cancel booking')
        setMyBookings(myBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      } catch (error) { toast.error('Could not cancel booking', { description: error instanceof Error ? error.message : 'Try again.' }) }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Community</h2>
        <p className="text-sm text-slate-600 mt-1">Connect with neighbors, book amenities, and participate in community events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase">Upcoming Bookings</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{myBookings.filter(b => b.status !== 'cancelled').length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-600 uppercase">Confirmed</p>
          <p className="text-2xl font-bold text-green-900 mt-2">{myBookings.filter(b => b.status === 'paid').length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-600 uppercase">Available Amenities</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">{amenities.length}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-xs font-semibold text-orange-600 uppercase">Community Posts</p>
          <p className="text-2xl font-bold text-orange-900 mt-2">{boardPosts.filter(post => post.type === 'post').length}</p>
        </div>
      </div>

      {/* Responsive Tabs Navigation */}
      <ResponsiveTabs
        tabs={[
          { id: 'board', label: 'Community Board', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'amenities', label: 'Amenities', icon: <Calendar className="w-5 h-5" /> },
          { id: 'mybookings', label: 'My Bookings', icon: <Clock className="w-5 h-5" /> },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as 'board' | 'amenities' | 'mybookings')}
      />

      {/* Announcements Tab - REMOVED, now integrated into Community Board */}

      {/* Amenities Tab */}
      {activeTab === 'amenities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amenities.map(amenity => (
              <div key={amenity.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{amenity.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{amenity.description}</p>
                
                <div className="space-y-3 mb-5 text-sm text-slate-600 bg-slate-50 -mx-5 px-5 py-3 rounded-b">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Capacity: {amenity.capacity} persons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Available: {amenity.availability.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-900">₹{amenity.cost}</span>
                  <button
                    onClick={() => handleBookAmenity(amenity)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Board Tab - Unified Feed (Announcements + Posts) */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Post New Comment Button - Sticky */}
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-center justify-center"
          >
            <Plus className="w-5 h-5" />
            Post New Comment
          </button>

          {showNewPost && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share something with your community..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Unified Feed - Admin Announcements + Resident Posts */}
          <div className="space-y-3">
            {getUnifiedFeed().map(item => (
              <div
                key={item.id}
                className={`rounded-lg p-4 border ${
                  item.type === 'announcement'
                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'
                    : 'bg-white border-slate-200'
                } hover:shadow-md transition-shadow`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'announcement' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded">
                          📢 Admin Announcement
                        </span>
                      )}
                      {item.type === 'post' && (
                        <p className="font-semibold text-slate-900">{item.author}</p>
                      )}
                    </div>
                    {item.type === 'post' && (
                      <p className="text-xs text-slate-500">Unit {item.unit} • {item.timestamp}</p>
                    )}
                    {item.type === 'announcement' && (
                      <p className="text-xs text-indigo-600 font-medium">Posted {item.timestamp}</p>
                    )}
                  </div>
                  
                  {/* Edit/Delete for own posts */}
                  {item.type === 'post' && item.canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPostId(item.id)}
                        className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeletePost(item.id)}
                        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Message */}
                {editingPostId === item.id ? (
                  <div className="space-y-3">
                    <textarea
                      defaultValue={item.message}
                      onChange={(e) => setNewPostText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditPost(item.id, newPostText)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`mb-3 ${item.type === 'announcement' ? 'text-slate-800 font-medium' : 'text-slate-700'}`}>
                    {item.message}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-4 text-sm text-slate-600 pt-3 border-t border-slate-200 mt-3">
                  <button
                    onClick={() => toggleLike(item.id)}
                    className="flex items-center gap-2 hover:text-red-600 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${item.liked ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{item.replies}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'mybookings' && (
        <div className="space-y-3">
          {myBookings.length > 0 ? (
            myBookings.map(booking => (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{booking.amenityName}</h4>
                    <p className="text-sm text-slate-600 mt-1">{booking.bookingDate} • {booking.timeSlot}</p>
                  </div>
                  <StatusLabel status={booking.status as any} size="sm" />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-slate-900">₹{booking.cost}</p>
                  {booking.status !== 'paid' && booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {booking.status === 'awaiting-payment' && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm space-y-2">
                    <p className="text-orange-700 font-semibold">Payment Pending</p>
                    <p className="text-orange-700 text-xs">Please make payment using society QR code to confirm this booking.</p>
                    <button 
                      onClick={() => {
                        toast.success("Payment notification sent to admin", {
                          description: "Your booking will be confirmed once admin verifies the payment."
                        })
                      }}
                      className="w-full px-3 py-2 mt-2 bg-orange-600 text-white rounded font-semibold text-xs hover:bg-orange-700 transition-colors"
                    >
                      I&apos;ve Made Payment →
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-600">
              <p>No bookings yet. Book an amenity to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Booking Flow - Step-by-step with Calendar Picker */}
      {showBookingModal && selectedAmenity && (
        <AmenityBookingModal
          amenity={selectedAmenity}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedAmenity(null)
            setBookingDate('')
            setBookingTime('')
          }}
          onSuccess={async (booking) => {
            try {
              if (!currentUnitId) throw new Error('No active property is assigned to your account')
              const response = await fetch('/api/amenity-bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amenityId: booking.amenityId, unitId: currentUnitId, bookingDate: booking.date?.toISOString().split('T')[0], timeSlot: booking.time }) })
              const result = await response.json()
              if (!response.ok) throw new Error(result.error || 'Could not create booking')
              setMyBookings([result.data, ...myBookings])
              setShowBookingModal(false)
              setSelectedAmenity(null)
              setActiveTab('mybookings')
              toast.success('Booking request sent', { description: 'Management will review your request.' })
            } catch (error) { toast.error('Could not book amenity', { description: error instanceof Error ? error.message : 'Try again.' }) }
          }}
        />
      )}
    </div>
  )
}
