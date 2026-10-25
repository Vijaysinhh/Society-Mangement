import { useEffect, useState } from 'react'
import { usePolling } from './usePolling'

export interface Bill {
  id: string
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  type: string
}

export interface Complaint {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  responses?: string[]
}

export interface Visitor {
  id: string
  name: string
  phone: string
  visitDate: string
  visitTime: string
  property: string
  status: 'pending_approval' | 'approved' | 'rejected'
}

export interface Amenity {
  id: string
  name: string
  description: string
  availability: string[]
  cost: number
  capacity: number
}

export interface AmenityBooking {
  id: string
  amenityName: string
  bookingDate: string
  timeSlot: string
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  cost: number
}

export function useBills() {
  const { data, loading, error, refetch } = usePolling<Bill[]>(
    '/api/bills',
    {
      pollInterval: 30000, // Poll every 30 seconds
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  const bills = Array.isArray(data) ? data : []
  return { bills, loading, error, refetch }
}

export function useComplaints() {
  const { data: complaints = [], loading, error, refetch } = usePolling<Complaint[]>(
    '/api/complaints',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { complaints, loading, error, refetch }
}

export function useVisitors() {
  const { data: visitors = [], loading, error, refetch } = usePolling<Visitor[]>(
    '/api/visitors',
    {
      pollInterval: 20000, // More frequent for real-time visitor status
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { visitors, loading, error, refetch }
}

export function useAmenities() {
  const { data: amenities = [], loading, error, refetch } = usePolling<Amenity[]>(
    '/api/amenities',
    {
      pollInterval: 60000, // Poll every minute for amenities
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { amenities, loading, error, refetch }
}

export function useAmenityBookings() {
  const { data: bookings = [], loading, error, refetch } = usePolling<AmenityBooking[]>(
    '/api/amenities/bookings',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { bookings, loading, error, refetch }
}

export function useFinancialData() {
  const { data: financialData, loading, error, refetch } = usePolling(
    '/api/financial',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { financialData, loading, error, refetch }
}

export function useAnnouncements() {
  const { data: announcements = [], loading, error, refetch } = usePolling(
    '/api/announcements',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { announcements, loading, error, refetch }
}

export function useMessages() {
  const { data: messages = [], loading, error, refetch } = usePolling(
    '/api/messages',
    {
      pollInterval: 15000, // More frequent for messages
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { messages, loading, error, refetch }
}

export function useParcels() {
  const { data: parcels = [], loading, error, refetch } = usePolling(
    '/api/parcels',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'resident',
      },
    }
  )

  return { parcels, loading, error, refetch }
}
