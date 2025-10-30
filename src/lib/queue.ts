/**
 * Background Job Queue
 * 
 * For 5000+ users, offload heavy tasks to background jobs:
 * - Email sending
 * - Image processing
 * - Report generation
 * - Notification batching
 * 
 * Uses Redis for production, in-memory for dev
 */

import { getCache, setCache, deleteCache } from './redis'

interface Job<T = any> {
  id: string
  type: string
  data: T
  attempts: number
  maxAttempts: number
  createdAt: number
  processedAt?: number
  error?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface QueueOptions {
  maxAttempts?: number
  retryDelay?: number // ms
  timeout?: number // ms
}

// In-memory queue for development
const memoryQueue: Map<string, Job[]> = new Map()

/**
 * Add job to queue
 */
export async function enqueue<T>(
  type: string,
  data: T,
  options: QueueOptions = {}
): Promise<string> {
  const jobId = `job:${type}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
  
  const job: Job<T> = {
    id: jobId,
    type,
    data,
    attempts: 0,
    maxAttempts: options.maxAttempts || 3,
    createdAt: Date.now(),
    status: 'pending'
  }
  
  // Store job
  await setCache(jobId, job, { ttl: 86400 }) // 24 hours
  
  // Add to queue list
  const queueKey = `queue:${type}`
  const queue = await getCache<string[]>(queueKey) || []
  queue.push(jobId)
  await setCache(queueKey, queue, { ttl: 86400 })
  
  console.log(`📝 Enqueued job: ${type} (${jobId})`)
  
  return jobId
}

/**
 * Process jobs from queue
 */
export async function processQueue<T>(
  type: string,
  handler: (data: T) => Promise<void>,
  options: QueueOptions = {}
): Promise<number> {
  const queueKey = `queue:${type}`
  const queue = await getCache<string[]>(queueKey) || []
  
  if (queue.length === 0) {
    return 0
  }
  
  let processed = 0
  const timeout = options.timeout || 30000 // 30 seconds default
  const retryDelay = options.retryDelay || 5000 // 5 seconds
  
  for (const jobId of queue.slice(0, 10)) { // Process max 10 at a time
    const job = await getCache<Job<T>>(jobId)
    
    if (!job || job.status === 'completed') {
      continue
    }
    
    // Skip if already processing
    if (job.status === 'processing') {
      continue
    }
    
    // Mark as processing
    job.status = 'processing'
    job.attempts++
    await setCache(jobId, job, { ttl: 86400 })
    
    try {
      // Execute job with timeout
      await Promise.race([
        handler(job.data),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Job timeout')), timeout)
        )
      ])
      
      // Mark as completed
      job.status = 'completed'
      job.processedAt = Date.now()
      await setCache(jobId, job, { ttl: 3600 }) // Keep for 1 hour
      
      processed++
      console.log(`✅ Job completed: ${jobId}`)
      
    } catch (error: any) {
      console.error(`❌ Job failed: ${jobId}`, error)
      
      job.error = error.message
      
      // Retry or fail
      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed'
        await setCache(jobId, job, { ttl: 86400 })
        console.error(`💀 Job permanently failed: ${jobId}`)
      } else {
        // Retry after delay
        job.status = 'pending'
        await setCache(jobId, job, { ttl: 86400 })
        console.log(`🔄 Job will retry: ${jobId} (attempt ${job.attempts}/${job.maxAttempts})`)
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  // Update queue (remove completed jobs)
  const updatedQueue = []
  for (const jobId of queue) {
    const job = await getCache<Job>(jobId)
    if (job && (job.status === 'pending' || job.status === 'processing')) {
      updatedQueue.push(jobId)
    }
  }
  await setCache(queueKey, updatedQueue, { ttl: 86400 })
  
  return processed
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<Job | null> {
  return await getCache<Job>(jobId)
}

/**
 * Cancel job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const job = await getCache<Job>(jobId)
  if (job && job.status === 'pending') {
    job.status = 'failed'
    job.error = 'Cancelled by user'
    await setCache(jobId, job, { ttl: 3600 })
  }
}

/**
 * Queue Statistics
 */
export async function getQueueStats(type: string): Promise<{
  pending: number
  processing: number
  completed: number
  failed: number
}> {
  const queueKey = `queue:${type}`
  const queue = await getCache<string[]>(queueKey) || []
  
  const stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  }
  
  for (const jobId of queue) {
    const job = await getCache<Job>(jobId)
    if (job) {
      stats[job.status]++
    }
  }
  
  return stats
}

/**
 * Pre-defined job types
 */
export const JobTypes = {
  SEND_EMAIL: 'send_email',
  SEND_NOTIFICATION: 'send_notification',
  PROCESS_IMAGE: 'process_image',
  GENERATE_REPORT: 'generate_report',
  SEND_REVIEW_REMINDER: 'send_review_reminder',
  CALCULATE_EARNINGS: 'calculate_earnings',
  SYNC_STRIPE: 'sync_stripe',
  CLEANUP_OLD_DATA: 'cleanup_old_data',
}

/**
 * Job handlers (to be called from cron or API)
 */
export const JobHandlers = {
  // Email sending
  async sendEmail(data: { to: string; subject: string; html: string }) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'TailTribe <noreply@tailtribe.be>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    })
  },
  
  // Notification batching (send multiple at once)
  async sendNotifications(data: { userId: string; notifications: any[] }) {
    // Batch notifications to avoid spam
    // In production, use push notifications, websockets, etc.
    console.log(`Sending ${data.notifications.length} notifications to ${data.userId}`)
  },
  
  // Generate monthly report
  async generateReport(data: { userId: string; month: string }) {
    const { db } = await import('./db')
    
    // Fetch data
    const bookings = await db.booking.findMany({
      where: { 
        caregiverId: data.userId,
        // Filter by month
      }
    })
    
    // Generate PDF/Excel report
    console.log(`Generated report for ${data.userId}: ${bookings.length} bookings`)
  }
}

/**
 * Batch enqueue (for efficiency)
 */
export async function enqueueBatch<T>(
  type: string,
  items: T[],
  options: QueueOptions = {}
): Promise<string[]> {
  const jobIds: string[] = []
  
  for (const data of items) {
    const jobId = await enqueue(type, data, options)
    jobIds.push(jobId)
  }
  
  console.log(`📝 Batch enqueued: ${items.length} ${type} jobs`)
  
  return jobIds
}

/**
 * Schedule recurring job
 */
export async function scheduleRecurring(
  type: string,
  cronExpression: string,
  data: any
): Promise<void> {
  // Store recurring job config
  const recurringKey = `recurring:${type}`
  await setCache(recurringKey, { type, cron: cronExpression, data }, { ttl: 86400 * 365 })
  
  console.log(`⏰ Scheduled recurring job: ${type} (${cronExpression})`)
}





