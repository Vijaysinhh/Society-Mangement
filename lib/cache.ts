interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/**
 * In-memory cache with TTL support
 * Used for caching frequently accessed data within a single server instance
 */
class MemoryCache {
  private store = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Run cleanup every 5 minutes
    this.startCleanup()
  }

  /**
   * Set value in cache with TTL (Time To Live)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.store.set(key, { value, expiresAt })
  }

  /**
   * Get value from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.value
  }

  /**
   * Invalidate all cache keys matching a pattern
   * Example: invalidate('bills:society-123') removes all bills for that society
   */
  invalidate(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get cache statistics for debugging
   */
  stats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.round((entry.expiresAt - Date.now()) / 1000)
      }))
    }
  }

  /**
   * Cleanup expired entries periodically
   */
  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      let cleaned = 0

      for (const [key, entry] of this.store.entries()) {
        if (now > entry.expiresAt) {
          this.store.delete(key)
          cleaned++
        }
      }

      if (cleaned > 0) {
        console.log(`[Cache] Cleaned up ${cleaned} expired entries`)
      }
    }, 300000) // 5 minutes

    // Don't keep process alive just for cache cleanup
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }
}

export const cache = new MemoryCache()

/**
 * Cache key builders - organized by entity and scope
 */
export const CACHE_KEYS = {
  // Society data
  SOCIETY: (id: string) => `society:${id}`,
  
  // Property data
  PROPERTIES: (societyId: string) => `properties:${societyId}`,
  PROPERTY: (id: string) => `property:${id}`,
  
  // Bill data
  BILLS: (societyId: string) => `bills:${societyId}`,
  BILL: (id: string) => `bill:${id}`,
  BILL_PAYMENTS: (societyId: string) => `bill-payments:${societyId}`,
  
  // Complaint data
  COMPLAINTS: (societyId: string) => `complaints:${societyId}`,
  COMPLAINT: (id: string) => `complaint:${id}`,
  
  // Visitor data
  VISITOR_LOGS: (societyId: string) => `visitor-logs:${societyId}`,
  BLACKLIST: (societyId: string) => `blacklist:${societyId}`,
  
  // Amenity data
  AMENITIES: (societyId: string) => `amenities:${societyId}`,
  AMENITY_BOOKINGS: (societyId: string) => `amenity-bookings:${societyId}`,
  
  // Parcel data
  PARCELS: (societyId: string) => `parcels:${societyId}`,
  
  // Watchman data
  DUTY_SCHEDULE: (societyId: string) => `schedule:${societyId}`,
  DUTY_LOGS: (societyId: string) => `duty-logs:${societyId}`,
  
  // Financial data
  FINANCIAL_DATA: (societyId: string) => `financial-data:${societyId}`,
  
  // Messages
  CONVERSATIONS: (residentId: string) => `conversations:${residentId}`,
  MESSAGES: (conversationId: string) => `messages:${conversationId}`,
}

/**
 * Cache TTL constants - how long to cache each type of data
 */
export const CACHE_TTL = {
  VERY_SHORT: 60, // 1 minute - for frequently changing data
  SHORT: 300, // 5 minutes - default for most data
  MEDIUM: 900, // 15 minutes - for moderately stable data
  LONG: 1800, // 30 minutes - for stable data like amenities
  VERY_LONG: 3600, // 1 hour - for rarely changing data
  PERMANENT: 86400, // 1 day - for essentially static data like schedules
}
