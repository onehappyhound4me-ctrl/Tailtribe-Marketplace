export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Helper function to convert minutes to HH:MM format
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json({ error: 'Missing from/to parameters' }, { status: 400 })
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    // Get owner's bookings
    const bookings = await db.booking.findMany({
      where: {
        ownerId: session.user.id,
        startAt: {
          gte: fromDate,
          lte: toDate
        }
      },
      include: {
        caregiver: {
          include: {
            caregiverProfile: true
          }
        }
      }
    })

    // Get availability slots for all caregivers in the date range
    const availabilitySlots = await db.availabilitySlot.findMany({
      where: {
        date: {
          gte: fromDate,
          lte: toDate
        },
        blocked: false // Only get non-blocked slots
      },
      select: {
        id: true,
        caregiverId: true,
        date: true,
        startTimeMin: true,
        endTimeMin: true
      }
    })

    // Get unique caregiver profile IDs (these are CaregiverProfile IDs, not User IDs)
    const caregiverProfileIds = [...new Set(availabilitySlots.map(slot => slot.caregiverId))]
    
    // Get caregiver profiles for these CaregiverProfile IDs
    const caregivers = await db.caregiverProfile.findMany({
      where: {
        id: {
          in: caregiverProfileIds
        }
      },
      select: {
        id: true,
        userId: true,
        hourlyRate: true,
        services: true,
        city: true,
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Create a map for faster lookup using caregiverProfileId as key
    console.log('Found', caregivers.length, 'caregiver profiles')
    const caregiverMap = new Map(caregivers.map(c => [c.id, c]))

    // Group slots by date for faster lookup
    const slotsByDate = new Map<string, typeof availabilitySlots>()
    for (const slot of availabilitySlots) {
      const dateStr = slot.date.toISOString().split('T')[0]
      if (!slotsByDate.has(dateStr)) {
        slotsByDate.set(dateStr, [])
      }
      slotsByDate.get(dateStr)!.push(slot)
    }

    // Group by date and merge
    const daysMap = new Map<string, any>()
    
    // Process each day in range
    const currentDate = new Date(fromDate)
    while (currentDate <= toDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const dayBookings = bookings.filter(booking => 
        booking.startAt.toISOString().split('T')[0] === dateString
      )

      // Find available caregivers for this day
      const daySlots = slotsByDate.get(dateString) || []
      
      // Group slots by caregiver ID
      const slotsByCaregiver = new Map<string, typeof daySlots>()
      for (const slot of daySlots) {
        if (!slotsByCaregiver.has(slot.caregiverId)) {
          slotsByCaregiver.set(slot.caregiverId, [])
        }
        slotsByCaregiver.get(slot.caregiverId)!.push(slot)
      }

      const availableCaregivers = Array.from(slotsByCaregiver.entries())
        .map(([caregiverId, slots]) => {
          const caregiver = caregiverMap.get(caregiverId)
          if (!caregiver) return null as any
          
          const timeSlots = slots.map(slot => ({
            start: formatTime(slot.startTimeMin),
            end: formatTime(slot.endTimeMin)
          }))

          // Parse services (can be JSON array or comma-separated string)
          let services = []
          if (caregiver.services) {
            try {
              services = JSON.parse(caregiver.services)
            } catch {
              services = caregiver.services.split(',')
            }
          }

          return {
            id: caregiver.userId, // Return User ID for consistency with other APIs
            name: caregiver.user?.name || 'Onbekend',
            rating: 0, // TODO: Calculate from reviews
            pricePerHour: caregiver.hourlyRate || 25,
            services: services,
            city: caregiver.city || 'Onbekend',
            timeSlots: timeSlots
          }
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)

      const dayData = {
        date: new Date(currentDate),
        availableCaregivers,
        bookings: dayBookings.map(booking => {
          const profile = booking.caregiver?.caregiverProfile
          
          // Parse services (can be JSON array or comma-separated string)
          let services = []
          if (profile?.services) {
            try {
              services = JSON.parse(profile.services)
            } catch {
              services = profile.services.split(',')
            }
          }
          
          return {
            id: booking.id,
            startAt: booking.startAt,
            endAt: booking.endAt,
            status: booking.status,
            caregiver: {
              id: booking.caregiver.id,
              name: booking.caregiver.name || 'Onbekend',
              rating: 0, // TODO: Calculate from reviews
              pricePerHour: profile?.hourlyRate || 25,
              services: services,
              city: profile?.city || 'Onbekend'
            },
            petName: booking.petName,
            service: 'Service'
          }
        }),
        isPast: currentDate < new Date(),
        isBlocked: availableCaregivers.length === 0 && dayBookings.length === 0
      }

      daysMap.set(dateString, dayData)

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      days: Array.from(daysMap.values())
    })

  } catch (error) {
    console.error('Error fetching owner calendar:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}