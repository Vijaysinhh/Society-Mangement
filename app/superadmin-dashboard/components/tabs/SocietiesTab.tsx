'use client'

import { useData } from '@/contexts/DataContext'
import { useState } from 'react'
import SocietyDetail from '../SocietyDetail'
import CreateSocietyForm from '../CreateSocietyForm'
import { Society } from '@/types'
import { AlertCircle, CheckCircle2, Pause, Play, Trash2 } from 'lucide-react'

export default function SocietiesTab() {
  const { societies, pauseSociety, resumeSociety, deleteSociety } = useData()
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list')
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ type: 'delete' | 'pause' | null; society: Society | null }>({ type: null, society: null })

  if (view === 'detail' && selectedSociety) {
    return (
      <SocietyDetail 
        society={selectedSociety} 
        onBack={() => setView('list')}
      />
    )
  }

  if (view === 'create') {
    return (
      <CreateSocietyForm 
        onBack={() => setView('list')}
        onSuccess={() => setView('list')}
      />
    )
  }

  const handleConfirmAction = () => {
    if (!confirmModal.society) return

    if (confirmModal.type === 'delete') {
      deleteSociety(confirmModal.society.id)
    } else if (confirmModal.type === 'pause') {
      pauseSociety(confirmModal.society.id)
    }

    setConfirmModal({ type: null, society: null })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView('create')}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Create Society
        </button>
      </div>

      <div className="space-y-3">
        {societies.length > 0 ? (
          societies.map((society) => (
            <div
              key={society.id}
              onClick={() => {
                setSelectedSociety(society)
                setView('detail')
              }}
              className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{society.name}</h3>
                  <p className="text-sm text-slate-500">{society.city}, {society.state}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  society.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {society.status}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                  {society.villas ?? 0} Villas
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  {society.bungalows ?? 0} Bungalows
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                  {society.flats ?? 0} Flats
                </span>
              </div>

              {/* Occupancy Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">Occupancy</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {society.occupiedUnits ?? 0} / {(society.villas ?? 0) + (society.bungalows ?? 0) + (society.flats ?? 0)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ((society.occupiedUnits ?? 0) / ((society.villas ?? 0) + (society.bungalows ?? 0) + (society.flats ?? 0) || 1)) * 100 > 80
                        ? 'bg-red-600'
                        : 'bg-green-600'
                    }`}
                    style={{
                      width: `${((society.occupiedUnits ?? 0) / ((society.villas ?? 0) + (society.bungalows ?? 0) + (society.flats ?? 0) || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                {society.status === 'active' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmModal({ type: 'pause', society })
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      resumeSociety(society.id)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmModal({ type: 'delete', society })
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">No societies found. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.type && confirmModal.society && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setConfirmModal({ type: null, society: null })} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-6 h-6 ${confirmModal.type === 'delete' ? 'text-red-600' : 'text-orange-600'}`} />
              <h3 className="text-lg font-bold text-slate-900">
                {confirmModal.type === 'delete' ? 'Delete Society' : 'Pause Society'}
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                Are you sure you want to {confirmModal.type === 'delete' ? 'delete' : 'pause'}{' '}
                <span className="font-semibold">{confirmModal.society.name}</span>?
              </p>
              {confirmModal.type === 'delete' && (
                <p className="text-xs text-red-600">
                  This action cannot be undone. All associated data will be removed.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ type: null, society: null })}
                className="flex-1 py-2.5 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 py-2.5 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {confirmModal.type === 'delete' ? 'Delete' : 'Pause'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
