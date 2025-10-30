/**
 * Advanced Monitoring & Alerting
 * 
 * For 5000+ users, you need real-time monitoring:
 * - Performance metrics
 * - Error tracking
 * - User behavior
 * - Resource usage
 * - Automatic alerts
 */

import { getCache, setCache } from './redis'

interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface Alert {
  level: 'info' | 'warning' | 'critical'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: number
}

/**
 * Record a metric
 */
export async function recordMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): Promise<void> {
  const metric: MetricData = {
    name,
    value,
    timestamp: Date.now(),
    tags
  }
  
  // Store in time-series cache (Redis)
  const key = `metric:${name}:${Math.floor(Date.now() / 60000)}` // Per minute
  const metrics = await getCache<MetricData[]>(key) || []
  metrics.push(metric)
  await setCache(key, metrics, { ttl: 3600 }) // Keep for 1 hour
  
  // Check thresholds
  await checkThresholds(name, value)
}

/**
 * Track API response time
 */
export async function trackResponseTime(
  endpoint: string,
  duration: number,
  statusCode: number
): Promise<void> {
  await recordMetric('api.response_time', duration, {
    endpoint,
    status: statusCode.toString()
  })
  
  // Alert if slow
  if (duration > 1000) {
    await sendAlert({
      level: 'warning',
      message: `Slow API response: ${endpoint}`,
      metric: 'api.response_time',
      value: duration,
      threshold: 1000,
      timestamp: Date.now()
    })
  }
}

/**
 * Track error rate
 */
export async function trackError(
  type: string,
  message: string,
  context?: Record<string, any>
): Promise<void> {
  await recordMetric('errors.count', 1, { type })
  
  // Store error details
  const errorKey = `error:${Date.now()}`
  await setCache(errorKey, {
    type,
    message,
    context,
    timestamp: Date.now()
  }, { ttl: 86400 }) // Keep for 24 hours
  
  // Check error rate
  const errorCount = await getMetricCount('errors.count', 60000) // Last minute
  if (errorCount > 10) {
    await sendAlert({
      level: 'critical',
      message: `High error rate: ${errorCount} errors/minute`,
      metric: 'errors.count',
      value: errorCount,
      threshold: 10,
      timestamp: Date.now()
    })
  }
}

/**
 * Track user action
 */
export async function trackUserAction(
  userId: string,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  await recordMetric('user.action', 1, {
    action,
    userId: userId.substring(0, 8) // Anonymize
  })
  
  // Track active users
  const activeKey = `active:users:${Math.floor(Date.now() / 60000)}`
  const activeUsers = await getCache<Set<string>>(activeKey) || new Set()
  activeUsers.add(userId)
  await setCache(activeKey, Array.from(activeUsers), { ttl: 300 })
}

/**
 * Track database query performance
 */
export async function trackQuery(
  query: string,
  duration: number,
  rowCount: number
): Promise<void> {
  await recordMetric('db.query_time', duration, {
    query: query.substring(0, 50) // Truncate
  })
  
  // Alert on slow queries
  if (duration > 500) {
    console.warn(`🐌 Slow query (${duration}ms): ${query.substring(0, 100)}`)
  }
  
  await recordMetric('db.rows_returned', rowCount)
}

/**
 * Track Stripe operations
 */
export async function trackStripeOperation(
  operation: string,
  success: boolean,
  amount?: number
): Promise<void> {
  await recordMetric('stripe.operations', 1, {
    operation,
    success: success.toString()
  })
  
  if (amount) {
    await recordMetric('stripe.transaction_amount', amount, { operation })
  }
  
  if (!success) {
    await trackError('stripe', `Stripe ${operation} failed`)
  }
}

/**
 * Track resource usage
 */
export async function trackResourceUsage(): Promise<void> {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage()
    await recordMetric('system.memory_mb', memory.heapUsed / 1024 / 1024)
    await recordMetric('system.memory_total_mb', memory.heapTotal / 1024 / 1024)
    
    // Alert on high memory usage
    const usagePercent = (memory.heapUsed / memory.heapTotal) * 100
    if (usagePercent > 90) {
      await sendAlert({
        level: 'critical',
        message: `High memory usage: ${usagePercent.toFixed(1)}%`,
        metric: 'system.memory',
        value: usagePercent,
        threshold: 90,
        timestamp: Date.now()
      })
    }
  }
}

/**
 * Get metric statistics
 */
export async function getMetricStats(
  name: string,
  timeWindowMs: number = 3600000 // 1 hour
): Promise<{
  count: number
  avg: number
  min: number
  max: number
  p95: number
}> {
  const now = Date.now()
  const startTime = now - timeWindowMs
  
  const values: number[] = []
  
  // Collect all metrics in time window
  for (let t = startTime; t <= now; t += 60000) {
    const key = `metric:${name}:${Math.floor(t / 60000)}`
    const metrics = await getCache<MetricData[]>(key) || []
    values.push(...metrics.map(m => m.value))
  }
  
  if (values.length === 0) {
    return { count: 0, avg: 0, min: 0, max: 0, p95: 0 }
  }
  
  values.sort((a, b) => a - b)
  
  return {
    count: values.length,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    min: values[0],
    max: values[values.length - 1],
    p95: values[Math.floor(values.length * 0.95)]
  }
}

