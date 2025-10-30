import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCircuitBreakerStatuses, CircuitBreakers } from '@/lib/circuit-breaker'

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

    const statuses = getCircuitBreakerStatuses()

    return NextResponse.json({
      success: true,
      circuitBreakers: statuses
    })

  } catch (error: any) {
    console.error('Error fetching circuit breaker statuses:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch circuit breaker statuses' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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

    const { action, breaker } = await req.json()

    if (action === 'reset') {
      if (breaker === 'all') {
        CircuitBreakers.stripe.reset()
        CircuitBreakers.resend.reset()
        CircuitBreakers.database.reset()
        CircuitBreakers.external.reset()
      } else if (CircuitBreakers[breaker as keyof typeof CircuitBreakers]) {
        CircuitBreakers[breaker as keyof typeof CircuitBreakers].reset()
      } else {
        return NextResponse.json({ error: 'Invalid breaker name' }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: `Circuit breaker(s) reset successfully`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Error managing circuit breakers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to manage circuit breakers' },
      { status: 500 }
    )
  }
}





