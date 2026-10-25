'use client'

import { useData } from '@/contexts/DataContext'
import { useState } from 'react'
import { AdminInvitation } from '@/types'
import { Mail, Phone, Check } from 'lucide-react'

export default function AdminsTab() {
  const { admins, societies, adminInvitations, inviteAdmin } = useData()
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    societyId: '',
  })

  const societeAdmins = admins.filter(a => a.role === 'society-admin')

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.societyId) {
      alert('Please fill all fields')
      return
    }

    const invitation: AdminInvitation = {
      id: `inv-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      societyId: formData.societyId,
      status: 'pending',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      invitedBy: 'superadmin',
    }

    inviteAdmin(invitation)
    setFormData({ name: '', email: '', phone: '', societyId: '' })
    setShowInviteForm(false)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowInviteForm(!showInviteForm)}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        + Invite New Admin
      </button>

      {showInviteForm && (
        <form onSubmit={handleInvite} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Admin Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={formData.societyId}
            onChange={(e) => setFormData({ ...formData, societyId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Select Society</option>
            {societies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Send Invite
            </button>
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="flex-1 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Active Admins */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Society Admins ({societeAdmins.length})</h3>
        <div className="space-y-2">
          {societeAdmins.length > 0 ? (
            societeAdmins.map(admin => (
              <div key={admin.id} className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-900">{admin.name}</p>
                <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{admin.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{admin.phone}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No admins yet</p>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {adminInvitations.filter(i => i.status === 'pending').length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Pending Invitations</h3>
          <div className="space-y-2">
            {adminInvitations
              .filter(i => i.status === 'pending')
              .map(inv => (
                <div key={inv.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">{inv.name}</p>
                  <p className="text-sm text-slate-600">{inv.email}</p>
                  <p className="text-xs text-yellow-700 mt-1">Invited • Expires in 7 days</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
