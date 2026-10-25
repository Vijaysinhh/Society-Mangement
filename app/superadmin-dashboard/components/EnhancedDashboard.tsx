'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { BarChart3, Home, Users, Settings, AlertCircle, Building2, X, Search, FileText, Shield, Bell } from 'lucide-react'
import MobileLayout from '@/components/MobileLayout'

// Import tab components
import OverviewTab from './tabs/OverviewTab'
import SocietiesTab from './tabs/SocietiesTab'
import AnalyticsTab from './tabs/AnalyticsTab'
import AlertsTab from './tabs/AlertsTab'
import SettingsTab from './tabs/SettingsTab'
import GlobalSearchTab from './tabs/GlobalSearchTab'
import ReportsTab from './tabs/ReportsTab'
import AuditLogTab from './AuditLogTab'

type TabType = 'overview' | 'societies' | 'analytics' | 'alerts' | 'settings' | 'search' | 'reports' | 'audit'

const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
  { id: 'societies', label: 'Societies', icon: <Building2 className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertCircle className="w-5 h-5" /> },
  { id: 'audit', label: 'Audit Log', icon: <Shield className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
]

export default function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Duplicate Email', message: 'Society admin email already exists in system', severity: 'critical', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: 2, title: 'New Society Created', message: 'Soni City Apartments society created successfully', severity: 'info', timestamp: new Date(Date.now() - 7200000), read: false },
    { id: 3, title: 'System Maintenance', message: 'Database backup completed successfully', severity: 'info', timestamp: new Date(Date.now() - 86400000), read: true },
  ])
  const [unreadAlerts, setUnreadAlerts] = useState(new Set([1, 2]))
  const notificationCount = unreadAlerts.size
  const { getDashboardMetrics } = useData()

  let metrics
  try {
    metrics = getDashboardMetrics()
  } catch (error) {
    console.log('[v0] Error getting metrics:', error)
    metrics = {
      totalSocieties: 0,
      activeSocieties: 0,
      totalUnits: 0,
      villaCount: 0,
      bungalowCount: 0,
      flatCount: 0,
      totalResidents: 0,
      totalWatchmen: 0,
      totalAdmins: 0,
      todayCheckIns: 0,
      activeVisitors: 0,
      totalVisitors: 0,
      pausedSocieties: 0,
      averageVisitorsPerDay: 0,
    }
  }

  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'overview':
          return <OverviewTab metrics={metrics} />
        case 'search':
          return <GlobalSearchTab />
        case 'societies':
          return <SocietiesTab />
        case 'analytics':
          return <AnalyticsTab />
        case 'reports':
          return <ReportsTab />
        case 'audit':
          return <AuditLogTab />
        case 'alerts':
          return <AlertsTab />
        case 'settings':
          return <SettingsTab />
        default:
          return <OverviewTab metrics={metrics} />
      }
    } catch (error) {
      console.log('[v0] Error rendering tab:', error)
      return <div className="p-4 text-red-600">Error loading tab content. Please try again.</div>
    }
  }

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    setMenuOpen(false)
  }

  const handleMarkAlertAsRead = (alertId: number) => {
    const newUnread = new Set(unreadAlerts)
    newUnread.delete(alertId)
    setUnreadAlerts(newUnread)
    setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, read: true } : alert))
  }

  const handleMarkAllAlertsAsRead = () => {
    setUnreadAlerts(new Set())
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      console.log('[v0] Searching superadmin for:', query)
    }
  }

  return (
    <MobileLayout 
      customMenu={true}
      onMenuToggle={() => setMenuOpen(!menuOpen)}
      showProfile={true}
      onProfileClick={() => handleTabChange('settings')}
    >
      {/* Header with Search and Notifications */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 -mx-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search societies, units..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-500"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Alerts</h3>
                    {unreadAlerts.size > 0 && (
                      <button
                        onClick={handleMarkAllAlertsAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{unreadAlerts.size} unread</p>
                </div>

                <div className="divide-y divide-slate-200">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => handleMarkAlertAsRead(alert.id)}
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${!alert.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-600' : 'bg-blue-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{alert.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pb-6">
        {/* Tab Content */}
        <div>
          {renderTabContent()}
        </div>
      </div>

      {/* Slide-out Menu from LEFT */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu Drawer - Slides from LEFT */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 flex flex-col">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Navigation</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </MobileLayout>
  )
}
