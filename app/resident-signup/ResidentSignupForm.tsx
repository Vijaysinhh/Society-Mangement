'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Car, CheckCircle2, Plus, Trash2 } from 'lucide-react'

type SignupVehicle = { registrationNumber: string; vehicleType: 'car' | 'bike' | 'scooter' | 'other'; makeModel: string; color: string; parkingSlot: string }
const emptyVehicle = (): SignupVehicle => ({ registrationNumber: '', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '' })

export default function ResidentSignupForm({ token }: { token: string }) {
  const router = useRouter()
  const [societyName, setSocietyName] = useState('')
  const [societyCode, setSocietyCode] = useState('')
  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', assignmentRole: 'owner', unitNumber: '', unitType: 'flat', floor: '', bedroomCount: '' })
  const [vehicles, setVehicles] = useState<SignupVehicle[]>([])

  useEffect(() => {
    if (!token) { setError('This invitation link is incomplete.'); setValidating(false); return }
    fetch(`/api/resident-invitations/validate?token=${encodeURIComponent(token)}`)
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || result.error); return result.data })
      .then((data) => { setSocietyName(data.societyName); setSocietyCode(data.societyCode) })
      .catch((error) => setError(error instanceof Error ? error.message : 'This invitation is not valid.'))
      .finally(() => setValidating(false))
  }, [token])

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError('')
    try {
      const response = await fetch('/api/resident-signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, vehicles, token }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not create your account')
      router.replace('/resident-dashboard'); router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not create your account') }
    finally { setSubmitting(false) }
  }

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const updateVehicle = (index: number, key: keyof SignupVehicle, value: string) => setVehicles((current) => current.map((vehicle, vehicleIndex) => vehicleIndex === index ? { ...vehicle, [key]: value } as SignupVehicle : vehicle))
  const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100'

  if (validating) return <main className="grid min-h-screen place-items-center bg-slate-50 p-4"><p role="status" className="text-sm text-slate-600">Checking invitation...</p></main>
  if (!societyName) return <main className="grid min-h-screen place-items-center bg-slate-50 p-4"><section className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6"><h1 className="text-xl font-bold">Invitation unavailable</h1><p role="alert" className="mt-3 text-sm leading-6 text-red-700">{error}</p><p className="mt-4 text-sm text-slate-600">Ask your society administrator to generate a new resident link.</p></section></main>

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-white"><Building2 className="h-6 w-6" /></div><p className="mt-5 text-sm font-semibold text-blue-700">{societyName}</p><h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Create your resident account</h1><p className="mt-2 text-sm leading-6 text-slate-600">Enter your account and property details. If the unit already exists, we will connect your account to it.</p><p className="mt-2 text-xs text-slate-500">Your login society code is <strong className="font-mono text-slate-700">{societyCode}</strong>.</p></header>
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <fieldset><legend className="text-base font-bold">Your account</legend><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Full name *<input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} autoComplete="name" required /></label><label className="text-sm font-medium">Phone number *<input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} autoComplete="tel" inputMode="tel" required /></label><label className="text-sm font-medium">Email <span className="font-normal text-slate-500">(optional)</span><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} autoComplete="email" /></label><label className="text-sm font-medium">Password *<input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass} autoComplete="new-password" minLength={8} required /><span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters</span></label></div></fieldset>
          <fieldset className="border-t border-slate-200 pt-6"><legend className="text-base font-bold">Your property</legend><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">I am the *<select value={form.assignmentRole} onChange={(e) => update('assignmentRole', e.target.value)} className={inputClass}><option value="owner">Owner</option><option value="tenant">Tenant</option></select></label><label className="text-sm font-medium">Property type *<select value={form.unitType} onChange={(e) => setForm((current) => ({ ...current, unitType: e.target.value, floor: e.target.value === 'flat' ? current.floor : '' }))} className={inputClass}><option value="flat">Flat</option><option value="villa">Villa</option><option value="bungalow">Bungalow</option></select></label><label className="text-sm font-medium">Unit number *<input value={form.unitNumber} onChange={(e) => update('unitNumber', e.target.value)} className={inputClass} placeholder="e.g. A-101" required /></label><label className="text-sm font-medium">BHK *<select value={form.bedroomCount} onChange={(e) => update('bedroomCount', e.target.value)} className={inputClass} required><option value="">Select BHK</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4 BHK</option><option value="5">5+ BHK</option></select></label>{form.unitType === 'flat' && <label className="text-sm font-medium sm:col-span-2">Floor number *<input type="number" min="0" value={form.floor} onChange={(e) => update('floor', e.target.value)} className={inputClass} placeholder="0 for ground floor" required /></label>}</div></fieldset>
          <fieldset className="border-t border-slate-200 pt-6">
            <legend className="text-base font-bold">Your vehicles <span className="font-normal text-slate-500">(optional)</span></legend>
            <p className="mt-2 text-sm text-slate-600">Add vehicles used by your household. These details help society security identify approved vehicles.</p>
            <div className="mt-4 space-y-4">
              {vehicles.map((vehicle, index) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Car className="h-4 w-4" />Vehicle {index + 1}</p><button type="button" onClick={() => setVehicles((current) => current.filter((_, vehicleIndex) => vehicleIndex !== index))} className="rounded-lg p-2 text-red-600 hover:bg-red-100" aria-label={`Remove vehicle ${index + 1}`}><Trash2 className="h-4 w-4" /></button></div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">Registration number *<input value={vehicle.registrationNumber} onChange={(event) => updateVehicle(index, 'registrationNumber', event.target.value.toUpperCase())} className={inputClass} placeholder="e.g. MH12AB1234" required /></label>
                    <label className="text-sm font-medium">Vehicle type *<select value={vehicle.vehicleType} onChange={(event) => updateVehicle(index, 'vehicleType', event.target.value)} className={inputClass}><option value="car">Car</option><option value="bike">Bike</option><option value="scooter">Scooter</option><option value="other">Other</option></select></label>
                    <label className="text-sm font-medium">Make and model<input value={vehicle.makeModel} onChange={(event) => updateVehicle(index, 'makeModel', event.target.value)} className={inputClass} placeholder="e.g. Honda City" maxLength={100} /></label>
                    <label className="text-sm font-medium">Colour<input value={vehicle.color} onChange={(event) => updateVehicle(index, 'color', event.target.value)} className={inputClass} placeholder="e.g. White" maxLength={50} /></label>
                    <label className="text-sm font-medium sm:col-span-2">Parking slot<input value={vehicle.parkingSlot} onChange={(event) => updateVehicle(index, 'parkingSlot', event.target.value)} className={inputClass} placeholder="e.g. P-24" maxLength={50} /></label>
                  </div>
                </div>
              ))}
              {vehicles.length < 10 && <button type="button" onClick={() => setVehicles((current) => [...current, emptyVehicle()])} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 px-4 text-sm font-semibold text-blue-700 hover:border-blue-500 hover:bg-blue-50"><Plus className="h-4 w-4" />{vehicles.length ? 'Add another vehicle' : 'Add a vehicle'}</button>}
            </div>
          </fieldset>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60"><CheckCircle2 className="h-5 w-5" />{submitting ? 'Creating account...' : 'Create resident account'}</button>
        </form>
      </div>
    </main>
  )
}
