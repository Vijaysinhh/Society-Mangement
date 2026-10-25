'use client'

import { useEffect, useState } from 'react'
import { Society } from '@/types'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  society: Society
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<Society>) => Promise<void>
}

export default function SocietySettingsModal({ society, isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: society.name,
    address: society.address,
    city: society.city,
    state: society.state,
    contactPerson: society.contactPerson,
    phone: society.phone,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) setForm({ name: society.name, address: society.address, city: society.city, state: society.state, contactPerson: society.contactPerson, phone: society.phone })
  }, [isOpen, society])

  async function save() {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Society name, address, and city are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save society settings')
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, required = false) => (
    <label className="block text-sm font-medium text-slate-800">
      {label}{required ? ' *' : ''}
      <Input className="mt-2 h-11 text-base" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
    </label>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit society details</DialogTitle>
          <DialogDescription>Changes apply to the society workspace and its administrative record.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">{field('Society name', 'name', true)}</div>
          <div className="sm:col-span-2">{field('Address', 'address', true)}</div>
          {field('City', 'city', true)}
          {field('State', 'state')}
          {field('Contact person', 'contactPerson')}
          {field('Contact phone', 'phone')}
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <DialogFooter>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700">Cancel</button>
          <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
