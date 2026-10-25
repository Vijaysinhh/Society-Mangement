'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Plus, Clock, Settings, LogOut, CheckCircle2, XCircle, Phone, MapPin, Clock3, User, Bell, Eye, Lock, Smartphone, AlertCircle, Info, Download, Trash2, RefreshCw, Edit2, Shield, AlertTriangle, Package, AlertOctagon, Box, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from './useTranslations'
import { WatchmanHeader } from './components/WatchmanHeader'
import { ProfileModal } from './components/ProfileModal'
import { FloatingActionButton } from './components/FloatingActionButton'
import { VisitorLogModal } from './components/VisitorLogModal'
import { BlacklistManager } from './BlacklistManager'
import { ParcelManager } from './ParcelManager'
import { IncidentManager } from './IncidentManager'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { OfflineSync } from './offlineSync'
import type { BlacklistedPerson } from './BlacklistManager'
import { useVisitorLiveRefresh } from '@/hooks/useVisitorLiveRefresh'

interface EmergencyAlert {
  id: string
  timestamp: string
  reason: string
  location: string
  watchmanName: string
  status: string
  responseTime?: string
}

interface DashboardVisitor {
  id: string
  name: string
  phone: string
  unit: string
  resident: string
  timeIn: string
  timeOut: string | null
  reason: string
  photo: string | null
  status: string
  residentDecision: 'allow' | 'deny' | null
  requestTime: number
  isFlagged: boolean
  flagReason: string
  isEmptyUnit: boolean
}

interface DutyLogEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null
  status: 'ongoing' | 'completed'
}

