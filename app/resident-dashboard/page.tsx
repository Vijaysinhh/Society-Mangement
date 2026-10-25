'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Users, AlertCircle, DollarSign, Layers, Zap, ChevronDown, ChevronUp, LogOut, Settings, Briefcase, Bell, MapPin } from 'lucide-react'
import MobileLayout from '@/components/MobileLayout'
import Community from './components/Community'
import FinanceConsolidated from './components/FinanceConsolidated'
import VisitorsAtGateWidget from './components/VisitorsAtGateWidget'
import DenyVisitorModal from './components/DenyVisitorModal'
import ResidentProfile from './components/ResidentProfile'
import ResidentVisitorRequests from './components/ResidentVisitorRequests'
import ComplaintsReporting from './components/ComplaintsReporting'

type ViewType = 'home' | 'visitors' | 'finances' | 'issues' | 'community' | 'profile'

interface NavTab {
  id: ViewType
  label: string
  icon: React.ReactNode
}

interface Property {
  id: string
  unitNumber: string
  building: string
  floor: string
  unitType: string
  type: 'owner' | 'tenant'
}

const navTabs: NavTab[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'visitors', label: 'Visitors', icon: <Users className="w-5 h-5" /> },
  { id: 'finances', label: 'Finances', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'issues', label: 'Issues', icon: <AlertCircle className="w-5 h-5" /> },
  { id: 'community', label: 'Community', icon: <Users className="w-5 h-5" /> },
]

