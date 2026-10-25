import { useState, useRef, useEffect } from 'react'
import { Camera, Plus, X, AlertCircle } from 'lucide-react'
import { useAudioFeedback } from '../hooks/useAudioFeedback'

interface VisitorLogModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (visitor: { unitId: string; name: string; phone: string; reason: string; photo: File }) => boolean | Promise<boolean>
  blacklist: any[]
}

export function VisitorLogModal({ isOpen, onClose, onSubmit, blacklist }: VisitorLogModalProps) {
  const { playBeep } = useAudioFeedback()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    unit: '',
    reason: '',
    photo: null as File | null,
    photoPreview: null as string | null,
  })
  const [uploading, setUploading] = useState(false)
  const [units, setUnits] = useState<Array<{ id: string; unitNumber: string; residents: string[] }>>([])
  const [formError, setFormError] = useState('')
  const [blacklistAlert, setBlacklistAlert] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((current) => ({ ...current, photo: file, photoPreview: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    setFormError('')
    fetch('/api/watchman/units').then(async (response) => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load properties')
      setUnits(result.units || [])
    }).catch((error) => setFormError(error instanceof Error ? error.message : 'Could not load properties'))
  }, [isOpen])

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.unit || !formData.photo) {
      setFormError('Please fill in all required fields')
      return
    }

    // Check blacklist
    const isBlacklisted = blacklist.some(
      b => b.phone === formData.phone && b.isBlacklisted
    )

    if (isBlacklisted) {
      setBlacklistAlert(true)
      setUploading(true)
      setTimeout(() => {
        setUploading(false)
        setBlacklistAlert(false)
        onClose()
        setFormData({ name: '', phone: '', unit: '', reason: '', photo: null, photoPreview: null })
      }, 2000)
      return
    }

    setUploading(true)
    setFormError('')
    try {
      const saved = await onSubmit({ unitId: formData.unit, name: formData.name, phone: formData.phone, reason: formData.reason, photo: formData.photo })
      if (!saved) return
      playBeep('success')
      onClose()
      setFormData({ name: '', phone: '', unit: '', reason: '', photo: null, photoPreview: null })
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Log Visitor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Close visitor form"
          >
            <X className="w-7 h-7 text-slate-900" />
          </button>
        </div>

        {blacklistAlert ? (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-red-900 text-lg">Visitor Denied</p>
              <p className="text-base text-red-800">This visitor is on the blacklist and has been denied entry.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo Capture */}
            <div
              className="bg-slate-100 border-2 border-dashed border-indigo-400 p-8 text-center rounded-lg cursor-pointer hover:bg-indigo-50 rounded-lg"
              onClick={() => cameraRef.current?.click()}
            >
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
              {formData.photoPreview ? (
                <div>
                  <div className="w-32 h-32 mx-auto bg-slate-200 rounded-lg mb-3 relative overflow-hidden">
                    <img
                      src={formData.photoPreview}
                      alt="Visitor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-base font-bold text-indigo-600">Tap to retake photo</p>
                </div>
              ) : (
                <div>
                  <Camera className="w-14 h-14 mx-auto text-indigo-600 mb-2" />
                  <p className="text-xl font-bold text-slate-900">Tap to take photo</p>
                  <p className="text-base text-slate-600">Required</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Visitor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Unit Number *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber}{unit.residents.length ? ` — ${unit.residents.join(', ')}` : ''}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Friend visit, delivery, etc."
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={uploading || !formData.name || !formData.phone || !formData.unit || !formData.photo}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {uploading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-7 h-7" />
                  <span>Log Visitor</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
