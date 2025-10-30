import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Health Check Endpoint
 * For monitoring services (Pingdom, UptimeRobot, etc.)
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const checks: Record<string, any> = {}

  try {
    // 1. Database Check
    try {
      await db.user.count()
      checks.database = {
        status: 'healthy',
        responseTime: Date.now() - startTime
      }
    } catch (error: any) {
      checks.database = {
        status: 'unhealthy',
        error: error.message
      }
    }

    // 2. API Response Time Check
    checks.api = {
      status: 'healthy',
      responseTime: Date.now() - startTime
    }

    // 3. Environment Check
    checks.environment = {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV
    }

    // 4. Critical Services Check
    checks.services = {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      resend: !!process.env.RESEND_API_KEY,
      nextAuth: !!process.env.NEXTAUTH_SECRET
    }

    // Determine overall health
    const isHealthy = checks.database.status === 'healthy'
    const totalTime = Date.now() - startTime

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: totalTime,
      checks
    }, {
      status: isHealthy ? 200 : 503
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks
    }, {
      status: 500
    })
  }
}
