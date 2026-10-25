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
type AdminAlert = { id: string; type: 'action-needed' | 'upcoming' | 'milestone' | 'success' | 'overdue'; severity: 'critical' | 'high' | 'medium' | 'low'; unit: string; owner: string; amount?: number; daysOverdue?: number; message: string; date: string; read?: boolean }

export default function SocietyAdminPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>('dashboard')
  const [societyId, setSocietyId] = useState('')
  const [societyName, setSocietyName] = useState('Loading society...')
  const [contextError, setContextError] = useState('')
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [alerts, setAlerts] = useState<AdminAlert[]>([])

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

    fetch('/api/society-admin/notifications', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load notifications')
        return result.data
      })
      .then((data) => {
        if (!cancelled) {
          setAlerts(data.alerts || [])
          setNotificationCount(data.unreadCount || 0)
        }
      })
      .catch((error) => { if (!cancelled) console.error('[Notifications] Load failed:', error) })

    const handleMaintenanceSync = () => setView((current) => current)
    window.addEventListener('maintenanceFeeSync', handleMaintenanceSync)
    return () => {
      cancelled = true
      window.removeEventListener('maintenanceFeeSync', handleMaintenanceSync)
    }
  }, [])

  const handleMarkAlertAsRead = async (alertId: string) => {
    const target = alerts.find((alert) => alert.id === alertId)
    if (!target || target.read) return
    const response = await fetch('/api/society-admin/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: alertId }) })
    if (!response.ok) return
    setAlerts((current) => current.map((alert) => alert.id === alertId ? { ...alert, read: true } : alert))
    setNotificationCount((current) => Math.max(0, current - 1))
  }

  const handleMarkAllAlertsAsRead = async () => {
    const response = await fetch('/api/society-admin/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
    if (!response.ok) return
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
