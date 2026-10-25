'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Building2, Users, Home, Wrench, ChevronRight, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import ParcelTracking from './ParcelTracking'

interface Props { societyId: string }
interface Data {
  firstName: string
  metrics: { totalUnits: number; occupiedUnits: number; vacantUnits: number; totalResidents: number; collectionAmount: number; collectionTarget: number; collectionPercent: number; outstandingDues: number; outstandingAmount: number; maintenanceIssues: number; highPriority: number }
  visitors: { totalToday: number; checkedInToday: number; checkedOutToday: number; deniedThisMonth: number }
  securityAlerts: { repeatedRejected: number; blacklistedAttempts: number }
  onDuty: Array<{ id: string; name: string; phone: string; area: string; shiftStart: string; shiftEnd: string }>
  activity: Array<{ id: string; action: string; title: string; description: string; amount: number | null; createdAt: string }>
}
const empty: Data = { firstName: 'Admin', metrics: { totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, totalResidents: 0, collectionAmount: 0, collectionTarget: 0, collectionPercent: 0, outstandingDues: 0, outstandingAmount: 0, maintenanceIssues: 0, highPriority: 0 }, visitors: { totalToday: 0, checkedInToday: 0, checkedOutToday: 0, deniedThisMonth: 0 }, securityAlerts: { repeatedRejected: 0, blacklistedAttempts: 0 }, onDuty: [], activity: [] }
const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function DashboardMobile({ societyId }: Props) {
  const [data, setData] = useState<Data>(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/society-admin/dashboard', { cache: 'no-store' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error?.message || body.error || 'Unable to load dashboard')
      setData(body.data || body)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load dashboard') }
    finally { setLoading(false) }
  }, [societyId])
  useEffect(() => { void load() }, [load])
  const m = data.metrics
  const alerts = data.securityAlerts.repeatedRejected + data.securityAlerts.blacklistedAttempts

  return <div className="space-y-6 pb-8">
    <div className="space-y-2"><h2 className="text-2xl font-bold text-slate-900">Good morning, {data.firstName}! 👋</h2><p className="text-sm text-slate-600">Here&apos;s what&apos;s happening in your society today.</p>{loading && <p className="text-xs text-slate-500">Loading latest dashboard data...</p>}{error && <button type="button" onClick={() => void load()} className="text-xs font-semibold text-red-600">{error}. Tap to retry.</button>}</div>

    <div className="grid grid-cols-2 gap-3">
      <Metric icon={<Building2 className="w-5 h-5 text-purple-600" />} bg="bg-purple-100" value={m.totalUnits} label="Total Units" />
      <Metric icon={<Users className="w-5 h-5 text-green-600" />} bg="bg-green-100" value={m.occupiedUnits} label="Occupied Units" />
      <Metric icon={<Home className="w-5 h-5 text-orange-600" />} bg="bg-orange-100" value={m.vacantUnits} label="Vacant Units" />
      <Metric icon={<Users className="w-5 h-5 text-blue-600" />} bg="bg-blue-100" value={m.totalResidents} label="Total Residents" />
    </div>

    <section className="space-y-3"><Heading title="Monthly Overview" />
      <Overview color="green" icon={<TrendingUp className="w-5 h-5 text-green-600" />} title="Collection Status"><p className="text-2xl font-bold text-slate-900 mb-3">{money(m.collectionAmount)}</p><p className="text-xs text-slate-600">{m.collectionPercent}% collected this month</p><p className="text-xs text-slate-500 mt-1">of {money(m.collectionTarget)}</p></Overview>
      <Overview color="orange" icon={<AlertCircle className="w-5 h-5 text-orange-600" />} title="Outstanding Dues"><p className="text-2xl font-bold text-slate-900 mb-1">{m.outstandingDues} units</p><p className="text-xs text-slate-600">have pending dues</p><p className="text-sm font-bold text-orange-600 mt-2">{money(m.outstandingAmount)}</p></Overview>
      <Overview color="red" icon={<Wrench className="w-5 h-5 text-red-600" />} title="Issues"><p className="text-2xl font-bold text-slate-900 mb-1">{m.maintenanceIssues} pending issues</p><p className="text-xs font-semibold text-red-600 mt-2">{m.highPriority} High Priority</p></Overview>
    </section>

    <section className="space-y-3"><div className="flex items-center justify-between px-1"><h3 className="text-lg font-bold text-slate-900">Visitors Overview</h3><button className="text-sm font-semibold text-purple-600 hover:text-purple-700">Today ▼</button></div><div className="grid grid-cols-2 gap-3">
      <Visitor bg="bg-blue-100" text="text-blue-700" icon="👥" value={data.visitors.totalToday} label="Total Visitors" footer="today" />
      <Visitor bg="bg-green-100" text="text-green-700" icon="✓" value={data.visitors.checkedInToday} label="Checked In" footer="today" />
      <Visitor bg="bg-orange-100" text="text-orange-700" icon="→" value={data.visitors.checkedOutToday} label="Checked Out" footer="today" />
      <Visitor bg="bg-red-100" text="text-red-700" icon="✕" value={data.visitors.deniedThisMonth} label="Rejected" footer="this month" />
    </div></section>

    <section className="space-y-3"><h3 className="text-lg font-bold text-slate-900">Security Alerts</h3><div className="space-y-2">{alerts === 0 ? <AlertRow icon="✓" title="No security alerts recorded" description="There are no active alerts for this society." /> : <><AlertRow icon="🚫" title="Repeated Rejected" description={`${data.securityAlerts.repeatedRejected} visitors tried to enter multiple times`} count={data.securityAlerts.repeatedRejected} /><AlertRow icon="⚠️" title="Blacklisted" description={`${data.securityAlerts.blacklistedAttempts} blacklisted visitor attempts`} count={data.securityAlerts.blacklistedAttempts} /></>}</div><button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"><div className="flex items-center gap-2"><span className="text-lg">🛡️</span><p className="font-medium text-slate-900 text-sm">Manage Blacklist</p></div><ChevronRight className="w-4 h-4 text-slate-400" /></button></section>

    <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">Currently On Duty</h3><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Live</span></div><div className="space-y-3">{data.onDuty.length === 0 && <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4"><p className="text-sm font-medium text-slate-700">No watchman is scheduled for the current time.</p></div>}{data.onDuty.map(w => <div key={w.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4"><div className="flex items-start justify-between mb-2"><div className="flex items-center gap-3 flex-1"><div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">🔒</div><div className="flex-1"><p className="font-semibold text-slate-900">{w.name}</p><p className="text-xs text-slate-600">{w.area}</p></div></div><span className="text-lg">🟢</span></div><div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-green-200"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600" /><div><p className="text-xs text-slate-600">Shift start</p><p className="text-sm font-semibold text-slate-900">{w.shiftStart}</p></div></div><div><p className="text-xs text-slate-600">Shift</p><p className="text-sm font-semibold text-slate-900">{w.shiftStart}–{w.shiftEnd}</p></div></div><div className="mt-3 flex items-center gap-2"><span className="text-sm text-slate-600">📱</span><p className="text-sm font-medium text-slate-900">{w.phone}</p></div></div>)}</div></section>

    <div className="bg-white rounded-2xl p-4 border border-slate-100"><ParcelTracking societyId={societyId} /></div>

    <section className="space-y-3"><Heading title="Recent Activity" />{data.activity.length === 0 && <div className="bg-white rounded-2xl p-4 border border-slate-100"><p className="text-sm text-slate-600">No recent activity yet.</p></div>}{data.activity.map(a => { const payment = a.action.includes('bill') || a.action.includes('payment'); return <div key={a.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3"><div className={`${payment ? 'bg-green-50' : 'bg-blue-50'} p-3 rounded-xl flex-shrink-0`}><span className="text-xl">{payment ? '₹' : '✓'}</span></div><div className="flex-1 min-w-0"><p className="font-semibold text-slate-900">{a.title}</p><p className="text-xs text-slate-600 mt-0.5">{a.description}</p></div><div className="text-right flex-shrink-0">{a.amount !== null && <p className="font-bold text-green-600 text-sm">{money(a.amount)}</p>}<p className="text-xs text-slate-500 mt-1">{new Date(a.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p></div></div>})}</section>
  </div>
}

function Heading({ title }: { title: string }) { return <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{title}</h3><button className="text-sm font-semibold text-purple-600 hover:text-purple-700">View All</button></div> }
function Metric({ icon, bg, value, label }: { icon: React.ReactNode; bg: string; value: number; label: string }) { return <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"><div className="flex items-start justify-between mb-3"><div className={`p-2.5 ${bg} rounded-lg`}>{icon}</div></div><p className="text-3xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-600 font-medium mt-1">{label}</p></div> }
function Overview({ color, icon, title, children }: { color: 'green' | 'orange' | 'red'; icon: React.ReactNode; title: string; children: React.ReactNode }) { const c = { green: 'from-green-50 to-green-50/50 border-green-200 bg-green-100 text-green-600', orange: 'from-orange-50 to-orange-50/50 border-orange-200 bg-orange-100 text-orange-600', red: 'from-red-50 to-red-50/50 border-red-200 bg-red-100 text-red-600' }[color].split(' '); return <div className={`bg-gradient-to-br ${c[0]} ${c[1]} rounded-2xl p-4 border ${c[2]}`}><div className="flex items-start justify-between mb-3"><div className={`p-3 ${c[3]} rounded-xl`}>{icon}</div><ChevronRight className={`w-5 h-5 ${c[4]}`} /></div><p className="text-sm text-slate-600 font-medium mb-1">{title}</p>{children}</div> }
function Visitor({ bg, text, icon, value, label, footer }: { bg: string; text: string; icon: string; value: number; label: string; footer: string }) { return <div className={`${bg} rounded-2xl p-4`}><div className="flex items-start justify-between mb-2"><span className="text-2xl">{icon}</span></div><p className={`text-2xl font-bold ${text}`}>{value}</p><p className={`text-xs ${text} opacity-80`}>{label}</p><p className={`text-xs ${text} mt-1 font-medium`}>{footer}</p></div> }
function AlertRow({ icon, title, description, count }: { icon: string; title: string; description: string; count?: number }) { return <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-xl flex-shrink-0">{icon}</span><div className="flex-1 min-w-0"><p className="font-medium text-slate-900 text-sm">{title}</p><p className="text-xs text-slate-600 mt-0.5">{description}</p></div>{count !== undefined && <span className="flex-shrink-0 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center bg-red-100 text-red-700">{count}</span>}</div> }
