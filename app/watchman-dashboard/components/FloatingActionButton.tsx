'use client'

import { Plus } from 'lucide-react'
import { useAudioFeedback } from '../hooks/useAudioFeedback'

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const { playBeep } = useAudioFeedback()
  
  const handleClick = () => {
    playBeep('click')
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center z-40"
      aria-label="Add visitor"
      title="Quick log visitor"
    >
      <Plus className="w-8 h-8" />
    </button>
  )
}
