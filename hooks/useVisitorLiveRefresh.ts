'use client'

import { useEffect, useRef, useState } from 'react'

export type LiveConnectionStatus = 'connecting' | 'live' | 'reconnecting'

export function useVisitorLiveRefresh(onRefresh: () => void | Promise<void>) {
  const refreshRef = useRef(onRefresh)
  const [status, setStatus] = useState<LiveConnectionStatus>('connecting')
  useEffect(() => { refreshRef.current = onRefresh }, [onRefresh])

  useEffect(() => {
    const source = new EventSource('/api/visitor-requests/stream')
    let fallback: number | undefined
    const startFallback = () => {
      if (fallback) return
      fallback = window.setInterval(() => void refreshRef.current(), 30000)
    }
    const stopFallback = () => { if (fallback) window.clearInterval(fallback); fallback = undefined }
    source.addEventListener('ready', () => { setStatus('live'); stopFallback() })
    source.addEventListener('visitor-change', () => void refreshRef.current())
    source.addEventListener('stream-error', () => { setStatus('reconnecting'); startFallback() })
    source.onerror = () => { setStatus('reconnecting'); startFallback() }
    return () => { source.close(); stopFallback() }
  }, [])
  return status
}
