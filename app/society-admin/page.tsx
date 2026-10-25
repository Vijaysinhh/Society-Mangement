'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from './components/AdminLayout'
import DashboardMobile from './components/DashboardMobile'
import PropertyResidentsUnified from './components/PropertyResidentsUnified'
import FinancesMobile from './components/FinancesMobile'
import IssuesMobile from './components/IssuesMobile'
import WatchmanMobile from './components/WatchmanMobile'
import VisitorsMobile from './components/VisitorsMobile'
import ScheduleMobile from './components/ScheduleMobile'
import CommunityMobile from './components/CommunityMobile'
import ProfileMobile from './components/ProfileMobile'
import NotificationPanel from '@/components/NotificationPanel'

type ViewType = 'dashboard' | 'properties' | 'finances' | 'issues' | 'watchman' | 'visitors' | 'schedule' | 'community' | 'profile'

export default function SocietyAdminPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>('dashboard')
  const [societyId, setSocietyId] = useState('')
  const [societyName, setSocietyName] = useState('Loading society...')
  const [contextError, setContextError] = useState('')
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [unreadAlerts, setUnreadAlerts] = useState<Set<string>>(new Set(['1', '2', '3']))

  const [alerts, setAlerts] = useState([
    { id: '1', type: 'action-needed' as const, severity: 'high' as const, unit: '104', owner: 'Sarah Williams', amount: 35000, daysOverdue: 45, message: 'Unit 104 - Payment Due: ₹35,000 (45 days past due) - Reach out to Sarah', date: '2026-02-27', read: false },
    { id: '2', type: 'action-needed' as const, severity: 'high' as const, unit: '102', owner: 'Priya Singh', amount: 22000, daysOverdue: 28, message: 'Unit 102 - Payment Due: ₹22,000 (28 days past due) - Send friendly reminder to Priya', date: '2026-02-14', read: false },
    { id: '3', type: 'action-needed' as const, severity: 'high' as const, unit: '201', owner: 'Michael Chen', amount: 20000, daysOverdue: 52, message: 'Unit 201 - Payment Due: ₹20,000 (52 days past due) - Follow up with Michael', date: '2026-01-20', read: false },
    { id: '4', type: 'upcoming' as const, severity: 'medium' as const, unit: '105', owner: 'David Brown', amount: 6000, message: 'Unit 105 - Payment Due in 3 Days: ₹6,000 - Courtesy notice for David', date: '2026-03-16', read: true },
    { id: '5', type: 'success' as const, severity: 'low' as const, unit: '101', owner: 'Rajesh Kumar', amount: 5000, message: 'Unit 101 - Payment Received: ₹5,000 confirmed. Thank you Rajesh!', date: '2026-03-13', read: true },
    { id: '6', type: 'milestone' as const, severity: 'low' as const, unit: '103', owner: 'Amit Patel', message: 'Unit 103 - Q1 2026 maintenance fees fully paid', date: '2026-03-12', read: true },
    { id: '7', type: 'upcoming' as const, severity: 'medium' as const, unit: '202', owner: 'Jennifer Lee', amount: 6000, message: 'Unit 202 - Payment Due in 5 Days: ₹6,000 - Gentle reminder for Jennifer', date: '2026-03-18', read: true },
  ])

  useEffect(() => {
    let cancelled = false
    fetch('/api/society-admin/context')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not load society')
        return result.data
      })
      .then((context) => {
        if (cancelled) return
        setSocietyId(context.society.id)
        setSocietyName(context.society.name)
      })
      .catch((error) => {
        if (!cancelled) setContextError(error instanceof Error ? error.message : 'Could not load society')
      })

    const handleMaintenanceSync = () => setView((current) => current)
    window.addEventListener('maintenanceFeeSync', handleMaintenanceSync)
    return () => {
      cancelled = true
      window.removeEventListener('maintenanceFeeSync', handleMaintenanceSync)
    }
  }, [])

  const handleMarkAlertAsRead = (alertId: string) => {
    setUnreadAlerts((current) => {
      const next = new Set(current)
      next.delete(alertId)
      return next
    })
    setAlerts((current) => current.map((alert) => alert.id === alertId ? { ...alert, read: true } : alert))
    setNotificationCount((current) => Math.max(0, current - 1))
  }

  const handleMarkAllAlertsAsRead = () => {
    setUnreadAlerts(new Set())
    setAlerts((current) => current.map((alert) => ({ ...alert, read: true })))
    setNotificationCount(0)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/admin-login')
    router.refresh()
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <DashboardMobile societyId={societyId} />
      case 'properties': return <PropertyResidentsUnified societyId={societyId} />
      case 'finances': return <FinancesMobile societyId={societyId} />
      case 'issues': return <IssuesMobile />
      case 'watchman': return <WatchmanMobile />
      case 'visitors': return <VisitorsMobile societyId={societyId} />
      case 'schedule': return <ScheduleMobile />
      case 'community': return <CommunityMobile />
      case 'profile': return <ProfileMobile onLogout={handleLogout} />
      default: return <DashboardMobile societyId={societyId} />
    }
  }

  return (
    <AdminLayout
      currentView={view}
      onNavigate={setView}
      societyName={societyName}
      notificationCount={notificationCount}
      onNotificationClick={() => setShowNotificationPanel((open) => !open)}
      onProfileClick={() => setView('profile')}
      onSearch={(query) => console.log('[v0] Searching for:', query)}
    >
      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAlertAsRead}
        onMarkAllAsRead={handleMarkAllAlertsAsRead}
      />
      <div className="space-y-6 pb-8">
        {contextError ? (
          <div role="alert" className="mx-4 mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:mx-6 lg:mx-8">{contextError}. Sign out and log in again.</div>
        ) : societyId ? (
          <div className="px-4 pb-8 sm:px-6 lg:px-8">{renderContent()}</div>
        ) : (
          <div role="status" className="px-4 py-10 text-sm text-slate-600 sm:px-6 lg:px-8">Loading your society workspace...</div>
        )}
      </div>
    </AdminLayout>
  )
}
