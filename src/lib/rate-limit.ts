import { db } from './db'
import { RateLimitError } from './errors'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
}

const DEFAULT_CONFIGS = {
  api: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  booking: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  message: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  payment: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 requests per minute
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMs)

  try {
    // Get or create rate limit record
    let rateLimitRecord = await db.rateLimit.findUnique({
      where: { key }
    })

    if (!rateLimitRecord) {
      // Create new record
      rateLimitRecord = await db.rateLimit.create({
        data: {
          key,
          tokens: 1,
          lastRefill: now,
        }
      })
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now.getTime() + config.windowMs
      }
    }

    // Check if we need to reset the window
    if (rateLimitRecord.lastRefill < windowStart) {
      // Reset the window
      rateLimitRecord = await db.rateLimit.update({
        where: { key },
        data: {
          tokens: 1,
          lastRefill: now,
        }
      })
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now.getTime() + config.windowMs
      }
    }

    // Check if we're within limits
    if (rateLimitRecord.tokens >= config.maxRequests) {
      const resetTime = rateLimitRecord.lastRefill.getTime() + config.windowMs
      return {
        success: false,
        remaining: 0,
        resetTime
      }
    }

    // Increment token count
    rateLimitRecord = await db.rateLimit.update({
      where: { key },
      data: {
        tokens: rateLimitRecord.tokens + 1,
      }
    })

    const resetTime = rateLimitRecord.lastRefill.getTime() + config.windowMs
    return {
      success: true,
      remaining: config.maxRequests - rateLimitRecord.tokens,
      resetTime
    }

  } catch (error) {
    console.error('Rate limiting error:', error)
    // If rate limiting fails, allow the request to proceed
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now.getTime() + config.windowMs
    }
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real
  }
  
  return 'unknown'
}

export async function checkRateLimit(
  request: Request,
  type: keyof typeof DEFAULT_CONFIGS,
  userId?: string
): Promise<void> {
  const config = DEFAULT_CONFIGS[type]
  const ip = getClientIP(request)
  
  // Use user ID if available, otherwise fall back to IP
  const key = userId ? `user:${userId}:${type}` : `ip:${ip}:${type}`
  
  const result = await rateLimit(key, config)
  
  if (!result.success) {
    throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`)
  }
}

// Cleanup old rate limit records (run this periodically)
export async function cleanupRateLimits(): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  try {
    await db.rateLimit.deleteMany({
      where: {
        lastRefill: {
          lt: oneDayAgo
        }
      }
    })
  } catch (error) {
    console.error('Error cleaning up rate limits:', error)
  }
}

