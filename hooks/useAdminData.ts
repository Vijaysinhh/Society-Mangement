import { usePolling } from './usePolling'

export interface Resident {
  id: string
  name: string
  email: string
  property: string
  phone: string
  status: 'active' | 'inactive'
}

export interface BillRecord {
  id: string
  resident: string
  property: string
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  paidDate?: string
}

export interface PaymentPending {
  id: string
  residentName: string
  billAmount: number
  daysOverdue: number
  paymentId: string
  status: 'pending' | 'confirmed'
}

export interface ComplaintAdmin {
  id: string
  resident: string
  property: string
  title: string
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

export interface WatchmanSchedule {
  id: string
  watchmanName: string
  day: string
  startTime: string
  endTime: string
  area: string
}

export interface SocietyFinancials {
  totalCollected: number
  totalExpenses: number
  balance: number
  period: string
}

export function useResidents() {
  const { data: residents = [], loading, error, refetch } = usePolling<Resident[]>(
    '/api/residents',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { residents, loading, error, refetch }
}

export function useBillsAdmin() {
  const { data: bills = [], loading, error, refetch } = usePolling<BillRecord[]>(
    '/api/bills',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { bills, loading, error, refetch }
}

export function usePendingPayments() {
  const { data: payments = [], loading, error, refetch } = usePolling<PaymentPending[]>(
    '/api/bills/pending-payments',
    {
      pollInterval: 20000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { payments, loading, error, refetch }
}

export function useComplaintsAdmin() {
  const { data: complaints = [], loading, error, refetch } = usePolling<ComplaintAdmin[]>(
    '/api/complaints',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { complaints, loading, error, refetch }
}

export function useWatchmanSchedules() {
  const { data: schedules = [], loading, error, refetch } = usePolling<WatchmanSchedule[]>(
    '/api/watchmen/duty',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { schedules, loading, error, refetch }
}

export function useFinancialsAdmin() {
  const { data: financials, loading, error, refetch } = usePolling<SocietyFinancials>(
    '/api/financial',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { financials, loading, error, refetch }
}

export function useVisitorRequests() {
  const { data: visitors = [], loading, error, refetch } = usePolling(
    '/api/visitors',
    {
      pollInterval: 15000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { visitors, loading, error, refetch }
}

export function useAmenityBookingsAdmin() {
  const { data: bookings = [], loading, error, refetch } = usePolling(
    '/api/amenities/bookings',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { bookings, loading, error, refetch }
}

export function useAmenitiesAdmin() {
  const { data: amenities = [], loading, error, refetch } = usePolling(
    '/api/amenities',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { amenities, loading, error, refetch }
}

export function useParcelsAdmin() {
  const { data: parcels = [], loading, error, refetch } = usePolling(
    '/api/parcels',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'admin',
      },
    }
  )

  return { parcels, loading, error, refetch }
}
