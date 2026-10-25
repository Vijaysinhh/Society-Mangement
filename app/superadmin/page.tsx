'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperadminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/superadmin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Invalid email or password')
      router.replace('/superadmin-dashboard')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-medium text-blue-400">Platform control</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Superadmin login</h1>
        <p className="mt-2 text-sm text-slate-400">Manage societies and society-admin post accounts.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Password
            <input className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200">{error}</p>}
          <button className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
