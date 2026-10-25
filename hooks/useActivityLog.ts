'use client'

import { useEffect, useState, useCallback } from 'react'
import { getCredentialManager, ActivityLogEntry, LoginAttempt } from '@/lib/credentialManagementSystem'

export function useActivityLog(adminAccountId?: string, societyId?: string) {
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])
  const [failedLogins, setFailedLogins] = useState<LoginAttempt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const credentialManager = getCredentialManager()

  const loadActivityLogs = useCallback(() => {
    setIsLoading(true)
    try {
      if (adminAccountId) {
        const logs = credentialManager.getActivityLog(adminAccountId, 100)
        setActivityLogs(logs)
      } else if (societyId) {
        const logs = credentialManager.getSocietyActivityLog(societyId, 500)
        setActivityLogs(logs)
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [adminAccountId, societyId, credentialManager])

  const loadFailedLogins = useCallback(() => {
    try {
      const failedAttempts = credentialManager.getFailedLoginAttempts(24)
      setFailedLogins(failedAttempts)
    } catch (error) {
      console.error('Failed to load failed login attempts:', error)
    }
  }, [credentialManager])

  const logAction = useCallback(
    (sessionId: string, actionType: string, description: string, resourceId: string, resourceType: string) => {
      return credentialManager.logAction(sessionId, actionType, description, resourceId, resourceType)
    },
    [credentialManager]
  )

  useEffect(() => {
    loadActivityLogs()
    loadFailedLogins()

    // Refresh logs every 30 seconds
    const interval = setInterval(() => {
      loadActivityLogs()
      loadFailedLogins()
    }, 30000)

    return () => clearInterval(interval)
  }, [loadActivityLogs, loadFailedLogins])

  return {
    activityLogs,
    failedLogins,
    isLoading,
    refresh: loadActivityLogs,
    logAction,
  }
}

export function getActivityTypeIcon(type: string): string {
  switch (type) {
    case 'login':
      return 'LogIn'
    case 'logout':
      return 'LogOut'
    case 'password_change':
      return 'Lock'
    case 'failed_login':
      return 'AlertCircle'
    case 'action':
      return 'CheckCircle'
    default:
      return 'Activity'
  }
}

export function getActivityTypeColor(type: string): string {
  switch (type) {
    case 'login':
      return 'text-green-600 bg-green-50'
    case 'logout':
      return 'text-blue-600 bg-blue-50'
    case 'password_change':
      return 'text-purple-600 bg-purple-50'
    case 'failed_login':
      return 'text-red-600 bg-red-50'
    case 'action':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-slate-600 bg-slate-50'
  }
}

export function getActivityTypeLabel(type: string): string {
  switch (type) {
    case 'login':
      return 'Login'
    case 'logout':
      return 'Logout'
    case 'password_change':
      return 'Password Changed'
    case 'failed_login':
      return 'Failed Login Attempt'
    case 'action':
      return 'Action'
    default:
      return type
  }
}

export function formatActivityTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
