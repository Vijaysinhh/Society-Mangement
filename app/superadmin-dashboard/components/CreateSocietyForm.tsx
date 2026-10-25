'use client'

import { useState } from 'react'
import MobileLayout from '@/components/MobileLayout'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle2, Plus, X } from 'lucide-react'

interface CreateSocietyFormProps {
  onBack: () => void
  onSuccess: () => void
}

export default function CreateSocietyForm({ onBack, onSuccess }: CreateSocietyFormProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    villas: 0,
    bungalows: 0,
    flats: 0,
    contactPerson: '',
    phone: '',
    positions: [] as Array<{ name: string; phone: string }>,
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    adminPhone: '',
  })



  const handleAddPosition = () => {
    setFormData({
      ...formData,
      positions: [...formData.positions, { name: '', phone: '' }]
    })
  }

  const handleRemovePosition = (index: number) => {
    setFormData({
      ...formData,
      positions: formData.positions.filter((_, i) => i !== index)
    })
  }

  const handleUpdatePosition = (index: number, field: 'name' | 'phone', value: string) => {
    const updatedPositions = [...formData.positions]
    updatedPositions[index] = { ...updatedPositions[index], [field]: value }
    setFormData({
      ...formData,
      positions: updatedPositions
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address || !formData.city || !formData.contactPerson || !formData.phone || !formData.adminName || !formData.adminUsername || !formData.adminPassword) {
      setError('Complete the society and primary administrator details.')
      return
    }
    if (formData.adminPassword.length < 8) {
      setError('Administrator password must be at least 8 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(formData.adminUsername)) {
      setError('Admin username must be 3–50 characters and use only letters, numbers, underscores, or hyphens.')
      return
    }

    // Show confirmation modal instead of creating immediately
    setShowConfirmation(true)
  }

  const confirmCreate = async () => {
    try {
      setSaving(true)
      setError('')
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      // Call API to create society
      const response = await fetch('/api/societies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          society: {
            name: formData.name,
            slug,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            phone: formData.phone,
            contactPerson: formData.contactPerson,
            villas: formData.villas,
            bungalows: formData.bungalows,
            flats: formData.flats,
          },
          admin: {
            name: formData.adminName,
            username: formData.adminUsername,
            password: formData.adminPassword,
            phone: formData.adminPhone,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const message = typeof errorData?.error === 'string'
          ? errorData.error
          : errorData?.error?.message || 'Failed to create society'
        setError(message)
        setShowConfirmation(false)
        return
      }
      setShowConfirmation(false)
      onSuccess()
      window.location.reload()
    } catch (error) {
      console.error('[v0] Error in confirmCreate:', error)
      setError('Failed to create society. Please try again.')
      setShowConfirmation(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileLayout title="Create Society" showBack onBack={onBack} subtitle="">
      <form onSubmit={handleSubmit} className="">
        {/* Step 1: Society Details */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase mb-4 tracking-wide">
            Step 1: Society Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Society Name *
              </label>
              <Input
                placeholder="e.g., Green Valley Society"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Address *
              </label>
              <Input
                placeholder="e.g., 123 Main Street, Sector 42"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  City *
                </label>
                <Input
                  placeholder="e.g., Gurgaon"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  State
                </label>
                <Input
                  placeholder="e.g., Haryana"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Property Details */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase mb-4 tracking-wide">
            Step 2: Property Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Number of Villas
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.villas.toString()}
                onChange={(e) => setFormData({ ...formData, villas: parseInt(e.target.value) || 0 })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Number of Bungalows
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.bungalows.toString()}
                onChange={(e) => setFormData({ ...formData, bungalows: parseInt(e.target.value) || 0 })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Number of Flats
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.flats.toString()}
                onChange={(e) => setFormData({ ...formData, flats: parseInt(e.target.value) || 0 })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Contact Information */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase mb-4 tracking-wide">
            Step 3: Contact Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Contact Person Name *
              </label>
              <Input
                placeholder="e.g., Rajesh Kumar"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Step 3.5: Additional Positions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Step 3.5: Additional Positions
            </h2>
            <button
              type="button"
              onClick={handleAddPosition}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium border border-blue-200"
            >
              <Plus className="w-4 h-4" />
              Add Position
            </button>
          </div>

          {formData.positions.length > 0 ? (
            <div className="space-y-4">
              {formData.positions.map((position, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(index)}
                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label="Remove position"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-4 pr-10">
                    <div>
                      <label className="text-sm font-medium text-slate-900 block mb-2">
                        Position Name / Title
                      </label>
                      <Input
                        placeholder="e.g., Maintenance Head, Security Chief"
                        value={position.name}
                        onChange={(e) => handleUpdatePosition(index, 'name', e.target.value)}
                        className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 block mb-2">
                        Position Phone
                      </label>
                      <Input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={position.phone}
                        onChange={(e) => handleUpdatePosition(index, 'phone', e.target.value)}
                        className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className="text-sm text-slate-600">No additional positions added yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click "Add Position" to add maintenance heads, security chiefs, or other key contacts.</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase mb-4 tracking-wide">Step 4: Primary Society Admin</h2>
          <p className="mb-4 text-sm text-slate-600">This is a post account. Its password remains valid until an administrator changes it.</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">Post holder name *</label>
              <Input value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} placeholder="e.g., Society Secretary" className="h-12 rounded-lg border-slate-300 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">Admin username *</label>
              <Input
                value={formData.adminUsername}
                onChange={(e) => setFormData({
                  ...formData,
                  adminUsername: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_-]/g, ''),
                })}
                placeholder="e.g., greenvalley_admin"
                autoComplete="off"
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_-]{3,50}"
                className="h-12 rounded-lg border-slate-300 bg-white"
              />
              <p className="mt-1 text-xs text-slate-500">3–50 characters. Spaces become underscores; special characters are removed.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">Admin password *</label>
              <Input type="password" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} autoComplete="new-password" className="h-12 rounded-lg border-slate-300 bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">Admin phone</label>
              <Input type="tel" value={formData.adminPhone} onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })} className="h-12 rounded-lg border-slate-300 bg-white" />
            </div>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {/* Submit Buttons */}
        <div className="space-y-3 pb-8">
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Society
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3.5 bg-white border border-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowConfirmation(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Confirm Society Creation</h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">{formData.name}</span> will be created with:
              </p>
              <ul className="text-sm text-slate-600 ml-4 space-y-1">
                <li>• Location: {formData.city}, {formData.state}</li>
                <li>• Properties: {formData.villas} villas, {formData.bungalows} bungalows, {formData.flats} flats</li>
                <li>• Contact: {formData.contactPerson}</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreate}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {saving ? 'Creating…' : 'Confirm'}
              </button>
            </div>
          </div>
        </>
      )}
    </MobileLayout>
  )
}
