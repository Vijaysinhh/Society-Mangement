import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Clock } from 'lucide-react'
import { OfflineSync, type SyncStatus } from './offlineSync'

export function SyncStatusIndicator() {
  const [status, setStatus] = useState<SyncStatus>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    lastSyncTime: null,
  })

  useEffect(() => {
    // Setup listeners
    OfflineSync.setupListeners()
    
    // Get initial status
    setStatus(OfflineSync.getStatus())

    // Subscribe to changes
    const unsubscribe = OfflineSync.subscribe(newStatus => {
      setStatus(newStatus)
    })

    return unsubscribe
  }, [])

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return 'Older'
  }

  if (status.online && status.pendingCount === 0) {
    return null // Don't show if everything is normal
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
      status.online 
        ? status.pendingCount > 0 
          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          : 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800'
    }`}>
      {status.online ? (
        status.pendingCount > 0 ? (
          <>
            <Clock className="w-3 h-3" />
            <span>{status.pendingCount} pending</span>
          </>
        ) : (
          <>
            <Wifi className="w-3 h-3" />
            <span>Synced {formatTime(status.lastSyncTime)}</span>
          </>
        )
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline - {status.pendingCount} queued</span>
        </>
      )}
    </div>
  )
}
