'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

export default function ResidentLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ societyCode: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await fetch('/api/auth/resident-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Login failed')
      router.replace('/resident-dashboard'); router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'Login failed') }
    finally { setLoading(false) }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-white"><Building2 className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-bold">Resident login</h1><p className="mt-2 text-sm leading-6 text-slate-600">Use the society code shown in your invitation, your phone number, and your password.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">Society code<input value={form.societyCode} onChange={(e) => setForm({ ...form, societyCode: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base" autoComplete="organization" required /></label><label className="block text-sm font-medium">Phone number<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base" autoComplete="tel" required /></label><label className="block text-sm font-medium">Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base" autoComplete="current-password" required /></label>{error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<button disabled={loading} className="min-h-12 w-full rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in'}</button></form></section></main>
}
