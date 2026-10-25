'use client'

import { X, Check, AlertCircle } from 'lucide-react'

interface PhotoPreviewModalProps {
  isOpen: boolean
  photoUrl: string
  onConfirm: () => void
  onRetake: () => void
  isUploading: boolean
  uploadError?: string
  retryCount?: number
}

export function PhotoPreviewModal({
  isOpen,
  photoUrl,
  onConfirm,
  onRetake,
  isUploading,
  uploadError,
  retryCount = 0
}: PhotoPreviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Confirm Photo</h2>
          <button
            onClick={onRetake}
            disabled={isUploading}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Photo Preview */}
        <div className="mb-4">
          <img
            src={photoUrl}
            alt="Photo preview"
            className="w-full aspect-square object-cover rounded-lg"
          />
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-red-900 text-sm">Upload Failed</p>
              <p className="text-sm text-red-800">{uploadError}</p>
              {retryCount > 0 && retryCount < 3 && (
                <p className="text-xs text-red-700 mt-1">Retry attempt {retryCount}/3</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRetake}
            disabled={isUploading}
            className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-300 disabled:opacity-50"
          >
            Retake
          </button>
          <button
            onClick={onConfirm}
            disabled={isUploading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Use Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
