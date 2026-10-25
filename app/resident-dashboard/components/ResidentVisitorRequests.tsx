'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { useVisitorLiveRefresh } from '@/hooks/useVisitorLiveRefresh'
import LiveConnectionBadge from '@/components/LiveConnectionBadge'

type Visitor = {
  id: string; visitorName: string; visitorPhone: string; purpose: string; status: string
  unitNumber: string; watchmanName: string; requestedAt: string
  denialReason?: string | null; photoUrl?: string | null
}

export default function ResidentVisitorRequests() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [reasonFor, setReasonFor] = useState('')
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/visitor-requests')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load visitors')
      setVisitors(result.data || [])
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not load visitors')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])
  const liveStatus = useVisitorLiveRefresh(load)

  async function decide(id: string, action: 'approve' | 'deny') {
    if (action === 'deny' && !reason.trim()) { setError('Enter a reason before denying entry.'); return }
    setWorking(id); setError('')
    try {
      const response = await fetch(`/api/visitor-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not record decision')
      setVisitors((current) => current.map((visitor) => visitor.id === id ? result.data : visitor))
      setReasonFor(''); setReason('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not record decision')
    } finally { setWorking('') }
  }

  const pending = visitors.filter((visitor) => visitor.status === 'pending')

  return <div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="flex items-center gap-2 text-xl font-bold text-slate-950"><ShieldCheck className="h-5 w-5 text-purple-700" />Visitors at gate</h2><LiveConnectionBadge status={liveStatus} /></div><p className="mt-1 text-sm text-slate-600">Approve only visitors you recognize.</p></div><button onClick={load} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-slate-300" aria-label="Refresh visitors"><RefreshCw className="h-5 w-5" /></button></div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status" className="py-8 text-center text-sm text-slate-600">Checking the gate...</p> : pending.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-900">No visitors waiting</p><p className="mt-1 text-sm text-slate-500">New gate requests will appear here.</p></div> : <div className="space-y-3">{pending.map((visitor) => <article key={visitor.id} className="rounded-xl border-2 border-amber-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Waiting at gate · Unit {visitor.unitNumber}</p>
      <div className="mt-3 flex gap-3">{visitor.photoUrl ? <img src={visitor.photoUrl} alt={`${visitor.visitorName} visitor photo`} className="h-24 w-24 flex-none rounded-lg bg-slate-100 object-cover" /> : <div className="grid h-24 w-24 flex-none place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">No photo</div>}<div className="min-w-0"><h3 className="text-lg font-bold text-slate-950">{visitor.visitorName}</h3><p className="text-sm text-slate-600">{visitor.visitorPhone}</p><p className="mt-2 text-sm text-slate-700">Purpose: {visitor.purpose || 'Visit'}</p><p className="mt-1 text-xs text-slate-500">Logged by {visitor.watchmanName}</p></div></div>
      {reasonFor === visitor.id ? <div className="mt-4 space-y-3"><label className="block text-sm font-medium">Reason for denial<textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 min-h-20 w-full rounded-lg border border-slate-300 p-3 text-base" autoFocus /></label><div className="flex gap-2"><button onClick={() => { setReasonFor(''); setReason('') }} className="min-h-11 flex-1 rounded-lg border border-slate-300 font-semibold">Back</button><button disabled={working === visitor.id} onClick={() => decide(visitor.id, 'deny')} className="min-h-11 flex-1 rounded-lg bg-red-700 font-semibold text-white disabled:opacity-50">Confirm denial</button></div></div> : <div className="mt-4 grid grid-cols-2 gap-2"><button disabled={working === visitor.id} onClick={() => setReasonFor(visitor.id)} className="min-h-12 rounded-lg border border-red-300 font-bold text-red-700"><X className="mr-1 inline h-5 w-5" />Deny</button><button disabled={working === visitor.id} onClick={() => decide(visitor.id, 'approve')} className="min-h-12 rounded-lg bg-green-700 font-bold text-white"><Check className="mr-1 inline h-5 w-5" />Allow</button></div>}
    </article>)}</div>}
    <section><h3 className="mb-2 font-bold text-slate-950">Recent decisions</h3><div className="space-y-2">{visitors.filter((visitor) => visitor.status !== 'pending').slice(0, 10).map((visitor) => <div key={visitor.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"><div className="flex min-w-0 items-center gap-3">{visitor.photoUrl && <img src={visitor.photoUrl} alt="" className="h-10 w-10 flex-none rounded-md bg-slate-100 object-cover" />}<div><p className="font-semibold text-slate-900">{visitor.visitorName}</p><p className="text-xs text-slate-500">Unit {visitor.unitNumber}</p></div></div><span className="text-sm font-semibold capitalize text-slate-700">{visitor.status.replace('_', ' ')}</span></div>)}</div></section>
  </div>
}
