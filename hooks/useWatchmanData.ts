import { usePolling } from './usePolling'

export interface VisitorLog {
  id: string
  visitorName: string
  property: string
  checkInTime: string
  checkOutTime?: string
  status: 'pending_approval' | 'approved' | 'rejected'
  residentDecision?: 'approved' | 'rejected'
  purpose?: string
}

export interface DutyLog {
  id: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'leave'
  duration?: number
}

export interface Blacklisted {
  id: string
  visitorName: string
  phone?: string
  reason: string
  scope: 'unit_only' | 'society_wide'
  addedDate: string
}

export interface EmergencyAlert {
  id: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location?: string
  createdAt: string
  status: 'active' | 'resolved'
}

export function useVisitorLogs() {
  const { data: visitors = [], loading, error, refetch } = usePolling<VisitorLog[]>(
    '/api/visitors',
    {
      pollInterval: 15000, // Frequent polling for visitor logs
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'watchman',
      },
    }
  )

  return { visitors, loading, error, refetch }
}

export function useDutyLogs() {
  const { data: dutyLogs = [], loading, error, refetch } = usePolling<DutyLog[]>(
    '/api/watchmen/duty-logs',
    {
      pollInterval: 30000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'watchman',
      },
    }
  )

  return { dutyLogs, loading, error, refetch }
}

export function useBlacklist() {
  const { data: blacklisted = [], loading, error, refetch } = usePolling<Blacklisted[]>(
    '/api/blacklist',
    {
      pollInterval: 60000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'watchman',
      },
    }
  )

  return { blacklisted, loading, error, refetch }
}

export function useEmergencyAlerts() {
  const { data: alerts = [], loading, error, refetch } = usePolling<EmergencyAlert[]>(
    '/api/emergency',
    {
      pollInterval: 5000, // Very frequent for emergency alerts
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'watchman',
      },
    }
  )

  return { alerts, loading, error, refetch }
}

export function useParcelsWatchman() {
  const { data: parcels = [], loading, error, refetch } = usePolling(
    '/api/parcels',
    {
      pollInterval: 20000,
      headers: {
        'x-user-id': localStorage.getItem('user_id') || '',
        'x-society-id': localStorage.getItem('society_id') || '',
        'x-user-role': 'watchman',
      },
    }
  )

  return { parcels, loading, error, refetch }
}
