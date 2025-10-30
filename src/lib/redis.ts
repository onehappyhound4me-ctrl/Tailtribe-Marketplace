/**
 * Redis Cache Implementation for Production
 * 
 * For 5000+ users, we need distributed caching
 * Use Upstash Redis (serverless, perfect for Vercel)
 */

// Type definitions
interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
}

interface RedisClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, options?: { ex?: number }) => Promise<string>
  del: (key: string) => Promise<number>
  exists: (key: string) => Promise<number>
  expire: (key: string, seconds: number) => Promise<number>
  keys: (pattern: string) => Promise<string[]>
}

// Upstash Redis client (lazy init)
let redisClient: RedisClient | null = null

function getRedisClient(): RedisClient | null {
  if (typeof window !== 'undefined') return null // Client-side
  
  if (redisClient) return redisClient
  
  // Only initialize if Redis URL is configured
  if (!process.env.REDIS_URL) {
    console.warn('Redis not configured, using in-memory cache')
    return null
  }
  
  try {
    // Dynamic import to avoid bundling on client
    const { Redis } = require('@upstash/redis')
    
    redisClient = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    })
    
    console.log('✅ Redis client initialized')
    return redisClient
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    return null
  }
}

// In-memory fallback for development
const memoryCache = new Map<string, { data: any; expires: number }>()

/**
 * Get from cache (Redis or memory fallback)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()
  
  if (redis) {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      // Fall through to memory cache
    }
  }
  
  // Memory cache fallback
  const cached = memoryCache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  
  return null
}

/**
 * Set cache (Redis or memory fallback)
 */
export async function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const ttl = options.ttl || 3600 // Default 1 hour
  const redis = getRedisClient()
  
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(data), { ex: ttl })
      return
    } catch (error) {
      console.error('Redis SET error:', error)
      // Fall through to memory cache
    }
  }
  
  // Memory cache fallback
  memoryCache.set(key, {
    data,
    expires: Date.now() + ttl * 1000
  })
}

/**
 * Delete from cache
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = getRedisClient()
  
  if (redis) {
    try {
      await redis.del(key)
      return
    } catch (error) {
      console.error('Redis DEL error:', error)
    }
  }
  
  memoryCache.delete(key)
}

/**
 * Delete multiple keys by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  const redis = getRedisClient()
  
  if (redis) {
    try {
      const keys = await redis.keys(pattern)
      await Promise.all(keys.map(key => redis.del(key)))
      return
    } catch (error) {
      console.error('Redis pattern delete error:', error)
    }
  }
  
  // Memory cache: delete matching keys
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern.replace('*', ''))) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Cache with automatic refresh
 */
export async function cacheWithRefresh<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key)
  if (cached) return cached
  
  // Fetch fresh data
  const data = await fetchFn()
  
  // Store in cache
  await setCache(key, data, options)
  
  return data
}

/**
 * Invalidate cache by tags
 */
export async function invalidateCacheTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    await deleteCachePattern(`*:${tag}:*`)
  }
}

/**
 * Atomic counter (for rate limiting, etc.)
 */
export async function incrementCounter(
  key: string,
  ttl: number = 60
): Promise<number> {
  const redis = getRedisClient()
  
  if (redis) {
    try {
      // Redis INCR is atomic
      const { incr, expire } = redis as any
      const count = await incr(key)
      if (count === 1) {
        await expire(key, ttl)
      }
      return count
    } catch (error) {
      console.error('Redis INCR error:', error)
    }
  }
  
  // Memory fallback (not atomic!)
  const cached = memoryCache.get(key)
  const count = cached ? (cached.data as number) + 1 : 1
  memoryCache.set(key, {
    data: count,
    expires: Date.now() + ttl * 1000
  })
  return count
}

/**
 * Clear all cache (use sparingly!)
 */
export async function clearAllCache(): Promise<void> {
  const redis = getRedisClient()
  
  if (redis) {
    try {
      const keys = await redis.keys('*')
      await Promise.all(keys.map(key => redis.del(key)))
      console.log(`Cleared ${keys.length} cache keys`)
      return
    } catch (error) {
      console.error('Redis clear error:', error)
    }
  }
  
  memoryCache.clear()
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  // User
  user: (id: string) => `user:${id}`,
  userSession: (id: string) => `session:${id}`,
  
  // Caregiver
  caregiver: (id: string) => `caregiver:${id}`,
  caregiverList: (filters: string) => `caregivers:list:${filters}`,
  caregiverAvailability: (id: string, date: string) => `availability:${id}:${date}`,
  
  // Booking
  booking: (id: string) => `booking:${id}`,
  bookingList: (userId: string) => `bookings:user:${userId}`,
  
  // Search
  searchResults: (query: string) => `search:${query}`,
  
  // Stats
  platformStats: () => 'stats:platform',
  caregiverStats: (id: string) => `stats:caregiver:${id}`,
  
  // Messages
  messages: (userId: string, contactId: string) => `messages:${userId}:${contactId}`,
  unreadCount: (userId: string) => `unread:${userId}`,
}

/**
 * Cache invalidation helpers
 */
export const CacheInvalidation = {
  onBookingUpdate: async (bookingId: string, ownerId: string, caregiverId: string) => {
    await Promise.all([
      deleteCache(CacheKeys.booking(bookingId)),
      deleteCache(CacheKeys.bookingList(ownerId)),
      deleteCache(CacheKeys.bookingList(caregiverId)),
      deleteCachePattern(`stats:*`),
    ])
  },
  
  onCaregiverUpdate: async (caregiverId: string) => {
    await Promise.all([
      deleteCache(CacheKeys.caregiver(caregiverId)),
      deleteCachePattern('caregivers:list:*'),
      deleteCachePattern('search:*'),
    ])
  },
  
  onReviewCreate: async (caregiverId: string) => {
    await Promise.all([
      deleteCache(CacheKeys.caregiver(caregiverId)),
      deleteCache(CacheKeys.caregiverStats(caregiverId)),
      deleteCachePattern('caregivers:list:*'),
    ])
  },
  
  onMessageSend: async (userId: string, contactId: string) => {
    await Promise.all([
      deleteCache(CacheKeys.messages(userId, contactId)),
      deleteCache(CacheKeys.messages(contactId, userId)),
      deleteCache(CacheKeys.unreadCount(contactId)),
    ])
  }
}