export default function WatchmanDashboard() {
  const router = useRouter()
  const { language, changeLanguage, t } = useTranslations()
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'duty'>('overview')
  const [showBlacklistManager, setShowBlacklistManager] = useState(false)
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistedPerson[]>([
    {
      id: '1',
      name: 'Rajesh Patel',
      phone: '9876543210',
      reason: 'Theft incident',
      dateAdded: '2024-03-15',
      isBlacklisted: true,
    },
    {
      id: '2',
      name: 'Amit Singh',
      phone: '8765432109',
      reason: 'Unauthorized entry',
      dateAdded: '2024-03-10',
      isBlacklisted: true,
    },
  ])
  const [visitors, setVisitors] = useState<DashboardVisitor[]>([])

  const [dutyLog, setDutyLog] = useState<DutyLogEntry[]>([])
  const [dutyLoading, setDutyLoading] = useState(false)

  const [newVisitorForm, setNewVisitorForm] = useState({
    name: '',
    phone: '',
    unit: '',
    reason: '',
    photo: null as File | null,
    photoPreview: null as string | null,
  })

  const cameraRef = useRef<HTMLInputElement>(null)

  const [watchmanProfile, setWatchmanProfile] = useState({
    name: 'Watchman',
    email: '',
    phone: '',
    shiftStart: '',
    shiftEnd: '',
    profilePhoto: null as string | null,
    password: '••••••••',
  })

  const [notifications, setNotifications] = useState({
    visitorAlerts: true,
    decisionAlerts: true,
    dutyReminders: true,
    reportDigest: true,
  })

  const [residentNotifications, setResidentNotifications] = useState<Array<{
    id: string
    visitorName: string
    visitorPhone: string
    unit: string
    reason: string
    timestamp: string
    status: 'blacklist-attempt' | 'denied' | 'approved'
  }>>([])

  const [assignedSchedules, setAssignedSchedules] = useState<Array<{ id: string; dayOfWeek: string; startTime: string; endTime: string }>>([])
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showVisitorLogModal, setShowVisitorLogModal] = useState(false)
  const profilePhotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      try {
        const response = await fetch('/api/watchman/context')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load profile')
        if (!cancelled) {
          setWatchmanProfile((current) => ({ ...current, name: result.watchman.name, phone: result.watchman.phone, shiftStart: result.watchman.shiftStart, shiftEnd: result.watchman.shiftEnd }))
          setAssignedSchedules(result.watchman.shiftStart && result.watchman.shiftEnd ? [{ id: result.watchman.id, dayOfWeek: 'Daily', startTime: result.watchman.shiftStart, endTime: result.watchman.shiftEnd }] : [])
        }
      } catch (error) {
        if (!cancelled) toast.error('Could not load account', { description: error instanceof Error ? error.message : 'Please sign in again.' })
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [])

  const loadDutyLog = useCallback(async () => {
    setDutyLoading(true)
    try {
      const response = await fetch('/api/watchmen/duty')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load duty history')
      setDutyLog((result.data || []).map((log: any) => ({
        id: log.id,
        date: new Date(`${log.date}T00:00:00`).toLocaleDateString(),
        startTime: new Date(log.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: log.checkOutAt ? new Date(log.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        status: log.status === 'on_duty' ? 'ongoing' : 'completed',
      })))
    } catch (error) {
      toast.error('Could not load duty history', { description: error instanceof Error ? error.message : 'Try again.' })
    } finally {
      setDutyLoading(false)
    }
  }, [])

  useEffect(() => { void loadDutyLog() }, [loadDutyLog])

  async function logout() {
    if (!confirm('Are you sure you want to logout?')) return
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/watchman-login')
    router.refresh()
  }

  const loadVisitors = useCallback(async () => {
    try {
      const response = await fetch('/api/visitor-requests')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load visitors')
      setVisitors((result.data || []).map((visitor: any) => ({
        id: visitor.id,
        name: visitor.visitorName,
        phone: visitor.visitorPhone,
        unit: visitor.unitNumber,
        resident: visitor.decisionByName || '',
        timeIn: new Date(visitor.checkedInAt || visitor.requestedAt).toLocaleString(),
        timeOut: visitor.checkedOutAt ? new Date(visitor.checkedOutAt).toLocaleString() : null,
        reason: visitor.purpose || 'Visit',
        photo: visitor.photoUrl || null,
        status: visitor.status,
        residentDecision: visitor.status === 'denied' ? 'deny' : ['approved', 'checked_in', 'checked_out'].includes(visitor.status) ? 'allow' : null,
        requestTime: new Date(visitor.requestedAt).getTime(),
        isFlagged: visitor.status === 'denied',
        flagReason: visitor.denialReason || '',
        isEmptyUnit: false,
      })))
    } catch (error) {
      toast.error('Could not load visitors', { description: error instanceof Error ? error.message : 'Try refreshing the page.' })
    }
  }, [])

  useVisitorLiveRefresh(loadVisitors)

  useEffect(() => {
    OfflineSync.setupListeners()
    void loadVisitors()
  }, [loadVisitors])

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewVisitorForm(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogVisitor = () => {
    if (newVisitorForm.name && newVisitorForm.phone && newVisitorForm.unit) {
      // Check if unit is empty (demo: C-305 is empty)
      const emptyUnits = ['C-305', 'D-401']
      const isEmptyUnit = emptyUnits.includes(newVisitorForm.unit)

      // Check if visitor is blacklisted
      const isBlacklisted = blacklist.some(
        b => b.phone === newVisitorForm.phone && b.isBlacklisted
      )

      const blacklistedPerson = blacklist.find(
        b => b.phone === newVisitorForm.phone && b.isBlacklisted
      )

      const newVisitor = {
        id: String(visitors.length + 1),
        name: newVisitorForm.name,
        phone: newVisitorForm.phone,
        unit: newVisitorForm.unit,
        resident: 'Mr. Resident',
        timeIn: new Date().toLocaleString(),
        timeOut: null,
        reason: newVisitorForm.reason || 'Visit',
        photo: newVisitorForm.photoPreview || null,
        status: isEmptyUnit || isBlacklisted ? 'denied' : 'pending',
        residentDecision: isEmptyUnit || isBlacklisted ? 'deny' : null,
        requestTime: Date.now(),
        isFlagged: isEmptyUnit || isBlacklisted,
        flagReason: isBlacklisted 
          ? 'BLACKLISTED VISITOR - DO NOT ALLOW' 
          : isEmptyUnit 
          ? 'Unit is empty - suspicious entry attempt' 
          : '',
        isEmptyUnit: isEmptyUnit,
      }
      setVisitors([newVisitor, ...visitors])
      setNewVisitorForm({ name: '', phone: '', unit: '', reason: '', photo: null, photoPreview: null })
      
      // Handle blacklist case with improved notifications
      if (isBlacklisted) {
        // Show warning toast to Watchman with reason
        toast.error('Blacklisted Visitor Detected', {
          description: `${newVisitorForm.name} is BLACKLISTED. Reason: ${blacklistedPerson?.reason || 'No reason provided'}. Entry automatically DENIED.`,
          duration: 5000,
        })

        // Send notification to resident that blacklisted person tried to visit
        const residentNotif = {
          id: String(residentNotifications.length + 1),
          visitorName: newVisitorForm.name,
          visitorPhone: newVisitorForm.phone,
          unit: newVisitorForm.unit,
          reason: newVisitorForm.reason || 'Not specified',
          timestamp: new Date().toLocaleString(),
          status: 'blacklist-attempt' as const,
        }
        setResidentNotifications([residentNotif, ...residentNotifications])
      } else if (isEmptyUnit) {
        toast.warning('Empty Unit Alert', {
          description: `WARNING: Unit ${newVisitorForm.unit} is EMPTY! Suspicious entry attempt detected and flagged.`,
          duration: 5000,
        })
      } else {
        toast.success('Visitor Logged', {
          description: `Notification sent to ${newVisitorForm.unit} resident about visitor ${newVisitorForm.name}`,
          duration: 3000,
        })
      }
    } else {
      toast.error('Missing Information', {
        description: 'Please fill in all required fields: Name, Phone, and Unit',
      })
    }
  }

  const handleMarkExit = async (visitorId: string) => {
    const visitor = visitors.find((item) => item.id === visitorId)
    if (!visitor) return
    const action = visitor.status === 'approved' ? 'check_in' : 'check_out'
    try {
      const response = await fetch(`/api/visitor-requests/${visitorId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update visitor')
      await loadVisitors()
      toast.success(action === 'check_in' ? 'Visitor checked in' : 'Visitor exit recorded')
    } catch (error) {
      toast.error('Could not update visitor', { description: error instanceof Error ? error.message : 'Try again.' })
    }
  }

  const createVisitorRequest = async (visitor: { unitId: string; name: string; phone: string; reason: string; photo: File }) => {
    try {
      const formData = new FormData()
      formData.set('unitId', visitor.unitId)
      formData.set('visitorName', visitor.name)
      formData.set('visitorPhone', visitor.phone)
      formData.set('purpose', visitor.reason)
      formData.set('photo', visitor.photo)
      const response = await fetch('/api/visitor-requests', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not log visitor')
      await loadVisitors()
      toast.success('Visitor logged', { description: `Approval request sent to Unit ${result.data.unitNumber}.` })
      return true
    } catch (error) {
      toast.error('Could not log visitor', { description: error instanceof Error ? error.message : 'Try again.' })
      return false
    }
  }

  const handleClockIn = async () => {
    setDutyLoading(true)
    try {
      const response = await fetch('/api/watchmen/duty', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not clock in')
      await loadDutyLog()
      toast.success('Clocked in successfully')
    } catch (error) {
      toast.error('Could not clock in', { description: error instanceof Error ? error.message : 'Try again.' })
    } finally {
      setDutyLoading(false)
    }
  }

  const handleClockOut = async () => {
    setDutyLoading(true)
    try {
      const response = await fetch('/api/watchmen/duty', { method: 'PATCH' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not clock out')
      await loadDutyLog()
      toast.success('Clocked out successfully')
    } catch (error) {
      toast.error('Could not clock out', { description: error instanceof Error ? error.message : 'Try again.' })
    } finally {
      setDutyLoading(false)
    }
  }

  const handleEmergencyAlert = (reason: string) => {
    // Report emergency via API instead of mock dataStore
    const newAlert = {
      id: String(emergencyAlerts.length + 1),
      timestamp: new Date().toLocaleString(),
      reason: reason,
      location: 'Main Gate',
      watchmanName: 'Rajesh',
      status: 'active',
    }
    
    setEmergencyAlerts([...emergencyAlerts, newAlert])
    
    // Simulate notification
    
    // Auto-resolve after 5 minutes (for demo)
    setTimeout(() => {
      setEmergencyAlerts(prev =>
        prev.map(a =>
          a.id === newAlert.id
            ? { ...a, status: 'resolved', responseTime: new Date().toLocaleTimeString() }
            : a
        )
      )
    }, 300000) // 5 minutes
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* New Header with Profile Ball */}
      <WatchmanHeader
        watchmanName={watchmanProfile.name}
        notificationCount={visitors.filter((visitor) => visitor.status === 'pending').length}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Visitor Log</h1>
            
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <AlertTriangle className="w-6 h-6" />
              EMERGENCY ALERT
            </button>

            {emergencyAlerts.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <h3 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Recent Alerts
                </h3>
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 font-medium">Total Visitors</p>
                <p className="text-2xl font-bold text-slate-900">{visitors.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-blue-900">{visitors.filter(v => v.status === 'pending').length}</p>
              </div>
            </div>

            {/* Visitor List */}
            <div className="space-y-3">
              {visitors.map(visitor => (
                <div key={visitor.id} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 overflow-hidden">
                      {visitor.photo ? <img src={visitor.photo} alt={`${visitor.name} visitor photo`} className="h-full w-full object-cover" /> : 'PHOTO'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{visitor.name}</h3>
                      <p className="text-xs text-slate-600">{visitor.phone}</p>
                      <div className="flex gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {visitor.unit}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {visitor.timeIn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resident Decision Status */}
                  {visitor.status === 'pending' && !visitor.residentDecision && (
                    <div className="bg-yellow-50 rounded p-2 mb-3 border border-yellow-200">
                      <p className="text-xs font-medium text-yellow-800">⏳ Waiting for resident decision...</p>
                      <p className="text-xs text-yellow-700 mt-1">Will auto-deny in 1 minute if no response</p>
                    </div>
                  )}

                  {visitor.residentDecision === 'allow' && (
                    <div className="bg-green-50 rounded p-2 mb-3 border border-green-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs font-medium text-green-800">✓ Resident Approved Entry</p>
                    </div>
                  )}

                  {visitor.residentDecision === 'deny' && (
                    <div className="bg-red-50 rounded p-2 mb-3 border border-red-200 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-xs font-medium text-red-800">✗ Resident Denied Entry</p>
                    </div>
                  )}

                  {visitor.isFlagged && (
                    <div className="bg-red-100 rounded p-2 mb-3 border border-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-700">🚩 FLAGGED - SUSPICIOUS ENTRY</p>
                        <p className="text-xs text-red-600 mt-1">{visitor.flagReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Watchman Actions - Only for Approved Visitors */}

                  {/* Status Badge & Exit */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      ['approved', 'checked_in'].includes(visitor.status) ? 'bg-green-100 text-green-800' :
                      visitor.status === 'denied' ? 'bg-red-100 text-red-800' :
                      visitor.status === 'checked_out' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {visitor.status === 'approved' ? '✓ Approved' :
                       visitor.status === 'checked_in' ? '✓ Inside' :
                       visitor.status === 'checked_out' ? 'Exited' :
                       visitor.status === 'denied' ? '✗ Denied' :
                       visitor.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                    </span>
                    {['approved', 'checked_in'].includes(visitor.status) && !visitor.timeOut && (
                      <button
                        onClick={() => handleMarkExit(visitor.id)}
                        className="text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
                      >
                        {visitor.status === 'approved' ? 'Check In' : 'Mark Exit'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Parcels Section - At Bottom of Overview */}
            <div className="mt-6">
              <ParcelManager t={t} />
            </div>
          </div>
        )}


        {/* Others Tab - Parcels & Incidents */}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="p-4 space-y-4 pb-28">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Incidents</h1>
            <div className="mt-4">
              <IncidentManager t={t} />
            </div>
          </div>
        )}

        {/* Duty Tab */}
        {activeTab === 'duty' && (
          <div className="p-4 space-y-4 pb-28">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Duty Schedule</h1>
            
            {/* Assigned Duty Schedule */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Your Assigned Schedule (Read-Only)
              </p>
              <div className="space-y-2">
                {assignedSchedules.length === 0 ? (
                  <p className="text-xs text-slate-600">No schedules assigned yet</p>
                ) : (
                  assignedSchedules.map(schedule => (
                    <div key={schedule.id} className="bg-white rounded p-3 border border-indigo-100">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-slate-900 text-sm">{schedule.dayOfWeek}</p>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Assigned</span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <Clock3 className="w-3 h-3" />
                        {schedule.startTime} to {schedule.endTime}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clock In/Out Buttons */}
            <div className="space-y-2">
              {dutyLog.find(d => d.status === 'ongoing') ? (
                <button disabled={dutyLoading} onClick={handleClockOut} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2">
                  <Clock3 className="w-5 h-5" />
                  Clock Out
                </button>
              ) : (
                <button disabled={dutyLoading} onClick={handleClockIn} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2">
                  <Clock3 className="w-5 h-5" />
                  Clock In
                </button>
              )}
            </div>

            {/* Duty History */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-900">Duty History</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {!dutyLoading && dutyLog.length === 0 && <p className="py-4 text-center text-xs text-slate-600">No duty records yet</p>}
                {dutyLog.map(duty => (
                  <div key={duty.id} className={`p-3 rounded-lg border text-sm ${duty.status === 'ongoing' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{duty.date}</p>
                        <p className="text-xs text-slate-600">{duty.startTime} - {duty.endTime || 'Ongoing'}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${duty.status === 'ongoing' ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-800'}`}>
                        {duty.status === 'ongoing' ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around h-24 px-2">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center justify-center gap-2 py-3 px-6 rounded-lg w-20 h-20 ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Eye className="w-8 h-8" />
          <span className="text-sm font-bold">Overview</span>
        </button>
        <button onClick={() => setActiveTab('incidents')} className={`flex flex-col items-center justify-center gap-2 py-3 px-6 rounded-lg w-20 h-20 ${activeTab === 'incidents' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
          <AlertOctagon className="w-8 h-8" />
          <span className="text-sm font-bold">Incidents</span>
        </button>
        <button onClick={() => setActiveTab('duty')} className={`flex flex-col items-center justify-center gap-2 py-3 px-6 rounded-lg w-20 h-20 ${activeTab === 'duty' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Clock className="w-8 h-8" />
          <span className="text-sm font-bold">Duty</span>
        </button>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        watchmanName={watchmanProfile.name}
        watchmanPhone={watchmanProfile.phone}
        onLogout={logout}
      />

      {/* Floating Action Button - Quick Add Visitor */}
      <FloatingActionButton onClick={() => setShowVisitorLogModal(true)} />

      {/* Visitor Log Modal */}
      <VisitorLogModal
        isOpen={showVisitorLogModal}
        onClose={() => setShowVisitorLogModal(false)}
        onSubmit={createVisitorRequest}
        blacklist={blacklist}
      />

      {showBlacklistManager && <BlacklistManager onClose={() => setShowBlacklistManager(false)} t={t} />}
    </div>
  )
}
