'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Clock, IndianRupee, CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight, X, ToggleLeft, ToggleRight } from 'lucide-react'

interface AmenitiesBookingsTabProps {
  searchTerm: string
  filters: {
    searchTerm: string
    dateFrom?: string
    dateTo?: string
  }
}

interface Amenity { id: string; name: string; timing: string; price: number; status: 'active' | 'inactive' }
interface Booking { id: string; amenityId: string; amenityName: string; property: string; owner: string; date: string; timeSlot: string; amount: number; status: 'pending' | 'approved' | 'rejected' | 'cancelled'; paymentStatus: 'unpaid' | 'paid' }

export default function AmenitiesBookingsTab({ searchTerm, filters }: AmenitiesBookingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'manage' | 'bookings'>('manage')
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showAmenityModal, setShowAmenityModal] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [amenityForm, setAmenityForm] = useState({ name: '', timing: '', price: '' })
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    let cancelled = false
    Promise.all(['/api/amenities', '/api/amenity-bookings'].map(async (url) => {
      const result = await fetch(url).then(res => res.json().then(body => ({ ok: res.ok, body })))
      if (!result.ok) throw new Error(result.body.error || 'Could not load amenities')
      return result.body.data || []
    })).then(([amenityData, bookingData]) => {
      if (!cancelled) { setAmenities(amenityData); setBookings(bookingData.map((booking: any) => ({ ...booking, status: booking.bookingStatus || booking.status }))) }
    }).catch((error) => { if (!cancelled) alert(error instanceof Error ? error.message : 'Could not load amenities') })
    return () => { cancelled = true }
  }, [])

  // Filter amenities by search
  const filteredAmenities = amenities.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter bookings by search
  const filteredBookings = bookings.filter(b =>
    b.amenityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.owner.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingBookings = filteredBookings.filter(b => b.status === 'pending')
  const approvedBookings = filteredBookings.filter(b => b.status === 'approved')

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter(b => b.date === dateStr)
  }

  const handleAddAmenity = () => {
    setEditingAmenity(null)
    setAmenityForm({ name: '', timing: '', price: '' })
    setShowAmenityModal(true)
  }

  const handleEditAmenity = (amenity: Amenity) => {
    setEditingAmenity(amenity)
    setAmenityForm({ name: amenity.name, timing: amenity.timing, price: amenity.price.toString() })
    setShowAmenityModal(true)
  }

  const handleSaveAmenity = async () => {
    try {
      const response = await fetch(editingAmenity ? `/api/amenities/${editingAmenity.id}` : '/api/amenities', { method: editingAmenity ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...amenityForm, price: Number(amenityForm.price) }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save amenity')
      setAmenities(editingAmenity ? amenities.map(a => a.id === editingAmenity.id ? result.data : a) : [...amenities, result.data])
      setShowAmenityModal(false)
    } catch (error) { alert(error instanceof Error ? error.message : 'Could not save amenity') }
  }

  const handleDeleteAmenity = async (id: string) => {
    if (confirm('Are you sure you want to delete this amenity?')) {
      const response = await fetch(`/api/amenities/${id}`, { method: 'DELETE' }); const result = await response.json()
      if (!response.ok) return alert(result.error || 'Could not delete amenity')
      setAmenities(amenities.filter(a => a.id !== id))
    }
  }

  const handleToggleStatus = async (id: string) => {
    const amenity = amenities.find(a => a.id === id); if (!amenity) return
    const response = await fetch(`/api/amenities/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: amenity.status === 'active' ? 'inactive' : 'active' }) }); const result = await response.json()
    if (!response.ok) return alert(result.error || 'Could not update amenity')
    setAmenities(amenities.map(a => a.id === id ? result.data : a))
  }

  const updateBooking = async (id: string, body: object) => {
    const response = await fetch(`/api/amenity-bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const result = await response.json()
    if (!response.ok) return alert(result.error || 'Could not update booking')
    setBookings(bookings.map(b => b.id === id ? { ...b, status: result.data.bookingStatus, paymentStatus: result.data.paymentStatus } : b))
  }

  const handleApproveBooking = (id: string) => updateBooking(id, { status: 'approved' })

  const handleRejectBooking = (id: string) => updateBooking(id, { status: 'rejected' })

  const handleMarkPaid = (id: string) => updateBooking(id, { paymentStatus: 'paid' })

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Sub-tabs */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveSubTab('manage')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeSubTab === 'manage'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manage
        </button>
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeSubTab === 'bookings'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Manage Amenities */}
      {activeSubTab === 'manage' && (
        <div className="space-y-4">
          <button
            onClick={handleAddAmenity}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Amenity
          </button>

          <div className="space-y-3">
            {filteredAmenities.map((amenity) => (
              <div
                key={amenity.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                  amenity.status === 'inactive' ? 'border-slate-200 opacity-60' : 'border-slate-100'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{amenity.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        amenity.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {amenity.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(amenity.id)}
                      className="text-slate-400 hover:text-purple-600"
                    >
                      {amenity.status === 'active' ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{amenity.timing}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <span>₹{amenity.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAmenity(amenity)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAmenity(amenity.id)}
                      className="px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredAmenities.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>No amenities found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6">
          {/* Calendar View */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h4 className="text-sm font-semibold text-slate-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                  const day = i + 1
                  const dayBookings = getBookingsForDate(day)
                  const hasPending = dayBookings.some(b => b.status === 'pending')
                  const hasApproved = dayBookings.some(b => b.status === 'approved')

                  return (
                    <div
                      key={day}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                        dayBookings.length > 0 ? 'bg-purple-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={dayBookings.length > 0 ? 'font-medium text-purple-700' : 'text-slate-700'}>
                        {day}
                      </span>
                      {dayBookings.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {hasApproved && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-600">Approved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          {pendingBookings.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Pending Approvals ({pendingBookings.length})</span>
              </div>
              <div className="divide-y divide-slate-100">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{booking.amenityName}</p>
                        <p className="text-xs text-slate-500">{booking.property} - {booking.owner}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">₹{booking.amount}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{booking.date}</span>
                      <span>•</span>
                      <span>{booking.timeSlot}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveBooking(booking.id)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Bookings */}
          {approvedBookings.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Approved Bookings ({approvedBookings.length})</span>
              </div>
              <div className="divide-y divide-slate-100">
                {approvedBookings.map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{booking.amenityName}</p>
                      <p className="text-xs text-slate-500">{booking.property} • {booking.date} • {booking.timeSlot}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">₹{booking.amount}</p>
                      {booking.paymentStatus === 'unpaid' ? (
                        <button
                          onClick={() => handleMarkPaid(booking.id)}
                          className="text-xs text-amber-600 underline"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-green-600">Paid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Amenity Modal */}
      {showAmenityModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAmenityModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
              </h3>
              <button onClick={() => setShowAmenityModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amenity Name</label>
                <input
                  type="text"
                  value={amenityForm.name}
                  onChange={(e) => setAmenityForm({ ...amenityForm, name: e.target.value })}
                  placeholder="e.g., Community Hall"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timing</label>
                <input
                  type="text"
                  value={amenityForm.timing}
                  onChange={(e) => setAmenityForm({ ...amenityForm, timing: e.target.value })}
                  placeholder="e.g., 8 AM - 10 PM"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={amenityForm.price}
                  onChange={(e) => setAmenityForm({ ...amenityForm, price: e.target.value })}
                  placeholder="e.g., 2000"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleSaveAmenity}
                disabled={!amenityForm.name || !amenityForm.timing || !amenityForm.price}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 rounded-lg text-white font-medium"
              >
                {editingAmenity ? 'Save Changes' : 'Add Amenity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
