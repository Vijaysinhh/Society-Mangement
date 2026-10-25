'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Invalid username or password')
      router.replace('/society-admin')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-700">Society operations</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Society admin login</h1>
        <p className="mt-2 text-sm text-slate-600">Use the post credentials issued by the superadmin.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-800">
            Username
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Password
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

