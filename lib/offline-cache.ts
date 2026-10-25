'use client'

/**
 * Offline cache using IndexedDB
 * Persists data across page reloads and enables offline viewing
 */

const DB_NAME = 'society-management'
const DB_VERSION = 1

// Store names
const STORES = {
  BILLS: 'bills',
  RESIDENTS: 'residents',
  PROPERTIES: 'properties',
  COMPLAINTS: 'complaints',
  VISITORS: 'visitors',
  PARCELS: 'parcels',
  AMENITIES: 'amenities',
  MESSAGES: 'messages'
}

class OfflineCache {
  private db: IDBDatabase | null = null
  private initialized: Promise<void>

  constructor() {
    this.initialized = this.init()
  }

  private async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('[OfflineCache] Failed to open IndexedDB')
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('[OfflineCache] Initialized')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' })
          }
        })
      }
    })
  }

  async set(store: string, data: any): Promise<void> {
    await this.initialized

    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async get(store: string, id: string): Promise<any> {
    await this.initialized

    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getAll(store: string): Promise<any[]> {
    await this.initialized

    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async delete(store: string, id: string): Promise<void> {
    await this.initialized

    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(store: string): Promise<void> {
    await this.initialized

    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export const offlineCache = new OfflineCache()

/**
 * Hook for offline-aware data fetching
 */
export function useOfflineData<T>(
  store: string,
  fetchFn: () => Promise<T[]>,
  options?: { syncInterval?: number }
) {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  // Load from cache immediately
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await offlineCache.getAll(store)
        setData(cached)
      } catch (err) {
        console.error('[OfflineData] Failed to load cache:', err)
      }
    }

    loadCache()
  }, [store])

  // Sync when online
  useEffect(() => {
    if (!isOnline) return

    const sync = async () => {
      try {
        const fresh = await fetchFn()

        // Save to cache
        for (const item of fresh) {
          await offlineCache.set(store, item)
        }

        setData(fresh)
        setLoading(false)
      } catch (err) {
        console.error('[OfflineData] Sync failed:', err)
        setLoading(false)
      }
    }

    sync()

    // Set up periodic sync
    const interval = setInterval(sync, options?.syncInterval || 60000)
    return () => clearInterval(interval)
  }, [store, isOnline, fetchFn, options?.syncInterval])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { data, loading, isOnline }
}
