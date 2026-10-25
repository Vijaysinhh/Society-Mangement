'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Car, Edit2, Lock, LogOut, Plus, Trash2 } from 'lucide-react'

type Assignment = { id: string; role: string; startDate: string; unit: { id: string; unit_number: string; unit_type: string; floor: number | null; bedroom_count: number | null } }
type Vehicle = { id: string; unit_id: string; registration_number: string; vehicle_type: 'car' | 'bike' | 'scooter' | 'other'; make_model: string | null; color: string | null; parking_slot: string | null }
type ProfileData = { resident: { name: string; phone: string; email: string | null; createdAt: string }; society: { name: string }; assignments: Assignment[]; vehicles: Vehicle[] }
type VehicleForm = { unitId: string; registrationNumber: string; vehicleType: Vehicle['vehicle_type']; makeModel: string; color: string; parkingSlot: string }
type PropertyForm = { assignmentId: string; unitNumber: string; unitType: string; bedroomCount: string; floor: string; assignmentRole: 'owner' | 'tenant' }

export default function ResidentProfile({ onBack, onLogout, onProfileUpdated }: { onBack?: () => void; onLogout?: () => void; onProfileUpdated?: (resident: ProfileData['resident']) => void }) {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [propertyOpen, setPropertyOpen] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '', currentPassword: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>({ unitId: '', registrationNumber: '', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '' })
  const [propertyForm, setPropertyForm] = useState<PropertyForm>({ assignmentId: '', unitNumber: '', unitType: '', bedroomCount: '', floor: '', assignmentRole: 'owner' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const response = await fetch('/api/resident/context', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not load profile'); setData(result.data) }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Could not load profile') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  const openProfileEdit = () => { if (!data) return; setProfileForm({ name: data.resident.name, phone: data.resident.phone, email: data.resident.email || '', currentPassword: '' }); setError(''); setEditOpen(true) }
  const saveProfile = async () => {
    setSaving(true); setError(''); setStatus('')
    try { const response = await fetch('/api/resident/context', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm) }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not update profile'); setData((current) => current ? { ...current, resident: result.data.resident } : current); onProfileUpdated?.(result.data.resident); setStatus(result.data.phoneChanged ? 'Profile updated. Use the new phone number for your next login.' : 'Profile updated successfully.'); setEditOpen(false) }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not update profile') }
    finally { setSaving(false) }
  }
  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setError('New passwords do not match.'); return }
    setSaving(true); setError(''); setStatus('')
    try { const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not change password'); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordOpen(false); setStatus('Password changed successfully.') }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not change password') }
    finally { setSaving(false) }
  }
  const openNewVehicle = () => { setEditingVehicleId(null); setVehicleForm({ unitId: data?.assignments[0]?.unit.id || '', registrationNumber: '', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '' }); setError(''); setVehicleOpen(true) }
  const openVehicleEdit = (vehicle: Vehicle) => { setEditingVehicleId(vehicle.id); setVehicleForm({ unitId: vehicle.unit_id, registrationNumber: vehicle.registration_number, vehicleType: vehicle.vehicle_type, makeModel: vehicle.make_model || '', color: vehicle.color || '', parkingSlot: vehicle.parking_slot || '' }); setError(''); setVehicleOpen(true) }
  const saveVehicle = async () => {
    setSaving(true); setError(''); setStatus('')
    try { const response = await fetch(editingVehicleId ? `/api/resident/vehicles/${editingVehicleId}` : '/api/resident/vehicles', { method: editingVehicleId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vehicleForm) }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not save vehicle'); setVehicleOpen(false); setStatus(editingVehicleId ? 'Vehicle updated successfully.' : 'Vehicle added successfully.'); await load() }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not save vehicle') }
    finally { setSaving(false) }
  }
  const removeVehicle = async (vehicle: Vehicle) => {
    if (!window.confirm(`Remove vehicle ${vehicle.registration_number}?`)) return
    setError(''); setStatus('')
    try { const response = await fetch(`/api/resident/vehicles/${vehicle.id}`, { method: 'DELETE' }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not remove vehicle'); setData((current) => current ? { ...current, vehicles: current.vehicles.filter((item) => item.id !== vehicle.id) } : current); setStatus('Vehicle removed successfully.') }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : 'Could not remove vehicle') }
  }
  const openPropertyEdit = (assignment: Assignment) => {
    setPropertyForm({
      assignmentId: assignment.id,
      unitNumber: assignment.unit.unit_number,
      unitType: assignment.unit.unit_type,
      bedroomCount: assignment.unit.bedroom_count ? String(assignment.unit.bedroom_count) : '',
      floor: assignment.unit.floor === null ? '' : String(assignment.unit.floor),
      assignmentRole: assignment.role === 'tenant' ? 'tenant' : 'owner',
    })
    setError(''); setPropertyOpen(true)
  }
  const saveProperty = async () => {
    setSaving(true); setError(''); setStatus('')
    try {
      const response = await fetch(`/api/resident/properties/${propertyForm.assignmentId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedroomCount: Number(propertyForm.bedroomCount), floor: propertyForm.floor, assignmentRole: propertyForm.assignmentRole }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not update property')
      setData((current) => current ? { ...current, assignments: current.assignments.map((assignment) => assignment.id === propertyForm.assignmentId ? result.data.assignment : assignment) } : current)
      setPropertyOpen(false); setStatus(result.data.roleChangePending ? 'Property details updated. Your Owner/Tenant change is awaiting society admin approval.' : 'Property details updated successfully.')
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not update property') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="bg-slate-50 min-h-screen p-4"><p role="status" className="py-12 text-center text-sm text-slate-600">Loading profile...</p></div>
  if (!data) return <div className="bg-slate-50 min-h-screen p-4"><p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p></div>
  const primary = data.assignments[0]
  const unitLabel = data.assignments.map((assignment) => assignment.unit.unit_number).join(', ')
  const initials = data.resident.name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 3)

  return <div className="bg-slate-50 min-h-screen pb-20"><div className="space-y-6 p-4">
    <button onClick={onBack} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm mb-4"><ArrowLeft className="w-5 h-5" />Back</button>
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white text-center relative overflow-hidden"><div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 rounded-full -mr-20 -mt-20 opacity-20" /><div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-800 rounded-full -ml-16 -mb-16 opacity-20" /><div className="relative z-10"><div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4"><span className="text-2xl font-bold text-purple-600">{initials}</span></div><h2 className="text-2xl font-bold mb-2">{data.resident.name}</h2><p className="text-purple-100">{unitLabel} • {data.society.name}</p></div></div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{status && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{status}</p>}
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"><h3 className="font-semibold text-slate-900 text-lg mb-4">Account Details</h3><Detail label="Email" value={data.resident.email || 'Not provided'} /><Detail label="Phone" value={data.resident.phone} /><Detail label="Unit" value={unitLabel} /><Detail label="Society" value={data.society.name} /><Detail label="Member Since" value={new Date(data.resident.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} last /></div>
    {primary && <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"><h3 className="font-semibold text-slate-900 text-lg">Property Details</h3>{data.assignments.map((assignment) => <div key={assignment.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><div><p className="font-semibold text-slate-900">{assignment.unit.unit_number}</p><p className="mt-1 capitalize">{assignment.role} • {assignment.unit.unit_type}{assignment.unit.bedroom_count ? ` • ${assignment.unit.bedroom_count >= 5 ? '5+' : assignment.unit.bedroom_count} BHK` : ''}{assignment.unit.unit_type === 'flat' && assignment.unit.floor !== null ? ` • Floor ${assignment.unit.floor}` : ''}</p></div><button onClick={() => openPropertyEdit(assignment)} className="rounded p-2 text-purple-600 hover:bg-purple-100" aria-label={`Edit property ${assignment.unit.unit_number}`}><Edit2 className="h-4 w-4" /></button></div>)}</div>}
    <div className="bg-white rounded-xl border border-slate-200 p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 text-lg">My Vehicles</h3><button onClick={openNewVehicle} className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700"><Plus className="h-4 w-4" />Add</button></div><div className="mt-4 space-y-2">{data.vehicles.length === 0 && <p className="text-sm text-slate-500">No vehicles registered.</p>}{data.vehicles.map((vehicle) => <div key={vehicle.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3"><div><p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Car className="h-4 w-4" />{vehicle.registration_number}</p><p className="mt-1 text-xs capitalize text-slate-500">{vehicle.vehicle_type}{vehicle.make_model ? ` • ${vehicle.make_model}` : ''}{vehicle.color ? ` • ${vehicle.color}` : ''}{vehicle.parking_slot ? ` • Parking ${vehicle.parking_slot}` : ''}</p></div><div className="flex gap-1"><button onClick={() => openVehicleEdit(vehicle)} className="rounded p-2 text-purple-600 hover:bg-purple-100" aria-label={`Edit vehicle ${vehicle.registration_number}`}><Edit2 className="h-4 w-4" /></button><button onClick={() => void removeVehicle(vehicle)} className="rounded p-2 text-red-600 hover:bg-red-100" aria-label={`Remove vehicle ${vehicle.registration_number}`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>
    <div className="space-y-3"><button onClick={openProfileEdit} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg"><Edit2 className="w-5 h-5" />Edit Profile</button><button onClick={() => { setError(''); setPasswordOpen(true) }} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"><Lock className="w-5 h-5" />Change Password</button><button onClick={() => setLogoutOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold rounded-lg"><LogOut className="w-5 h-5" />Logout</button></div>
  </div>
  {editOpen && <Modal title="Edit Profile" error={error}><div className="space-y-4"><Field label="Full Name" value={profileForm.name} onChange={(value) => setProfileForm({ ...profileForm, name: value })} /><Field label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm({ ...profileForm, email: value })} /><Field label="Phone" type="tel" value={profileForm.phone} onChange={(value) => setProfileForm({ ...profileForm, phone: value })} /><Field label="Current Password (required only when changing phone)" type="password" value={profileForm.currentPassword} onChange={(value) => setProfileForm({ ...profileForm, currentPassword: value })} /></div><Actions cancel={() => { setEditOpen(false); setError('') }} save={() => void saveProfile()} saving={saving} label="Save Changes" /></Modal>}
  {propertyOpen && <Modal title={`Edit Property ${propertyForm.unitNumber}`} error={error}><div className="space-y-4"><Detail label="Property Type" value={propertyForm.unitType} /><label className="block text-sm font-semibold text-slate-700">Resident Status<select value={propertyForm.assignmentRole} onChange={(event) => setPropertyForm({ ...propertyForm, assignmentRole: event.target.value as 'owner' | 'tenant' })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base"><option value="owner">Owner</option><option value="tenant">Tenant</option></select></label><label className="block text-sm font-semibold text-slate-700">BHK<select value={propertyForm.bedroomCount} onChange={(event) => setPropertyForm({ ...propertyForm, bedroomCount: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base"><option value="">Select BHK</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4 BHK</option><option value="5">5+ BHK</option></select></label>{propertyForm.unitType === 'flat' && <Field label="Floor Number" type="number" value={propertyForm.floor} onChange={(value) => setPropertyForm({ ...propertyForm, floor: value })} />}</div><Actions cancel={() => { setPropertyOpen(false); setError('') }} save={() => void saveProperty()} saving={saving} label="Save Property" /></Modal>}
  {passwordOpen && <Modal title="Change Password" error={error}><div className="space-y-4"><Field label="Current Password" type="password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} /><Field label="New Password" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} /><Field label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} /></div><Actions cancel={() => { setPasswordOpen(false); setError('') }} save={() => void changePassword()} saving={saving} label="Update Password" /></Modal>}
  {vehicleOpen && <Modal title={editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle'} error={error}><div className="grid gap-4 sm:grid-cols-2">{!editingVehicleId && <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Property<select value={vehicleForm.unitId} onChange={(event) => setVehicleForm({ ...vehicleForm, unitId: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base">{data.assignments.map((assignment) => <option key={assignment.unit.id} value={assignment.unit.id}>{assignment.unit.unit_number}</option>)}</select></label>}<Field label="Registration Number" value={vehicleForm.registrationNumber} onChange={(value) => setVehicleForm({ ...vehicleForm, registrationNumber: value.toUpperCase() })} /><label className="text-sm font-semibold text-slate-700">Vehicle Type<select value={vehicleForm.vehicleType} onChange={(event) => setVehicleForm({ ...vehicleForm, vehicleType: event.target.value as Vehicle['vehicle_type'] })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base"><option value="car">Car</option><option value="bike">Bike</option><option value="scooter">Scooter</option><option value="other">Other</option></select></label><Field label="Make and Model" value={vehicleForm.makeModel} onChange={(value) => setVehicleForm({ ...vehicleForm, makeModel: value })} /><Field label="Colour" value={vehicleForm.color} onChange={(value) => setVehicleForm({ ...vehicleForm, color: value })} /><Field label="Parking Slot" value={vehicleForm.parkingSlot} onChange={(value) => setVehicleForm({ ...vehicleForm, parkingSlot: value })} /></div><Actions cancel={() => { setVehicleOpen(false); setError('') }} save={() => void saveVehicle()} saving={saving} label={editingVehicleId ? 'Save Changes' : 'Add Vehicle'} /></Modal>}
  {logoutOpen && <Modal title="Logout"><p className="text-slate-600">Are you sure you want to logout?</p><Actions cancel={() => setLogoutOpen(false)} save={() => { setLogoutOpen(false); onLogout?.() }} saving={false} label="Logout" danger /></Modal>}
  </div>
}

function Detail({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <div className={last ? '' : 'pb-4 border-b border-slate-100'}><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p><p className="text-sm text-slate-900">{value}</p></div> }
function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm font-semibold text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500" /></label> }
function Modal({ title, error, children }: { title: string; error?: string; children: React.ReactNode }) { return <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}><div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6"><h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>{error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{children}</div></div> }
function Actions({ cancel, save, saving, label, danger = false }: { cancel: () => void; save: () => void; saving: boolean; label: string; danger?: boolean }) { return <div className="mt-6 flex gap-3"><button type="button" onClick={cancel} disabled={saving} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-60">Cancel</button><button type="button" onClick={save} disabled={saving} className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg disabled:opacity-60 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}>{saving ? 'Saving...' : label}</button></div> }
