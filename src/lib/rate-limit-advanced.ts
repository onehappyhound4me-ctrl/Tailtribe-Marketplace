import { db } from './db'

/**
 * Advanced Rate Limiting System
 * 
 * Different limits per endpoint type:
 * - Auth: 5 requests per 15 minutes
 * - Search: 30 requests per minute
 * - Booking: 10 requests per hour
 * - Messages: 60 requests per hour
 * - API general: 100 requests per hour
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  identifier: string
}

export async function checkRateLimit(config: RateLimitConfig): Promise<{
  allowed: boolean
  remaining: number
  resetAt: Date
}> {
  const { maxRequests, windowMs, identifier } = config
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMs)

  try {
    // Get or create rate limit entry
    let rateLimit = await db.rateLimit.findUnique({
      where: { key: identifier }
    })

    if (!rateLimit) {
      // Create new entry
      rateLimit = await db.rateLimit.create({
        data: {
          key: identifier,
          tokens: 1,
          lastRefill: now
        }
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: new Date(now.getTime() + windowMs)
      }
    }

    // Check if window has passed
    const timeSinceRefill = now.getTime() - new Date(rateLimit.lastRefill).getTime()
    
    if (timeSinceRefill >= windowMs) {
      // Refill tokens
      await db.rateLimit.update({
        where: { key: identifier },
        data: {
          tokens: 1,
          lastRefill: now
        }
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: new Date(now.getTime() + windowMs)
      }
    }

    // Within window - check if under limit
    if (rateLimit.tokens < maxRequests) {
      // Increment tokens
      await db.rateLimit.update({
        where: { key: identifier },
        data: {
          tokens: rateLimit.tokens + 1
        }
      })
      return {
        allowed: true,
        remaining: maxRequests - rateLimit.tokens - 1,
        resetAt: new Date(new Date(rateLimit.lastRefill).getTime() + windowMs)
      }
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(new Date(rateLimit.lastRefill).getTime() + windowMs)
    }

  } catch (error) {
    console.error('Rate limit error:', error)
    // On error, allow request (fail open)
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(now.getTime() + windowMs)
    }
  }
}

// Pre-configured rate limiters
export const RateLimiters = {
  // Auth endpoints - strict
  auth: (identifier: string) => checkRateLimit({
    identifier: `auth:${identifier}`,
    maxRequests: 5,
    windowMs: 15 * 60 * 1000 // 15 minutes
  }),

  // Search - generous for good UX
  search: (identifier: string) => checkRateLimit({
    identifier: `search:${identifier}`,
    maxRequests: 30,
    windowMs: 60 * 1000 // 1 minute
  }),

  // Booking creation - moderate
  booking: (identifier: string) => checkRateLimit({
    identifier: `booking:${identifier}`,
    maxRequests: 10,
    windowMs: 60 * 60 * 1000 // 1 hour
  }),

  // Messages - generous
  messages: (identifier: string) => checkRateLimit({
    identifier: `messages:${identifier}`,
    maxRequests: 60,
    windowMs: 60 * 60 * 1000 // 1 hour
  }),

  // Profile updates - moderate
  profile: (identifier: string) => checkRateLimit({
    identifier: `profile:${identifier}`,
    maxRequests: 20,
    windowMs: 60 * 60 * 1000 // 1 hour
  }),

  // API general - generous
  api: (identifier: string) => checkRateLimit({
    identifier: `api:${identifier}`,
    maxRequests: 100,
    windowMs: 60 * 60 * 1000 // 1 hour
  }),

  // Admin - no limit (but track)
  admin: (identifier: string) => checkRateLimit({
    identifier: `admin:${identifier}`,
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000
  })
}

// Helper to get identifier from request
export function getIdentifier(req: Request): string {
  // Try to get IP from various headers (for production behind proxy)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback
  return 'unknown'
}





