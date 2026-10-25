'use client'

import { useData } from '@/contexts/DataContext'
import { Society } from '@/types'
import { MapPin, Phone, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface SocietyCardProps {
  society: Society
  onClick: () => void
}

export default function SocietyCard({ society, onClick }: SocietyCardProps) {
  const { updateSociety, deleteSociety } = useData()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleInviteAdmin = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement invite admin modal
    alert('Invite Admin feature coming soon!')
  }

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateSociety(society.id, { 
      status: society.status === 'active' ? 'paused' : 'active' 
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    deleteSociety(society.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div 
        className="bg-white border border-slate-200 rounded-lg p-4 active:bg-slate-50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 text-base">{society.name}</h3>
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </div>

        {/* Location & Phone */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="w-3.5 h-3.5" />
            <span>{society.city}, {society.state}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Phone className="w-3.5 h-3.5" />
            <span>{society.phone}</span>
          </div>
        </div>

        {/* Property Type Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
            {society.villas ?? 0} Villas
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
            {society.bungalows ?? 0} Bungalows
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
            {society.flats ?? 0} Flats
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
          <button
            onClick={handleInviteAdmin}
            className="py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Invite Admin
          </button>
          <button
            onClick={handlePause}
            className={`py-2 text-xs font-medium rounded transition-colors ${
              society.status === 'paused' 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-orange-600 hover:bg-orange-50'
            }`}
          >
            {society.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleDelete}
            className="py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90%] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Society</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{society.name}"? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 mt-4">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
