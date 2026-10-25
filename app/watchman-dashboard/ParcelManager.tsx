import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock, MapPin, Package, Plus, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

type Parcel = { id: string; recipientName: string; unitNumber: string; parcelType: string; receivedAt: string; collectedAt?: string | null; status: 'stored' | 'collected'; senderName: string; notes: string }
type Unit = { id: string; unitNumber: string; residents: string[] }

export const ParcelManager = ({ t: _t }: { t: any }) => {
  const [parcels, setParcels] = useState<Parcel[]>([]), [units, setUnits] = useState<Unit[]>([])
  const [showAddForm, setShowAddForm] = useState(false), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState('')
  const [newParcel, setNewParcel] = useState({ recipientName: '', unitId: '', parcelType: 'package', senderName: '', notes: '' })

  const load = useCallback(async () => {
    try { const response = await fetch('/api/parcels'); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not load parcels'); setParcels(result.data || []); setError('') }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not load parcels') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load(); fetch('/api/watchman/units').then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setUnits(result.units || []) }).catch(() => setError('Could not load properties')) }, [load])

  async function addParcel() {
    setSaving(true); setError('')
    try { const response = await fetch('/api/parcels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newParcel) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not save parcel'); setParcels((current) => [result.data, ...current]); setNewParcel({ recipientName: '', unitId: '', parcelType: 'package', senderName: '', notes: '' }); setShowAddForm(false); toast.success('Parcel recorded', { description: `Resident in Unit ${result.data.unitNumber} can now see it.` }) }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save parcel') }
    finally { setSaving(false) }
  }
  async function markAsCollected(id: string) {
    try { const response = await fetch('/api/parcels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parcelId: id }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not update parcel'); setParcels((current) => current.map((parcel) => parcel.id === id ? result.data : parcel)); toast.success('Parcel marked collected') }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update parcel') }
  }
  const stored = parcels.filter((parcel) => parcel.status === 'stored')
  return <div className="space-y-4">
    <div className="flex gap-2"><button onClick={() => setShowAddForm((open) => !open)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 font-medium text-white hover:bg-indigo-700"><Plus className="h-5 w-5" />Add New Parcel</button><button onClick={load} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-slate-300 bg-white" aria-label="Refresh parcels"><RefreshCw className="h-4 w-4" /></button></div>
    {showAddForm && <div className="space-y-3 rounded-lg border border-indigo-200 bg-white p-4">
      <div><label className="mb-1 block text-sm font-medium text-slate-700">Unit Number</label><select value={newParcel.unitId} onChange={(event) => { const unit = units.find((item) => item.id === event.target.value); setNewParcel((current) => ({ ...current, unitId: event.target.value, recipientName: unit?.residents.join(', ') || '' })) }} className="w-full rounded border border-slate-300 px-3 py-3 text-base"><option value="">Select Unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber} — {unit.residents.join(', ')}</option>)}</select></div>
      <div><label className="mb-1 block text-sm font-medium text-slate-700">Recipient Name</label><input value={newParcel.recipientName} onChange={(event) => setNewParcel({ ...newParcel, recipientName: event.target.value })} className="w-full rounded border border-slate-300 px-3 py-3 text-base" /></div>
      <div><label className="mb-1 block text-sm font-medium text-slate-700">Parcel Type</label><select value={newParcel.parcelType} onChange={(event) => setNewParcel({ ...newParcel, parcelType: event.target.value })} className="w-full rounded border border-slate-300 px-3 py-3 text-base"><option value="package">Package</option><option value="food">Food/Delivery</option><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div>
      <div><label className="mb-1 block text-sm font-medium text-slate-700">Sender/Company</label><input value={newParcel.senderName} onChange={(event) => setNewParcel({ ...newParcel, senderName: event.target.value })} placeholder="Amazon, courier, restaurant..." className="w-full rounded border border-slate-300 px-3 py-3 text-base" /></div>
      <div><label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label><textarea value={newParcel.notes} onChange={(event) => setNewParcel({ ...newParcel, notes: event.target.value })} rows={2} className="w-full rounded border border-slate-300 px-3 py-3 text-base" /></div>
      <div className="flex gap-2"><button onClick={() => setShowAddForm(false)} className="min-h-11 flex-1 rounded border border-slate-300"><X className="mr-1 inline h-4 w-4" />Cancel</button><button onClick={addParcel} disabled={saving || !newParcel.unitId || !newParcel.recipientName || !newParcel.senderName} className="min-h-11 flex-1 rounded bg-indigo-600 font-semibold text-white disabled:bg-slate-300">{saving ? 'Saving...' : 'Save Parcel'}</button></div>
    </div>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="grid grid-cols-2 gap-2"><div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3"><p className="text-xs font-medium text-indigo-700">Stored</p><p className="text-2xl font-bold text-indigo-900">{stored.length}</p></div><div className="rounded-lg border border-green-200 bg-green-50 p-3"><p className="text-xs font-medium text-green-700">Collected</p><p className="text-2xl font-bold text-green-900">{parcels.filter((parcel) => parcel.status === 'collected').length}</p></div></div>
    <div className="space-y-2"><h3 className="text-sm font-semibold text-slate-900">Stored Parcels</h3>{loading ? <p role="status" className="py-5 text-center text-sm text-slate-500">Loading parcels...</p> : stored.length ? stored.map((parcel) => <article key={parcel.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3"><div className="flex items-start gap-2"><Package className="mt-0.5 h-5 w-5 flex-none text-indigo-600" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{parcel.recipientName}</p><div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{parcel.unitNumber}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(parcel.receivedAt).toLocaleString()}</span></div><p className="mt-1 text-xs text-slate-500">From: {parcel.senderName}</p>{parcel.notes && <p className="text-xs text-slate-500">Note: {parcel.notes}</p>}</div></div><button onClick={() => markAsCollected(parcel.id)} className="flex min-h-10 w-full items-center justify-center gap-1 rounded bg-green-100 text-xs font-semibold text-green-800"><CheckCircle2 className="h-4 w-4" />Handed to resident</button></article>) : <div className="py-6 text-center text-slate-500"><Package className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm font-medium">No parcels in storage</p></div>}</div>
  </div>
}
