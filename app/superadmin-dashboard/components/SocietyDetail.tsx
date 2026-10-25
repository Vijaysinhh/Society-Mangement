'use client'

import { useMemo, useState } from 'react'
import { Archive, Building2, Check, CircleDashed, Copy, KeyRound, MapPin, Pause, Play, Settings, ShieldCheck, UserPlus, Users } from 'lucide-react'
import MobileLayout from '@/components/MobileLayout'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useData } from '@/contexts/DataContext'
import type { Admin, Society } from '@/types'
import CreateAdminForm from './CreateAdminForm'
import SocietySettingsModal from './SocietySettingsModal'

interface SocietyDetailProps { society: Society; onBack: () => void }
type ApiResult<T> = { data?: T; error?: string | { message?: string }; message?: string }

function messageFrom(result: ApiResult<unknown>, fallback: string) {
  if (typeof result.error === 'string') return result.error
  return result.error?.message || result.message || fallback
}

function toAdmin(row: Record<string, unknown>): Admin {
  const postName = String(row.post_name || row.postName || 'Society administrator')
  const holderName = row.holder_name || row.holderName
  return {
    id: String(row.id), societyId: String(row.society_id || row.societyId), name: String(holderName || postName),
    username: String(row.username || ''), postName, holderName: holderName ? String(holderName) : undefined,
    phone: String(row.phone || ''), role: 'society-admin', status: (row.status as Admin['status']) || 'active',
    isPrimary: Boolean(row.is_primary ?? row.isPrimary), lastLogin: row.last_login ? new Date(String(row.last_login)) : null,
    createdAt: new Date(String(row.created_at || Date.now())),
  }
}

