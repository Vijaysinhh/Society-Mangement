'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function WatchmanLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await fetch('/api/auth/watchman-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Login failed')
      router.replace('/watchman-dashboard'); router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'Login failed') }
    finally { setLoading(false) }
  }
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="grid h-11 w-11 place-items-center rounded-xl bg-purple-700 text-white"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div><h1 className="mt-5 text-2xl font-bold text-slate-950">Watchman login</h1><p className="mt-2 text-sm leading-6 text-slate-600">Use the username and password provided by your Society Admin.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium text-slate-800">Username<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value.toLowerCase().replace(/\s/g, '') })} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200" autoComplete="username" required /></label><label className="block text-sm font-medium text-slate-800">Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200" autoComplete="current-password" required /></label>{error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<button disabled={loading} className="min-h-12 w-full rounded-lg bg-purple-700 px-4 font-semibold text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in'}</button></form></section></main>
}
