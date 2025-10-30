import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardMetrics, getPlatformHealth } from '@/lib/monitoring'
import { getCircuitBreakerStatuses } from '@/lib/circuit-breaker'
import { getQueueStats, JobTypes } from '@/lib/queue'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    // Check if admin
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    // Gather all metrics
    const [
      dashboardMetrics,
      health,
      circuitBreakers,
      emailQueueStats
    ] = await Promise.all([
      getDashboardMetrics(),
      getPlatformHealth(),
      getCircuitBreakerStatuses(),
      getQueueStats(JobTypes.SEND_EMAIL)
    ])

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: dashboardMetrics,
      health,
      circuitBreakers,
      queues: {
        email: emailQueueStats
      },
      system: {
        nodejs: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    })

  } catch (error: any) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}





