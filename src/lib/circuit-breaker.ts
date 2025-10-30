/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures when external services fail
 * - Stripe API
 * - Resend API
 * - Database connections
 * 
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 */

interface CircuitBreakerOptions {
  failureThreshold: number // Number of failures before opening
  successThreshold: number // Number of successes to close again
  timeout: number // Time in ms before trying again (HALF_OPEN)
  requestTimeout: number // Individual request timeout
}

enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private successCount: number = 0
  private nextAttempt: number = Date.now()
  private options: CircuitBreakerOptions
  
  constructor(
    private name: string,
    options: Partial<CircuitBreakerOptions> = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      successThreshold: options.successThreshold || 2,
      timeout: options.timeout || 60000, // 1 minute
      requestTimeout: options.requestTimeout || 10000 // 10 seconds
    }
  }
  
  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker for ${this.name} is OPEN. Service temporarily unavailable.`
        )
      }
      // Try transitioning to HALF_OPEN
      this.state = CircuitState.HALF_OPEN
      console.log(`🔄 Circuit breaker ${this.name}: OPEN → HALF_OPEN`)
    }
    
    try {
      // Execute with timeout
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            this.options.requestTimeout
          )
        )
      ])
      
      // Success!
      this.onSuccess()
      return result
      
    } catch (error) {
      // Failure
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED
        this.successCount = 0
        console.log(`✅ Circuit breaker ${this.name}: HALF_OPEN → CLOSED`)
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++
    this.successCount = 0
    
    if (
      this.failureCount >= this.options.failureThreshold ||
      this.state === CircuitState.HALF_OPEN
    ) {
      this.state = CircuitState.OPEN
      this.nextAttempt = Date.now() + this.options.timeout
      console.error(
        `❌ Circuit breaker ${this.name}: ${CircuitState.CLOSED} → OPEN (failures: ${this.failureCount})`
      )
    }
  }
  
  /**
   * Get current state
   */
  getState(): { state: CircuitState; failures: number; nextAttempt?: number } {
    return {
      state: this.state,
      failures: this.failureCount,
      nextAttempt: this.state === CircuitState.OPEN ? this.nextAttempt : undefined
    }
  }
  
  /**
   * Manually reset (for testing/admin)
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    console.log(`🔧 Circuit breaker ${this.name} manually reset`)
  }
}

/**
 * Global circuit breakers for external services
 */
export const CircuitBreakers = {
  stripe: new CircuitBreaker('Stripe', {
    failureThreshold: 3,
    timeout: 30000, // 30 seconds
    requestTimeout: 15000 // 15 seconds
  }),
  
  resend: new CircuitBreaker('Resend', {
    failureThreshold: 5,
    timeout: 60000, // 1 minute
    requestTimeout: 10000 // 10 seconds
  }),
  
  database: new CircuitBreaker('Database', {
    failureThreshold: 10,
    timeout: 10000, // 10 seconds
    requestTimeout: 5000 // 5 seconds
  }),
  
  external: new CircuitBreaker('External API', {
    failureThreshold: 5,
    timeout: 60000,
    requestTimeout: 10000
  })
}

/**
 * Safe Stripe call with circuit breaker
 */
export async function safeStripeCall<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await CircuitBreakers.stripe.execute(fn)
  } catch (error) {
    console.error('Stripe call failed:', error)
    
    if (fallback !== undefined) {
      return fallback
    }
    
    throw new Error('Payment service temporarily unavailable. Please try again later.')
  }
}

/**
 * Safe email send with circuit breaker
 */
export async function safeEmailSend(
  fn: () => Promise<any>
): Promise<boolean> {
  try {
    await CircuitBreakers.resend.execute(fn)
    return true
  } catch (error) {
    console.error('Email send failed:', error)
    // Don't throw - email failures shouldn't block main flow
    // Queue for retry instead
    return false
  }
}

/**
 * Safe database call with circuit breaker
 */
export async function safeDatabaseCall<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await CircuitBreakers.database.execute(fn)
  } catch (error) {
    console.error('Database call failed:', error)
    
    if (fallback !== undefined) {
      return fallback
    }
    
    throw new Error('Service temporarily unavailable. Please try again.')
  }
}

/**
 * Get all circuit breaker statuses
 */
export function getCircuitBreakerStatuses() {
  return {
    stripe: CircuitBreakers.stripe.getState(),
    resend: CircuitBreakers.resend.getState(),
    database: CircuitBreakers.database.getState(),
    external: CircuitBreakers.external.getState(),
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

/**
 * Bulk operations with rate limiting
 */
export async function bulkWithRateLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  rateLimit: number = 10, // items per second
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = []
  const delayMs = 1000 / rateLimit
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
    
    // Wait between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs * batchSize))
    }
  }
  
  return results
}