export default function SocietyDetail({ society, onBack }: SocietyDetailProps) {
  const { admins, addAdmin, updateAdmin, updateSociety } = useData()
  const [currentSociety, setCurrentSociety] = useState(society)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const societyAdmins = useMemo(() => admins.filter((admin) => admin.societyId === society.id), [admins, society.id])
  const configuredProperties = (currentSociety.villas || 0) + (currentSociety.bungalows || 0) + (currentSociety.flats || 0)
  const activeAdmins = societyAdmins.filter((admin) => admin.status === 'active').length
  const completedSetupSteps = 1 + (societyAdmins.length > 0 ? 1 : 0)
  const adminLoginUrl = typeof window === 'undefined' ? '/admin-login' : `${window.location.origin}/admin-login`

  async function request<T>(url: string, options: RequestInit) {
    const response = await fetch(url, options)
    const result = await response.json() as ApiResult<T>
    if (!response.ok) throw new Error(messageFrom(result, 'The operation could not be completed.'))
    return result.data as T
  }

  async function createAdmin(values: { username: string; password: string; phone: string; holderName: string; postName: string }) {
    setBusy(true); setError('')
    try {
      const row = await request<Record<string, unknown>>('/api/society-admins', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societyId: society.id, username: values.username, password: values.password, phone: values.phone, name: values.holderName || values.postName, postName: values.postName }),
      })
      addAdmin(toAdmin(row)); setShowCreateAdmin(false)
      setNotice(`Account ${values.username} created. Share the credentials securely.`)
    } finally { setBusy(false) }
  }

  async function saveSettings(updates: Partial<Society>) {
    const row = await request<Record<string, unknown>>(`/api/societies/${society.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updates.name, address: updates.address, city: updates.city, state: updates.state, contact_person: updates.contactPerson, admin_phone: updates.phone }),
    })
    const normalized = { ...updates, name: String(row.name || updates.name), address: String(row.address || updates.address), city: String(row.city || updates.city), state: String(row.state || updates.state), contactPerson: String(row.contact_person || updates.contactPerson || ''), phone: String(row.admin_phone || updates.phone || '') }
    setCurrentSociety((current) => ({ ...current, ...normalized })); updateSociety(society.id, normalized); setNotice('Society details updated.')
  }

  async function toggleSocietyStatus() {
    const status = currentSociety.status === 'paused' ? 'active' : 'paused'
    setBusy(true); setError('')
    try {
      await request(`/api/societies/${society.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      setCurrentSociety((current) => ({ ...current, status })); updateSociety(society.id, { status })
      setNotice(status === 'paused' ? 'Workspace access paused.' : 'Workspace access resumed.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update workspace status.') } finally { setBusy(false) }
  }

  async function archiveSociety() {
    setBusy(true); setError('')
    try { await request(`/api/societies/${society.id}`, { method: 'DELETE' }); onBack() }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not archive society.'); setShowArchive(false) }
    finally { setBusy(false) }
  }

  async function changeAdminStatus(admin: Admin) {
    const status = admin.status === 'active' ? 'suspended' : 'active'
    setBusy(true); setError('')
    try {
      const row = await request<Record<string, unknown>>(`/api/society-admins/${admin.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      updateAdmin(admin.id, toAdmin(row)); setNotice(`${admin.username} ${status === 'active' ? 'reactivated' : 'suspended'}.`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update admin account.') } finally { setBusy(false) }
  }

  async function resetPassword() {
    if (!selectedAdmin || newPassword.length < 8) { setError('New password must be at least 8 characters.'); return }
    setBusy(true); setError('')
    try {
      await request(`/api/society-admins/${selectedAdmin.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword }) })
      setSelectedAdmin(null); setNewPassword(''); setNotice(`Password updated for ${selectedAdmin.username}.`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not reset password.') } finally { setBusy(false) }
  }

  async function copyAdminUrl() {
    await navigator.clipboard.writeText(adminLoginUrl); setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  const statusClass = currentSociety.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <MobileLayout title={currentSociety.name} showBack onBack={onBack} subtitle="Workspace control center" hideMenu>
      <div className="mx-auto max-w-5xl space-y-5 pb-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div><div className="mb-3 flex flex-wrap items-center gap-2"><Badge variant="outline" className={statusClass}>{currentSociety.status}</Badge>{currentSociety.slug && <span className="text-xs text-slate-500">/{currentSociety.slug}</span>}</div><h2 className="text-xl font-bold text-slate-950">{currentSociety.name}</h2><p className="mt-2 flex items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{[currentSociety.address, currentSociety.city, currentSociety.state].filter(Boolean).join(', ')}</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => setShowSettings(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Settings className="h-4 w-4" />Edit</button><button disabled={busy} onClick={toggleSocietyStatus} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{currentSociety.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}{currentSociety.status === 'paused' ? 'Resume' : 'Pause'}</button><button onClick={() => setShowArchive(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Archive className="h-4 w-4" />Archive</button></div>
          </div>
        </section>

        {(notice || error) && <div role="status" className={`rounded-xl border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{error || notice}</div>}

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold text-slate-950">Workspace setup</p><p className="text-sm text-slate-500">{completedSetupSteps} of 4 foundation steps complete</p></div><span className="text-2xl font-bold text-slate-900">{completedSetupSteps}/4</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-700" style={{ width: `${completedSetupSteps * 25}%` }} /></div><div className="mt-5 space-y-3">{[['Society workspace created', true], ['Administrator account assigned', societyAdmins.length > 0], ['Individual units configured', false], ['Resident and watchman modules enabled', false]].map(([label, done]) => <div key={String(label)} className="flex items-center gap-3 text-sm"><span className={`grid h-6 w-6 place-items-center rounded-full ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{done ? <Check className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}</span><span className={done ? 'font-medium text-slate-800' : 'text-slate-500'}>{label}</span></div>)}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-950">Property readiness</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><Building2 className="mb-3 h-5 w-5 text-blue-700" /><p className="text-2xl font-bold text-slate-950">{configuredProperties}</p><p className="text-xs text-slate-500">Planned properties</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">Units created</p><p className="mt-4 font-semibold text-slate-800">Not configured</p></div></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg border p-2"><b className="block text-base">{currentSociety.villas || 0}</b>Villas</div><div className="rounded-lg border p-2"><b className="block text-base">{currentSociety.bungalows || 0}</b>Bungalows</div><div className="rounded-lg border p-2"><b className="block text-base">{currentSociety.flats || 0}</b>Flats</div></div><p className="mt-4 text-xs text-slate-500">Occupancy becomes available after individual units and residents are configured.</p></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><h3 className="font-bold text-slate-950">Society administrator accounts</h3><p className="text-sm text-slate-500">{activeAdmins} active of {societyAdmins.length} total accounts</p></div><button onClick={() => setShowCreateAdmin(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"><UserPlus className="h-4 w-4" />Create admin</button></div>
          <div className="mt-4 space-y-3">{societyAdmins.length === 0 ? <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">No administrator account has been assigned.</div> : societyAdmins.map((admin) => <article key={admin.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{admin.postName || admin.name}</p>{admin.isPrimary && <Badge variant="secondary"><ShieldCheck className="h-3 w-3" />Primary</Badge>}<Badge variant="outline" className={admin.status === 'active' ? 'text-emerald-700' : 'text-amber-700'}>{admin.status || 'active'}</Badge></div><p className="mt-1 text-sm text-slate-600">Username: <span className="font-mono font-medium">{admin.username}</span>{admin.holderName ? ` · Holder: ${admin.holderName}` : ''}</p><p className="mt-1 text-xs text-slate-500">{admin.phone || 'No phone'} · Last login: {admin.lastLogin ? admin.lastLogin.toLocaleDateString() : 'Never'}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => { setSelectedAdmin(admin); setNewPassword(''); setError('') }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"><KeyRound className="h-4 w-4" />Reset password</button><button disabled={busy || admin.isPrimary} title={admin.isPrimary ? 'The primary account cannot be suspended' : undefined} onClick={() => changeAdminStatus(admin)} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40">{admin.status === 'active' ? 'Suspend' : 'Reactivate'}</button></div></div></article>)}</div>
        </section>

        <section className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-950">Login access</h3><p className="mt-1 text-sm text-slate-500">All society admins use the secure shared login page.</p><div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3"><code className="min-w-0 flex-1 truncate text-sm">{adminLoginUrl}</code><button onClick={copyAdminUrl} aria-label="Copy admin login URL" className="rounded-lg border bg-white p-2 text-slate-600">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</button></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-950">Upcoming modules</h3><div className="mt-4 space-y-3 text-sm"><div className="flex items-center justify-between"><span className="flex items-center gap-2"><Users className="h-4 w-4" />Resident invitations</span><Badge variant="outline">Not configured</Badge></div><div className="flex items-center justify-between"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Watchman accounts</span><Badge variant="outline">Not configured</Badge></div><div className="flex items-center justify-between"><span>Visitor activity</span><Badge variant="outline">Not configured</Badge></div></div></div></section>
      </div>

      <SocietySettingsModal society={currentSociety} isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={saveSettings} />
      {showCreateAdmin && <CreateAdminForm societyName={currentSociety.name} onClose={() => setShowCreateAdmin(false)} onSubmit={createAdmin} isLoading={busy} />}
      <Dialog open={!!selectedAdmin} onOpenChange={(open) => !open && setSelectedAdmin(null)}><DialogContent><DialogHeader><DialogTitle>Reset administrator password</DialogTitle><DialogDescription>Set a permanent password for {selectedAdmin?.username}. Existing sessions remain valid.</DialogDescription></DialogHeader><label className="text-sm font-medium">New password<Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2" minLength={8} /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<DialogFooter><button onClick={() => setSelectedAdmin(null)} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={busy} onClick={resetPassword} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Updating...' : 'Update password'}</button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={showArchive} onOpenChange={setShowArchive}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive {currentSociety.name}?</AlertDialogTitle><AlertDialogDescription>Archiving disables workspace access while preserving accounts and history. This is not permanent deletion.</AlertDialogDescription></AlertDialogHeader><div className="flex justify-end gap-2"><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={archiveSociety} className="bg-red-700 hover:bg-red-800">Archive workspace</AlertDialogAction></div></AlertDialogContent></AlertDialog>
    </MobileLayout>
  )
}
