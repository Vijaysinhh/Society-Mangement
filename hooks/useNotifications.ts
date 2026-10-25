'use client'

import { useState, useCallback, useEffect } from 'react'
import { dataStore } from '@/lib/centralDataStore'

interface Notification {
  id: string
  type: 'issue-update' | 'status-changed' | 'work-started' | 'completed' | 'info' | 'visitor-approved' | 'bill-created' | 'payment-recorded' | 'emergency' | 'announcement'
  title: string
  message: string
  issueId?: string
  issueName?: string
  status?: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setNotifications(prev => [newNotification, ...prev])
    return newNotification
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationsByStatus = (status: string) => {
    return notifications.filter(n => n.status === status)
  }

  // Subscribe to dataStore events
  useEffect(() => {
    // Issue updates
      addNotification({
        type: 'issue-update',
        title: 'New Issue Created',
        message: `Your issue "${issue.title}" has been created and assigned to our team.`,
        issueId: issue.id,
        issueName: issue.title,
        status: 'created',
        read: false
      })
    })

      addNotification({
        type: 'status-changed',
        title: `Issue Status Updated: ${issue.status.toUpperCase()}`,
        message: `Your issue "${issue.title}" status has been updated.`,
        issueId: issue.id,
        issueName: issue.title,
        status: issue.status,
        read: false
      })
    })

    // Visitor approvals
      addNotification({
        type: 'visitor-approved',
        title: 'Visitor Approved',
        message: `Your approval for "${visitor.name}" has been confirmed with the watchman.`,
        status: 'approved',
        read: false
      })
    })

    // Bills and payments
      addNotification({
        type: 'bill-created',
        title: 'New Bill Generated',
        message: `A new bill of ₹${bill.amount} for "${bill.category}" is due on ${bill.dueDate}`,
        read: false
      })
    })

      addNotification({
        type: 'payment-recorded',
        title: 'Payment Received',
        message: `Payment of ₹${payment.amount} has been successfully recorded.`,
        status: 'completed',
        read: false
      })
    })

    // Announcements
      addNotification({
        type: 'announcement',
        title: announcement.title,
        message: announcement.content,
        read: false
      })
    })

      addNotification({
        type: 'emergency',
        message: `${emergency.type.toUpperCase()}: ${emergency.description}`,
        status: 'urgent',
        read: false
      })
    })

    return () => {
      unsubIssueAdded()
      unsubIssueUpdated()
      unsubVisitorApproved()
      unsubBillAdded()
      unsubPaymentRecorded()
      unsubAnnouncementAdded()
    }
  }, [addNotification])

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount,
    getNotificationsByStatus
  }
}

export type { Notification }
