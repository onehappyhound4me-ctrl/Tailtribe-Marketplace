export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mergeAvailability } from '@/lib/calendar/mergeAvailability'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caregiverId = searchParams.get('caregiverId')
    const serviceId = searchParams.get('serviceId') // Optional - voor backward compatibility
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!caregiverId || !from || !to) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (caregiverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    // Get availability slots (serviceId is optional - als niet opgegeven, haal alle slots op)
    const availabilitySlots = await db.availabilitySlot.findMany({
      where: {
        caregiverId,
        ...(serviceId && { serviceId }), // Only filter by serviceId if provided
        date: {
          gte: fromDate,
          lte: toDate
        }
      }
    })

    // Get bookings
    const bookings = await db.booking.findMany({
      where: {
        caregiverId,
        startAt: {
          gte: fromDate,
          lte: toDate
        },
        status: {
          not: 'CANCELLED'
        }
      }
    })

    // Group by date and merge
    const daysMap = new Map<string, any>()
    
    // Process each day in range
    const currentDate = new Date(fromDate)
    while (currentDate <= toDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const daySlots = availabilitySlots.filter(slot => 
        slot.date.toISOString().split('T')[0] === dateString
      )
      const dayBookings = bookings.filter(booking => 
        booking.startAt.toISOString().split('T')[0] === dateString
      )

      const dayData = mergeAvailability(daySlots, dayBookings, dateString)
      daysMap.set(dateString, dayData)
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      days: Array.from(daysMap.values())
    })

  } catch (error) {
    console.error('Error fetching caregiver calendar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}