import { useState } from 'react'
import { Trash2, Plus, AlertCircle, CheckCircle2, X } from 'lucide-react'

export interface BlacklistedPerson {
  id: string
  name: string
  phone: string
  reason: string
  dateAdded: string
  isBlacklisted: boolean
}

interface BlacklistManagerProps {
  onClose: () => void
  t: any
}

export const BlacklistManager = ({ onClose, t }: BlacklistManagerProps) => {
  const [blacklist, setBlacklist] = useState<BlacklistedPerson[]>([
    {
      id: '1',
      name: 'Rajesh Patel',
      phone: '9876543210',
      reason: 'Theft incident on 15-03-2024',
      dateAdded: '2024-03-15',
      isBlacklisted: true,
    },
    {
      id: '2',
      name: 'Amit Singh',
      phone: '8765432109',
      reason: 'Unauthorized entry attempt',
      dateAdded: '2024-03-10',
      isBlacklisted: true,
    },
  ])

  const [newPerson, setNewPerson] = useState({
    name: '',
    phone: '',
    reason: '',
  })

  const addToBlacklist = () => {
    if (newPerson.name && newPerson.phone && newPerson.reason) {
      const person: BlacklistedPerson = {
        id: String(blacklist.length + 1),
        name: newPerson.name,
        phone: newPerson.phone,
        reason: newPerson.reason,
        dateAdded: new Date().toLocaleDateString(),
        isBlacklisted: true,
      }
      setBlacklist([person, ...blacklist])
      setNewPerson({ name: '', phone: '', reason: '' })
      alert(`${newPerson.name} added to blacklist`)
    }
  }

  const removeFromBlacklist = (id: string) => {
    setBlacklist(blacklist.filter(p => p.id !== id))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl overflow-y-auto max-h-[90vh] pb-6">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{t.settings.blacklist}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Add New Person */}
          <div className="bg-red-50 rounded-lg border border-red-200 p-4 space-y-3">
            <p className="font-semibold text-red-900 text-sm">{t.settings.manageBlacklist}</p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.log.visitorName}</label>
              <input
                type="text"
                value={newPerson.name}
                onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                placeholder={t.log.enterName}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.log.phoneNumber}</label>
              <input
                type="tel"
                value={newPerson.phone}
                onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                placeholder={t.log.phoneExample}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Reason</label>
              <textarea
                value={newPerson.reason}
                onChange={(e) => setNewPerson({...newPerson, reason: e.target.value})}
                placeholder="Why is this person blacklisted?"
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              onClick={addToBlacklist}
              disabled={!newPerson.name || !newPerson.phone || !newPerson.reason}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Blacklist
            </button>
          </div>

          {/* Blacklist Count */}
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-900">
              {blacklist.length} person{blacklist.length !== 1 ? 's' : ''} blacklisted
            </span>
          </div>

          {/* Blacklist Table */}
          <div className="space-y-2">
            {blacklist.length > 0 ? (
              blacklist.map((person) => (
                <div key={person.id} className="bg-white rounded-lg border border-red-200 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{person.name}</p>
                      <p className="text-xs text-slate-600">{person.phone}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded p-2">
                    <p className="text-xs text-slate-700">
                      <span className="font-medium">Reason:</span> {person.reason}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Added: {person.dateAdded}</p>
                  </div>

                  <button
                    onClick={() => removeFromBlacklist(person.id)}
                    className="w-full text-xs bg-red-100 text-red-700 py-1.5 rounded hover:bg-red-200 flex items-center justify-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove from Blacklist
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">No blacklisted persons</p>
                <p className="text-xs">Society is safe</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
