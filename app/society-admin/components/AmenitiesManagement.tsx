'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, Download, X } from 'lucide-react'

interface AmenitySpace {
  id: string
  name: string
  description: string
  cost: number
  capacity: number
  availability: string[]
  createdDate: string
}

interface BookingRequest {
  id: string
  amenityId: string
  amenityName: string
  residentName: string
  unitNo: string
  bookingDate: string
  timeSlot: string
  status: 'pending' | 'approved' | 'awaiting-payment' | 'paid' | 'rejected' | 'cancelled'
  cost: number
  requestDate: string
}

const mockAmenities: AmenitySpace[] = [
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

const mockBookings: BookingRequest[] = [
  {
    id: 'booking-001',
    amenityId: 'amenity-001',
    amenityName: 'Community Hall',
    residentName: 'Rajesh Kumar',
    unitNo: '402',
    bookingDate: '2024-04-15',
    timeSlot: '6:00 PM - 10:00 PM',
    status: 'pending',
    cost: 1500,
    requestDate: '2024-03-28'
  },
  {
    id: 'booking-002',
    amenityId: 'amenity-002',
    amenityName: 'Lawn/Terrace',
    residentName: 'Priya Singh',
    unitNo: '305',
    bookingDate: '2024-04-20',
    timeSlot: '10:00 AM - 2:00 PM',
    status: 'approved',
    cost: 800,
    requestDate: '2024-03-25'
  },
  {
    id: 'booking-003',
    amenityId: 'amenity-001',
    amenityName: 'Community Hall',
    residentName: 'Amit Patel',
    unitNo: '501',
    bookingDate: '2024-05-10',
    timeSlot: '7:00 PM - 11:00 PM',
    status: 'awaiting-payment',
    cost: 1500,
    requestDate: '2024-03-20'
  },
  {
    id: 'booking-004',
    amenityId: 'amenity-003',
    amenityName: 'Meeting Room',
    residentName: 'Neha Gupta',
    unitNo: '203',
    bookingDate: '2024-04-05',
    timeSlot: '2:00 PM - 4:00 PM',
    status: 'paid',
    cost: 500,
    requestDate: '2024-03-18'
  }
]

export default function AmenitiesManagement() {
  const [amenities, setAmenities] = useState(mockAmenities)
  const [bookings, setBookings] = useState(mockBookings)
  const [activeTab, setActiveTab] = useState<'spaces' | 'bookings'>('spaces')
  const [showAddForm, setShowAddForm] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'approved':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'awaiting-payment':
        return 'bg-orange-50 border-orange-200 text-orange-700'
      case 'paid':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'cancelled':
        return 'bg-slate-50 border-slate-200 text-slate-700'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

  const handleApproveBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'awaiting-payment' as const } : b)
    )
  }

  const handleRejectBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' as const } : b)
    )
  }

  const handleMarkPaymentReceived = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'paid' as const } : b)
    )
  }

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
    )
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const approvedBookings = bookings.filter(b => b.status === 'approved')
  const awaitingPaymentBookings = bookings.filter(b => b.status === 'awaiting-payment')
  const paidBookings = bookings.filter(b => b.status === 'paid')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('spaces')}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === 'spaces'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Manage Spaces
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Booking Requests
        </button>
      </div>

      {/* Manage Spaces Tab */}
      {activeTab === 'spaces' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add New Space
          </button>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-slate-900">Add New Amenity Space</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Space Name" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Description" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Cost (₹)" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Capacity (persons)" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Space</button>
              </div>
            </div>
          )}

          {/* Spaces List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amenities.map(space => (
              <div key={space.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{space.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{space.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Cost: <span className="font-semibold text-slate-900">₹{space.cost}</span></p>
                  <p>Capacity: <span className="font-semibold text-slate-900">{space.capacity} persons</span></p>
                  <p>Available: <span className="font-semibold text-slate-900">{space.availability.join(', ')}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Requests Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-yellow-600">Pending Approval ({pendingBookings.length})</h3>
              {pendingBookings.map(booking => (
                <div key={booking.id} className={`border rounded-lg p-4 ${getStatusColor(booking.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.amenityName}</h4>
                      <p className="text-sm">{booking.residentName} (Unit {booking.unitNo})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{booking.cost}</p>
                      <p className="text-xs mt-1">{booking.bookingDate}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{booking.timeSlot}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveBooking(booking.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded font-semibold text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Awaiting Payment */}
          {awaitingPaymentBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-orange-600">Awaiting Payment ({awaitingPaymentBookings.length})</h3>
              {awaitingPaymentBookings.map(booking => (
                <div key={booking.id} className={`border rounded-lg p-4 ${getStatusColor(booking.status)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.amenityName}</h4>
                      <p className="text-sm">{booking.residentName} (Unit {booking.unitNo})</p>
                      <p className="text-xs mt-1">QR Code Sent for Payment: ₹{booking.cost}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{booking.cost}</p>
                      <p className="text-xs mt-1">{booking.bookingDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkPaymentReceived(booking.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded font-semibold text-sm hover:bg-green-700"
                    >
                      Mark Payment Received
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded font-semibold text-sm hover:bg-slate-700"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approved Bookings */}
          {approvedBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-blue-600">Approved ({approvedBookings.length})</h3>
              {approvedBookings.map(booking => (
                <div key={booking.id} className={`border rounded-lg p-4 ${getStatusColor(booking.status)}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.amenityName}</h4>
                      <p className="text-sm">{booking.residentName} (Unit {booking.unitNo})</p>
                      <p className="text-xs mt-1">{booking.bookingDate} • {booking.timeSlot}</p>
                    </div>
                    <p className="text-xl font-bold">₹{booking.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paid/Confirmed Bookings */}
          {paidBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-green-600">Confirmed ({paidBookings.length})</h3>
              {paidBookings.map(booking => (
                <div key={booking.id} className={`border rounded-lg p-4 ${getStatusColor(booking.status)}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.amenityName}</h4>
                      <p className="text-sm">{booking.residentName} (Unit {booking.unitNo})</p>
                      <p className="text-xs mt-1">{booking.bookingDate} • {booking.timeSlot}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{booking.cost}</p>
                      <p className="text-xs">Payment Confirmed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
