export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInactiveCaregivers, getInactivityStats } from '@/lib/activity-tracker'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '30')
    const statsOnly = searchParams.get('stats') === 'true'

    if (statsOnly) {
      const stats = await getInactivityStats()
      return NextResponse.json(stats)
    }

    const inactiveCaregivers = await getInactiveCaregivers(threshold)

    return NextResponse.json({
      success: true,
      threshold,
      count: inactiveCaregivers.length,
      caregivers: inactiveCaregivers
    })
  } catch (error) {
    console.error('Error fetching inactive caregivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inactive caregivers' },
      { status: 500 }
    )
  }
}






















