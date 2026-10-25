// Service Worker for offline support and network resilience

const CACHE_NAME = 'society-management-v1'
const API_CACHE = 'society-management-api-v1'

// Files to cache on install
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/app.css'
]

// Install event - cache critical files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // API requests - network first, cache fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(API_CACHE)
            cache.then((c) => c.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Fall back to cached API response
          return caches.match(event.request)
        })
    )
  } else {
    // Static files - cache first, network fallback
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((response) => {
            // Cache new static responses
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone())
              })
            }
            return response
          })
        )
      })
    )
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bills') {
    event.waitUntil(syncPendingBills())
  }
})

async function syncPendingBills() {
  // Get pending actions from IndexedDB
  // Retry failed requests when back online
  console.log('[ServiceWorker] Syncing pending bills...')
}
