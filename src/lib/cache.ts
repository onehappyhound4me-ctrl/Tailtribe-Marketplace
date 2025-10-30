/**
 * Advanced Caching Strategy for TailTribe
 * 
 * Caching Layers:
 * 1. Next.js built-in cache (fetch cache)
 * 2. In-memory cache (development)
 * 3. Redis cache (production - optional)
 */

// Simple in-memory cache for development
const memoryCache = new Map<string, { data: any; expires: number }>()

interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // For cache invalidation
}

/**
 * Get from cache
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 60, tags = [] } = options
  
  // Check memory cache first
  const cached = memoryCache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.data as T
  }

  // Fetch fresh data
  const data = await fetcher()
  
  // Store in memory cache
  memoryCache.set(key, {
    data,
    expires: Date.now() + (ttl * 1000)
  })

  return data
}

/**
 * Invalidate cache by key or tags
 */
export function invalidateCache(keyOrTag: string) {
  // Simple implementation: clear all matching keys
  for (const [key, value] of memoryCache.entries()) {
    if (key.includes(keyOrTag)) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  memoryCache.clear()
}

/**
 * Cleanup expired entries (run periodically)
 */
export function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of memoryCache.entries()) {
    if (value.expires <= now) {
      memoryCache.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000)
}

/**
 * Pre-configured cache keys & TTLs
 */
export const CacheKeys = {
  // Long cache (1 hour)
  caregiverProfile: (id: string) => `caregiver:${id}`,
  caregiversList: (filters: string) => `caregivers:list:${filters}`,
  
  // Medium cache (5 minutes)
  bookingDetails: (id: string) => `booking:${id}`,
  userProfile: (id: string) => `user:${id}`,
  
  // Short cache (1 minute)
  searchResults: (query: string) => `search:${query}`,
  messages: (userId: string) => `messages:${userId}`,
  
  // Very short (10 seconds)
  availability: (caregiverId: string) => `availability:${caregiverId}`,
}

export const CacheTTL = {
  LONG: 3600,      // 1 hour
  MEDIUM: 300,     // 5 minutes
  SHORT: 60,       // 1 minute
  VERY_SHORT: 10,  // 10 seconds
}

/**
 * Cache warming - Pre-load popular data
 */
export async function warmCache() {
  // TODO: Implement cache warming for:
  // - Most popular caregivers
  // - Most searched cities
  // - Featured services
}

/**
 * Next.js Fetch Cache Helper
 */
export function getNextCacheConfig(ttl: number = 60) {
  return {
    next: {
      revalidate: ttl,
      tags: [] as string[]
    }
  }
}

/**
 * Stale-While-Revalidate Pattern
 */
export async function getSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime: number = 60
): Promise<T> {
  const cached = memoryCache.get(key)
  
  if (cached) {
    // Return stale data immediately
    const data = cached.data as T
    
    // Revalidate in background if stale
    if (cached.expires <= Date.now()) {
      fetcher().then(freshData => {
        memoryCache.set(key, {
          data: freshData,
          expires: Date.now() + (staleTime * 1000)
        })
      }).catch(console.error)
    }
    
    return data
  }

  // No cache - fetch fresh
  const data = await fetcher()
  memoryCache.set(key, {
    data,
    expires: Date.now() + (staleTime * 1000)
  })
  
  return data
}

/**
 * Cache statistics (for monitoring)
 */
export function getCacheStats() {
  return {
    size: memoryCache.size,
    entries: Array.from(memoryCache.keys())
  }
}





