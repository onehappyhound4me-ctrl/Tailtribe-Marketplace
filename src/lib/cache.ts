/**
 * Simple in-memory cache with TTL for API responses
 * For production, consider using Redis or Vercel KV
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 60 * 1000 // 1 minute default

  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const cache = new SimpleCache()

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Generate cache key from search parameters
 */
export function getSearchCacheKey(params: {
  city?: string
  service?: string
  country?: string
  minRate?: number
  maxRate?: number
  userLat?: number
  userLng?: number
}): string {
  const parts = [
    'search',
    params.city || '',
    params.service || '',
    params.country || '',
    params.minRate || '',
    params.maxRate || '',
    params.userLat ? Math.round(params.userLat * 100) / 100 : '',
    params.userLng ? Math.round(params.userLng * 100) / 100 : '',
  ]
  return parts.join(':')
}
