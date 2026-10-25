'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import SocietyCard from './SocietyCard'
import SocietyDetail from './SocietyDetail'
import CreateSocietyForm from './CreateSocietyForm'
import { Society } from '@/types'

export default function SuperadminDashboard() {
  const { societies, admins } = useData()
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Calculate totals - handle undefined values
  const totalUnits = societies.reduce((acc, s) => acc + (s.villas ?? 0) + (s.bungalows ?? 0) + (s.flats ?? 0), 0)
  const totalResidents = societies.reduce((acc, s) => acc + (s.totalResidents ?? 0), 0)
  const totalAdmins = admins.filter(a => a.role === 'society-admin').length
  const totalVillas = societies.reduce((acc, s) => acc + (s.villas ?? 0), 0)
  const totalBungalows = societies.reduce((acc, s) => acc + (s.bungalows ?? 0), 0)
  const totalFlats = societies.reduce((acc, s) => acc + (s.flats ?? 0), 0)

  if (showCreateForm) {
    return (
      <CreateSocietyForm 
        onBack={() => setShowCreateForm(false)} 
        onSuccess={() => setShowCreateForm(false)}
      />
    )
  }

  if (selectedSociety) {
    return (
      <SocietyDetail 
        society={selectedSociety} 
        onBack={() => setSelectedSociety(null)} 
      />
    )
  }

  return (
    <div>
      {/* Overview Section */}
      <div className="bg-blue-50 rounded-lg -mx-4 px-4 py-4 mb-4">
        <h2 className="text-xs font-semibold text-slate-600 mb-3 uppercase">Overview</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs font-medium text-slate-600 uppercase">Total Societies</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{societies.length}</p>
            <p className="text-xs text-slate-500">Active workspaces</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs font-medium text-slate-600 uppercase">Total Units</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalUnits}</p>
            <p className="text-xs text-slate-500">Across all societies</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs font-medium text-slate-600 uppercase">Total Residents</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalResidents}</p>
            <p className="text-xs text-slate-500">Active members</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs font-medium text-slate-600 uppercase">Total Admins</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalAdmins}</p>
            <p className="text-xs text-slate-500">Managing societies</p>
          </div>
        </div>

        {/* Property Type Summary */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 bg-white rounded-lg py-2 px-3 text-center border border-slate-200">
            <p className="text-xs font-semibold text-purple-600 uppercase">Villas</p>
            <p className="text-xl font-bold text-slate-900">{totalVillas}</p>
          </div>
          <div className="flex-1 bg-white rounded-lg py-2 px-3 text-center border border-slate-200">
            <p className="text-xs font-semibold text-green-600 uppercase">Bungalows</p>
            <p className="text-xl font-bold text-slate-900">{totalBungalows}</p>
          </div>
          <div className="flex-1 bg-white rounded-lg py-2 px-3 text-center border border-slate-200">
            <p className="text-xs font-semibold text-orange-600 uppercase">Flats</p>
            <p className="text-xl font-bold text-slate-900">{totalFlats}</p>
          </div>
        </div>
      </div>

      {/* Societies List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-600 uppercase">All Societies</h2>
          <span className="text-sm text-slate-500">{societies.length}</span>
        </div>

        <div className="space-y-3">
          {societies.map((society) => (
            <SocietyCard 
              key={society.id} 
              society={society} 
              onClick={() => setSelectedSociety(society)}
            />
          ))}
        </div>

        {/* Add Society Button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Add New Society
        </button>
      </div>
    </div>
  )
}