export default function ResidentDashboardPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>('home')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [properties, setProperties] = useState<Property[]>([])
  const [residentName, setResidentName] = useState('Resident')
  const [residentEmail, setResidentEmail] = useState('')
  const [residentPhone, setResidentPhone] = useState('')
  const [societyName, setSocietyName] = useState('')
  const [contextLoading, setContextLoading] = useState(true)
  const [contextError, setContextError] = useState('')
  const [showPropertySelector, setShowPropertySelector] = useState(false)
  
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0] || { id: '', unitNumber: '', building: '', floor: '', unitType: '', type: 'tenant' as const }
  const unitNumber = selectedProperty.unitNumber
  const [profileSection, setProfileSection] = useState<'overview' | 'edit' | 'password' | 'preferences' | 'visitors' | 'help'>('overview')
  const [editFormData, setEditFormData] = useState({ name: residentName, email: residentEmail, phone: residentPhone })
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [notificationCount, setNotificationCount] = useState(2)
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [denyModalOpen, setDenyModalOpen] = useState(false)
  const [selectedVisitorForDeny, setSelectedVisitorForDeny] = useState<any>(null)
  const [isWatchmanOnDuty, setIsWatchmanOnDuty] = useState(true) // Set from watchman log

  useEffect(() => {
    let cancelled = false
    fetch('/api/resident/context').then(async (response) => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not load resident account')
      return result.data
    }).then((data) => {
      if (cancelled) return
      setResidentName(data.resident.name)
      setResidentEmail(data.resident.email || '')
      setResidentPhone(data.resident.phone)
      setSocietyName(data.society.name)
      const connected = data.assignments.map((assignment: any) => ({
        id: assignment.unit.id,
        unitNumber: assignment.unit.unit_number,
        building: '',
        floor: assignment.unit.floor === null ? '' : String(assignment.unit.floor),
        unitType: assignment.unit.unit_type,
        type: assignment.role === 'owner' ? 'owner' : 'tenant',
      }))
      setProperties(connected)
      setSelectedPropertyId(connected[0]?.id || '')
    }).catch((error) => { if (!cancelled) setContextError(error instanceof Error ? error.message : 'Could not load resident account') })
      .finally(() => { if (!cancelled) setContextLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Update time-based greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning'
    if (currentHour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const handleTabChange = (tabId: ViewType) => {
    setView(tabId)
  }

  const handleSelectProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setShowPropertySelector(false)
  }

  const handleOpenProfile = () => {
    setView('profile')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/resident-login')
    router.refresh()
  }

  const renderContent = () => {
    if (contextLoading) return <p role="status" className="py-12 text-center text-sm text-slate-600">Loading your resident account...</p>
    if (contextError) return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{contextError}. Please sign in again.</div>
    if (view === 'visitors') return <ResidentVisitorRequests />
    if (view === 'finances') return <FinanceConsolidated />
    if (view === 'issues') return <ComplaintsReporting unitId={selectedProperty.id} unitNumber={selectedProperty.unitNumber} />
    if (view === 'profile') return <ResidentProfile onBack={() => setView('home')} onLogout={handleLogout} onProfileUpdated={(resident) => { setResidentName(resident.name); setResidentPhone(resident.phone); setResidentEmail(resident.email || '') }} />
    switch (view) {
      case 'home':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Improved Header with Time-Based Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{getGreeting()}, {residentName.split(' ')[0]}</h2>
                <p className="text-sm text-slate-600 mt-1">Unit {unitNumber} • Building A</p>
              </div>
            </div>


            {/* ACTION REQUIRED STACK - Integrated Visitors + Bill + Issues */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">Action Required</h3>
              
              {/* Visitors at Gate - INSIDE Action Required */}
              <VisitorsAtGateWidget 
                onViewAll={() => handleTabChange('visitors')}
                onApprove={(visitor) => {
                  console.log('Visitor approved:', visitor)
                }}
                onDeny={(visitor) => {
                  setSelectedVisitorForDeny(visitor)
                  setDenyModalOpen(true)
                }}
              />

              {/* Bills - INSIDE Action Required */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Bill Due Tomorrow</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">₹2,500</p>
                    <p className="text-sm text-amber-700 mt-1">March maintenance</p>
                  </div>
                  <button
                    onClick={() => handleTabChange('payments')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>

            {/* TODAY AT A GLANCE - Summary Cards */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Today at a Glance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Watchman Card - Reframed as Security Service with Status */}
                <div className={`rounded-lg border p-4 hover:shadow-md transition-all ${
                  isWatchmanOnDuty 
                    ? 'bg-white border-slate-200' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${
                    isWatchmanOnDuty ? 'text-slate-600' : 'text-red-600'
                  }`}>
                    <span>🔐</span> Security
                  </p>
                  <p className={`text-lg font-bold mt-3 ${
                    isWatchmanOnDuty ? 'text-slate-900' : 'text-red-700'
                  }`}>
                    {isWatchmanOnDuty ? 'Rajesh Kumar' : 'NO WATCHMAN'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isWatchmanOnDuty ? 'text-slate-600' : 'text-red-600'
                  }`}>
                    {isWatchmanOnDuty ? 'Gate monitored • 06:00-14:00' : 'ALERT: On duty shift ended'}
                  </p>
                  <button
                    onClick={() => {
                      // In a real app, this would trigger a phone call
                      alert('Calling Rajesh Kumar...')
                    }}
                    className={`w-full mt-3 px-3 py-2 text-white text-xs font-semibold rounded-lg transition-colors ${
                      isWatchmanOnDuty 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    📞 Quick Call
                  </button>
                </div>

                {/* Due Bill Card - Reframed without shame */}
                <div 
                  onClick={() => handleTabChange('payments')}
                  className="bg-white rounded-lg border border-amber-200 p-4 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all"
                >
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                    <span>📅</span> Payment Due
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-3">₹2,500</p>
                  <p className="text-sm text-amber-700 font-semibold mt-1">Tomorrow • 1 day left</p>
                  <p className="text-xs text-slate-600 mt-2">March maintenance (UPI ready)</p>
                </div>

                {/* Active Issue Card - Positive tracking language */}
                <div 
                  onClick={() => handleTabChange('issues')}
                  className="bg-white rounded-lg border border-blue-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                    <span>⏳</span> In Progress
                  </p>
                  <p className="font-bold text-slate-900 mt-3 text-sm">AC Repair</p>
                  <p className="text-xs text-blue-700 font-semibold mt-2">Technician assigned</p>
                  <p className="text-xs text-slate-600 mt-1">Ready tomorrow morning</p>
                </div>

                {/* Security & Peace of Mind - Reframed reassurance */}
                <div className="bg-green-50 rounded-lg border border-green-200 p-4 flex flex-col justify-center">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">All Clear</p>
                  <p className="text-lg font-bold text-green-700 mt-3">Everything</p>
                  <p className="text-xs text-green-600 mt-2">on track for today</p>
                </div>
              </div>
            </div>

            {/* RECENT UPDATES */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Recent Updates</h3>
              <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
                <div className="p-3 sm:p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleTabChange('issues')}>
                  <span className="text-lg flex-shrink-0">🔧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">AC filter replaced</p>
                    <p className="text-xs text-slate-600 mt-0.5">[Yesterday] Maintenance #MR-047 — Done</p>
                  </div>
                  <span className="text-slate-400">→</span>
                </div>

                <div className="p-3 sm:p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleTabChange('issues')}>
                  <span className="text-lg flex-shrink-0">📋</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Plumbing complaint resolved</p>
                    <p className="text-xs text-slate-600 mt-0.5">[2 days ago] Water leakage in bathroom — Fixed</p>
                  </div>
                  <span className="text-slate-400">→</span>
                </div>

                <div className="p-3 sm:p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleTabChange('payments')}>
                  <span className="text-lg flex-shrink-0">💳</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Bill payment confirmed</p>
                    <p className="text-xs text-slate-600 mt-0.5">[3 days ago] February maintenance ₹2,500 — Received</p>
                  </div>
                  <span className="text-slate-400">→</span>
                </div>
              </div>
              <button className="w-full mt-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                View All Activity →
              </button>
            </div>

            {/* PARCELS - Collapsible Section with Matching Design */}
            <details className="group">
              <summary className="w-full list-none flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <h3 className="text-lg font-bold text-slate-900">Parcels</h3>
                <span className="group-open:hidden"><ChevronDown className="w-5 h-5" /></span>
                <span className="hidden group-open:inline"><ChevronUp className="w-5 h-5" /></span>
              </summary>
              <div className="mt-4 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending Deliveries</p>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">2</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">Amazon Package</p>
                          <p className="text-xs text-slate-600 mt-2">Arrived: May 15, 2:30 PM</p>
                          <p className="text-xs text-red-600 font-medium mt-1">Status: Not collected</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Pending</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">Courier Parcel</p>
                          <p className="text-xs text-slate-600 mt-2">Arrived: May 14, 10:15 AM</p>
                          <p className="text-xs text-yellow-600 font-medium mt-1">Status: Awaiting pickup</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">All parcels are with the watchman at gate. Check with them during gate hours (06:00-20:00)</p>
                </div>
              </div>
            </details>

            {/* Monthly Stats (Collapsible, Low Priority) */}
            <details className="group">
              <summary className="font-semibold text-slate-900 text-sm cursor-pointer flex items-center gap-2 hover:text-slate-700">
                Monthly Summary
                <span className="group-open:hidden">▼</span>
                <span className="hidden group-open:inline">▲</span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Total Visitors</p>
                    <span className="text-xl">👥</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">156</p>
                  <p className="text-xs text-green-600 mt-2">+ 12% from last month</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Complaints</p>
                    <span className="text-xl">📋</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">3</p>
                  <p className="text-xs text-slate-600 mt-2">2 resolved, 1 pending</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Maintenance</p>
                    <span className="text-xl">🔧</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">2</p>
                  <p className="text-xs text-slate-600 mt-2">Both completed</p>
                </div>
              </div>
            </details>
          </div>
        )
      case 'finances':
        return <FinanceConsolidated />
      case 'issues':
      case 'visitors':
      case 'community':
        return <Community />
      default:
        return null
    }
  }

  return (
    <>
    <MobileLayout
      title={`${getGreeting()}, ${residentName.split(' ')[0]}`}
      subtitle="Select Property"
      hideMenu={true}
      showProfile={true}
      onProfileClick={() => handleOpenProfile()}
      notificationCount={notificationCount}
      onNotificationClick={() => handleTabChange('notifications')}
    >
      {/* Property Selector Dropdown */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-slate-200">
        <button
          onClick={() => setShowPropertySelector(!showPropertySelector)}
          className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-left">
            <MapPin className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500">Unit {selectedProperty.unitNumber}</p>
              <p className="text-sm font-semibold text-slate-900">
                Building {selectedProperty.building} • Floor {selectedProperty.floor} • {selectedProperty.type === 'owner' ? 'Owner' : 'Tenant'}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${showPropertySelector ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showPropertySelector && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {properties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => handleSelectProperty(prop.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    selectedPropertyId === prop.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">Unit {prop.unitNumber}</p>
                    <p className="text-xs text-slate-500">Building {prop.building} • Floor {prop.floor}</p>
                  </div>
                  {selectedPropertyId === prop.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation Bar - Hidden when viewing profile */}
      {view !== 'profile' && (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 sm:h-20 px-0 z-40 safe-area-inset-bottom">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative group ${
              view === tab.id
                ? 'text-purple-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`${view === tab.id ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              {tab.icon}
            </div>
            <span className={`text-xs font-medium ${
              view === tab.id ? 'text-purple-600 font-semibold' : 'text-slate-600'
            }`}>
              {tab.label}
            </span>
            {view === tab.id && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        ))}
      </div>
      )}

      {/* Content padding to account for bottom nav - Hidden when viewing profile */}
      {view !== 'profile' && <div className="h-16 sm:h-20" />}

      {/* Deny Visitor Modal */}
      <DenyVisitorModal
        isOpen={denyModalOpen}
        visitor={selectedVisitorForDeny}
        onConfirm={(visitor, reason, addToBlacklist) => {
          console.log('Visitor denied:', { visitor, reason, addToBlacklist })
          setDenyModalOpen(false)
          setSelectedVisitorForDeny(null)
        }}
        onCancel={() => {
          setDenyModalOpen(false)
          setSelectedVisitorForDeny(null)
        }}
      />
    </MobileLayout>
    </>
  )
}
