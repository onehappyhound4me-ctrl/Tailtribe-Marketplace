export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Cron Job: Daily Cleanup
 * 
 * Runs daily at 2AM (configured in vercel.json)
 * 
 * Tasks:
 * - Delete expired story highlights
 * - Clean up old rate limit entries
 * - Mark overdue bookings as completed
 * - Send review reminders for completed bookings
 */

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: any = {}
    const now = new Date()

    // 1. Delete expired story highlights
    const deletedHighlights = await db.storyHighlight.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    })
    results.deletedHighlights = deletedHighlights.count

    // 2. Clean old rate limit entries (>7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const deletedRateLimits = await db.rateLimit.deleteMany({
      where: {
        lastRefill: { lt: sevenDaysAgo }
      }
    })
    results.deletedRateLimits = deletedRateLimits.count

    // 3. Mark overdue bookings as completed (24h after endAt)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const completedBookings = await db.booking.updateMany({
      where: {
        status: 'ACCEPTED',
        endAt: { lt: oneDayAgo }
      },
      data: {
        status: 'COMPLETED',
        completedAt: now
      }
    })
    results.autoCompletedBookings = completedBookings.count

    // 4. TODO: Send review reminders for bookings completed 24h ago
    // This would require email integration

    // 5. Delete old cancelled bookings (>90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const deletedOldCancelled = await db.booking.deleteMany({
      where: {
        status: 'CANCELLED',
        updatedAt: { lt: ninetyDaysAgo }
      }
    })
    results.deletedOldCancelled = deletedOldCancelled.count

    return NextResponse.json({ 
      success: true,
      timestamp: now,
      results
    })

  } catch (error: any) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json(
      { error: error.message || 'Cleanup failed' },
      { status: 500 }
    )
  }
}





