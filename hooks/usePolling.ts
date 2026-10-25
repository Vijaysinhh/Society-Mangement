'use client'

import { useEffect, useState, useCallback } from 'react'

interface UsePollingOptions {
  interval?: number // milliseconds between polls
  enabled?: boolean // pause polling
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
  retryCount?: number // retry failed requests
  retryDelay?: number // delay between retries
}

/**
 * Hook for polling data from API with configurable intervals
 * Typical use: polls every 20 seconds for non-critical updates
 */
export function usePolling<T>(
  url: string | null,
  options: UsePollingOptions = {}
): {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastUpdate: Date | null
} {
  const {
    interval = 20000, // 20 seconds default
    enabled = true,
    onError,
    onSuccess,
    retryCount = 3,
    retryDelay = 1000
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Get token from localStorage (or context/session in production)
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }, [])

  // Fetch with retry logic
  const fetchData = useCallback(
    async (retry = 0): Promise<void> => {
      if (!url || !enabled) return

      try {
        setLoading(true)
        const token = getToken()

        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - please log in again')
          }
          throw new Error(`API error: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data)
          setLastUpdate(new Date())
          setError(null)
          onSuccess?.(result.data)
        } else {
          throw new Error(result.error?.message || 'Unknown error')
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')

        // Retry logic for transient errors
        if (retryCount > retry && error.message !== 'Unauthorized - please log in again') {
          setTimeout(() => fetchData(retry + 1), retryDelay * (retryCount + 1))
          return
        }

        setError(error)
        onError?.(error)
      } finally {
        setLoading(false)
      }
    },
    [url, enabled, getToken, onError, onSuccess, retryCount, retryDelay]
  )

  // Initial fetch and polling interval
  useEffect(() => {
    if (!enabled || !url) return

    // Fetch immediately
    fetchData()

    // Set up polling interval
    const timer = setInterval(() => {
      fetchData()
    }, interval)

    return () => clearInterval(timer)
  }, [url, enabled, interval, fetchData])

  return { data, loading, error, refetch: () => fetchData(), lastUpdate }
}

/**
 * Hook for fetching data once (no polling)
 */
export function useFetch<T>(url: string | null): {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const { data, loading, error, refetch } = usePolling(url, {
    interval: Infinity, // No polling
    enabled: !!url
  })

  return { data, loading, error, refetch }
}

/**
 * Hook for WebSocket real-time data (critical updates)
 */
export function useWebSocket(url: string | null): {
  data: any
  connected: boolean
  error: Error | null
} {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setConnected(true)
        setError(null)
      }

      ws.onclose = () => {
        setConnected(false)
      }

      ws.onerror = (event) => {
        setError(new Error('WebSocket error'))
        setConnected(false)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setData(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      return () => ws.close()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'))
    }
  }, [url])

  return { data, connected, error }
}

/**
 * Hook that combines polling with fallback to WebSocket
 * Uses WebSocket for critical updates, falls back to polling if WebSocket fails
 */
export function useHybridPolling<T>(
  pollingUrl: string,
  wsUrl: string | null,
  options: UsePollingOptions = {}
): {
  data: T | null
  loading: boolean
  error: Error | null
  connected: boolean
  source: 'websocket' | 'polling' | 'none'
} {
  const polling = usePolling(pollingUrl, options)
  const ws = useWebSocket(wsUrl)

  // Prefer WebSocket if connected, otherwise use polling
  const source: 'websocket' | 'polling' | 'none' =
    ws.connected && ws.data ? 'websocket' : polling.data ? 'polling' : 'none'

  return {
    data: ws.connected && ws.data ? ws.data : polling.data,
    loading: polling.loading,
    error: polling.error || ws.error,
    connected: ws.connected,
    source
  }
}