/**
 * Get metric count (for rate tracking)
 */
async function getMetricCount(name: string, timeWindowMs: number): Promise<number> {
  const stats = await getMetricStats(name, timeWindowMs)
  return stats.count
}

/**
 * Check metric thresholds
 */
async function checkThresholds(name: string, value: number): Promise<void> {
  const thresholds: Record<string, { warning: number; critical: number }> = {
    'api.response_time': { warning: 500, critical: 2000 },
    'errors.count': { warning: 5, critical: 10 },
    'db.query_time': { warning: 200, critical: 1000 },
    'system.memory_mb': { warning: 400, critical: 500 },
  }
  
  const threshold = thresholds[name]
  if (!threshold) return
  
  if (value >= threshold.critical) {
    await sendAlert({
      level: 'critical',
      message: `Critical: ${name} = ${value}`,
      metric: name,
      value,
      threshold: threshold.critical,
      timestamp: Date.now()
    })
  } else if (value >= threshold.warning) {
    await sendAlert({
      level: 'warning',
      message: `Warning: ${name} = ${value}`,
      metric: name,
      value,
      threshold: threshold.warning,
      timestamp: Date.now()
    })
  }
}

/**
 * Send alert (email, Slack, PagerDuty, etc.)
 */
async function sendAlert(alert: Alert): Promise<void> {
  // Store alert
  const alertKey = `alert:${alert.timestamp}`
  await setCache(alertKey, alert, { ttl: 86400 })
  
  console.error(`🚨 ALERT [${alert.level.toUpperCase()}]: ${alert.message}`)
  
  // In production, send to:
  // - Email (critical only)
  // - Slack webhook
  // - PagerDuty (critical only)
  // - SMS (critical only)
  
  if (process.env.SLACK_WEBHOOK_URL && alert.level === 'critical') {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${alert.level.toUpperCase()}*: ${alert.message}`,
          attachments: [{
            color: alert.level === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Metric', value: alert.metric, short: true },
              { title: 'Value', value: alert.value.toString(), short: true },
              { title: 'Threshold', value: alert.threshold.toString(), short: true },
              { title: 'Time', value: new Date(alert.timestamp).toISOString(), short: true }
            ]
          }]
        })
      })
    } catch (error) {
      console.error('Failed to send Slack alert:', error)
    }
  }
}

/**
 * Get platform health score (0-100)
 */
export async function getPlatformHealth(): Promise<{
  score: number
  status: 'healthy' | 'degraded' | 'unhealthy'
  issues: string[]
}> {
  const issues: string[] = []
  let score = 100
  
  // Check API response time
  const apiStats = await getMetricStats('api.response_time', 300000) // 5 minutes
  if (apiStats.avg > 1000) {
    issues.push('Slow API responses')
    score -= 20
  } else if (apiStats.avg > 500) {
    issues.push('Elevated API response times')
    score -= 10
  }
  
  // Check error rate
  const errorCount = await getMetricCount('errors.count', 300000)
  if (errorCount > 20) {
    issues.push('High error rate')
    score -= 30
  } else if (errorCount > 5) {
    issues.push('Elevated error rate')
    score -= 15
  }
  
  // Check database performance
  const dbStats = await getMetricStats('db.query_time', 300000)
  if (dbStats.avg > 500) {
    issues.push('Slow database queries')
    score -= 20
  }
  
  // Determine status
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (score >= 80) {
    status = 'healthy'
  } else if (score >= 50) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }
  
  return { score, status, issues }
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(): Promise<{
  activeUsers: number
  requestsPerMinute: number
  avgResponseTime: number
  errorRate: number
  dbQueryTime: number
}> {
  const [
    activeUsers,
    apiStats,
    errorCount,
    dbStats
  ] = await Promise.all([
    getMetricCount('user.action', 300000), // 5 minutes
    getMetricStats('api.response_time', 60000), // 1 minute
    getMetricCount('errors.count', 60000),
    getMetricStats('db.query_time', 60000)
  ])
  
  return {
    activeUsers,
    requestsPerMinute: apiStats.count,
    avgResponseTime: apiStats.avg,
    errorRate: errorCount / Math.max(apiStats.count, 1),
    dbQueryTime: dbStats.avg
  }
}

/**
 * Middleware to automatically track API calls
 */
export function createMonitoringMiddleware() {
  return async (req: Request, handler: () => Promise<Response>) => {
    const start = Date.now()
    let response: Response
    
    try {
      response = await handler()
      const duration = Date.now() - start
      
      await trackResponseTime(
        new URL(req.url).pathname,
        duration,
        response.status
      )
      
      return response
    } catch (error: any) {
      const duration = Date.now() - start
      
      await trackResponseTime(
        new URL(req.url).pathname,
        duration,
        500
      )
      
      await trackError('api', error.message, {
        endpoint: new URL(req.url).pathname,
        method: req.method
      })
      
      throw error
    }
  }
}





