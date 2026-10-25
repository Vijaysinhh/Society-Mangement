'use client'

import { createContext, useContext, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'

interface DataSyncContextType {
  // Polling state
  enablePolling: (key: string, interval: number) => void
  disablePolling: (key: string) => void
  
  // WebSocket state
  connectWebSocket: (url: string) => void
  disconnectWebSocket: () => void
  isWebSocketConnected: boolean
  
  // Real-time events
  onDataUpdate: (callback: (data: any) => void) => void
  onEmergencyAlert: (callback: (alert: any) => void) => void
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined)

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const wsRef = useRef<WebSocket | null>(null)
  const updateCallbacks = useRef<Set<(data: any) => void>>(new Set())
  const alertCallbacks = useRef<Set<(alert: any) => void>>(new Set())
  const isWebSocketConnected = !!wsRef.current && wsRef.current.readyState === WebSocket.OPEN

  // WebSocket connection for real-time alerts
  const connectWebSocket = useCallback((url: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        console.log('[DataSync] WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'EMERGENCY_ALERT') {
            alertCallbacks.current.forEach(cb => cb(message.data))
          } else if (message.type === 'UPDATE') {
            updateCallbacks.current.forEach(cb => cb(message.data))
          }
        } catch (err) {
          console.error('[DataSync] Failed to parse WebSocket message:', err)
        }
      }

      wsRef.current.onclose = () => {
        console.log('[DataSync] WebSocket disconnected')
        wsRef.current = null
      }

      wsRef.current.onerror = (err) => {
        console.error('[DataSync] WebSocket error:', err)
      }
    } catch (err) {
      console.error('[DataSync] Failed to connect WebSocket:', err)
    }
  }, [])

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // Setup WebSocket on auth
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/websocket?token=${token}`

    connectWebSocket(wsUrl)

    return () => {
      disconnectWebSocket()
    }
  }, [isAuthenticated, user, connectWebSocket, disconnectWebSocket])

  // Polling management
  const enablePolling = useCallback((key: string, interval: number) => {
    // Only implemented in components - this is just the interface
    // Actual polling happens in components using usePolling hook
  }, [])

  const disablePolling = useCallback((key: string) => {
    const timer = pollingIntervals.current.get(key)
    if (timer) {
      clearInterval(timer)
      pollingIntervals.current.delete(key)
    }
  }, [])

  // Event subscription helpers
  const onDataUpdate = useCallback((callback: (data: any) => void) => {
    updateCallbacks.current.add(callback)
    return () => updateCallbacks.current.delete(callback)
  }, [])

  const onEmergencyAlert = useCallback((callback: (alert: any) => void) => {
    alertCallbacks.current.add(callback)
    return () => alertCallbacks.current.delete(callback)
  }, [])

  return (
    <DataSyncContext.Provider
      value={{
        enablePolling,
        disablePolling,
        connectWebSocket,
        disconnectWebSocket,
        isWebSocketConnected,
        onDataUpdate,
        onEmergencyAlert
      }}
    >
      {children}
    </DataSyncContext.Provider>
  )
}

export function useDataSync() {
  const context = useContext(DataSyncContext)
  if (!context) {
    throw new Error('useDataSync must be used within DataSyncProvider')
  }
  return context
}
