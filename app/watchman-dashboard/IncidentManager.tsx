import { useState } from 'react'
import { AlertCircle, Camera, X, Plus, CheckCircle2, Clock } from 'lucide-react'

export interface Incident {
  id: string
  category: string
  description: string
  photo: string | null
  timestamp: string
  status: 'open' | 'resolved'
  resolvedAt?: string
  notes?: string
}

interface IncidentManagerProps {
  t: any
}

export function IncidentManager({ t }: IncidentManagerProps) {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      category: 'noise',
      description: 'Loud music from unit A-101',
      photo: null,
      timestamp: '2024-03-16 14:30',
      status: 'resolved',
      resolvedAt: '2024-03-16 15:00',
      notes: 'Resident agreed to reduce volume',
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: 'noise',
    description: '',
    photoPreview: null as string | null,
  })

  const cameraRef = useState<HTMLInputElement | null>(null)[1]

  const categories = [
    { value: 'noise', label: 'Noise Complaint' },
    { value: 'theft', label: 'Theft Complaint' },
    { value: 'damage', label: 'Property Damage' },
    { value: 'lost', label: 'Lost & Found' },
    { value: 'security', label: 'Security Issue' },
    { value: 'other', label: 'Other' },
  ]

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, photoPreview: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (formData.category && formData.description) {
      const newIncident: Incident = {
        id: String(incidents.length + 1),
        category: formData.category,
        description: formData.description,
        photo: formData.photoPreview,
        timestamp: new Date().toLocaleString(),
        status: 'open',
      }
      setIncidents([newIncident, ...incidents])
      setFormData({ category: 'noise', description: '', photoPreview: null })
      setShowForm(false)
    }
  }

  const handleResolve = (id: string, notes: string) => {
    setIncidents(
      incidents.map(i =>
        i.id === id
          ? { ...i, status: 'resolved', resolvedAt: new Date().toLocaleString(), notes }
          : i
      )
    )
  }

  const openIncidents = incidents.filter(i => i.status === 'open').length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Open Incidents</p>
          <p className="text-2xl font-bold text-red-600">{openIncidents}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Total Reported</p>
          <p className="text-2xl font-bold text-slate-900">{incidents.length}</p>
        </div>
      </div>

      {/* Report Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Report Incident
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>

          <div className="bg-red-50 rounded-lg border-2 border-dashed border-red-300 p-4 text-center cursor-pointer hover:bg-red-100">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
              ref={(el) => {
                if (el) cameraRef(el)
              }}
            />
            {formData.photoPreview ? (
              <div>
                <div className="w-20 h-20 mx-auto bg-slate-200 rounded-lg mb-2 overflow-hidden">
                  <img src={formData.photoPreview} alt="Evidence" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-red-600 font-medium">Tap to change photo</p>
              </div>
            ) : (
              <div>
                <Camera className="w-6 h-6 mx-auto text-red-600 mb-2" />
                <p className="text-sm font-medium text-slate-900">Tap to take evidence photo (optional)</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.description}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-slate-300"
            >
              Report
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg font-medium hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm">Incident History</h3>
        {incidents.map((incident) => (
          <div key={incident.id} className={`rounded-lg border p-3 ${
            incident.status === 'open'
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex gap-3">
              {incident.photo && (
                <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                  <img src={incident.photo} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {categories.find(c => c.value === incident.category)?.label}
                  </h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    incident.status === 'open'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-green-200 text-green-800'
                  }`}>
                    {incident.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mb-1">{incident.description}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {incident.timestamp}
                </p>
              </div>
            </div>

            {incident.status === 'open' && (
              <button
                onClick={() => {
                  const notes = prompt('Add resolution notes:')
                  if (notes) handleResolve(incident.id, notes)
                }}
                className="mt-2 w-full text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Mark Resolved
              </button>
            )}

            {incident.status === 'resolved' && incident.notes && (
              <p className="mt-2 text-xs bg-white bg-opacity-50 rounded p-2 text-slate-700">
                Resolution: {incident.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
