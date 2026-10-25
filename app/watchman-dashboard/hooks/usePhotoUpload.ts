import { useState, useCallback } from 'react'

interface UploadResult {
  success: boolean
  url?: string
  error?: string
  retryCount: number
}

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()
  const [retryCount, setRetryCount] = useState(0)

  const uploadPhoto = useCallback(
    async (photoData: string, maxRetries: number = 3): Promise<UploadResult> => {
      setUploading(true)
      setUploadError(undefined)
      setRetryCount(0)

      let lastError: string | undefined
      let currentRetry = 0

      while (currentRetry < maxRetries) {
        try {
          setRetryCount(currentRetry)

          // Simulate upload to server
          // In production, this would be an actual API call
          const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
            // Simulate network delay (1-2 seconds)
            const delay = Math.random() * 1000 + 1000

            setTimeout(() => {
              // Simulate 90% success rate (for realistic retry scenario)
              const isSuccess = Math.random() > 0.1

              if (isSuccess) {
                resolve({ success: true })
              } else {
                resolve({
                  success: false,
                  error: 'Network error. Retrying...'
                })
              }
            }, delay)
          })

          if (result.success) {
            setUploading(false)
            return {
              success: true,
              url: photoData,
              retryCount: currentRetry
            }
          } else {
            lastError = result.error || 'Upload failed'
            currentRetry++

            if (currentRetry < maxRetries) {
              setUploadError(`${lastError} (Attempt ${currentRetry}/${maxRetries})`)
            }
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error'
          currentRetry++

          if (currentRetry < maxRetries) {
            setUploadError(`${lastError} (Attempt ${currentRetry}/${maxRetries})`)
          }
        }
      }

      // All retries failed
      setUploading(false)
      setUploadError(lastError || 'Upload failed after multiple attempts')
      setRetryCount(0)

      return {
        success: false,
        error: lastError,
        retryCount: maxRetries
      }
    },
    []
  )

  return {
    uploading,
    uploadError,
    retryCount,
    uploadPhoto
  }
}
