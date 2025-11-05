import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { caregiverId, startAt, endAt, service } = await request.json()
    
    if (!caregiverId || !startAt || !endAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get caregiver availability
    const availability = await db.availability.findFirst({
      where: { caregiverId }
    })

    if (!availability) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Caregiver has not set availability' 
      })
    }

    // Parse weekly schedule
    const weeklySchedule = availability.weeklyJson ? JSON.parse(availability.weeklyJson) : {}
    
    // Check if the requested time falls within caregiver's available hours
    const requestedDate = new Date(startAt)
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    const daySchedule = weeklySchedule[dayName]
    
    if (!daySchedule || !daySchedule.available) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Caregiver is not available on this day' 
      })
    }

    // Check if requested time slot overlaps with available slots
    const requestedStart = new Date(startAt)
    const requestedEnd = new Date(endAt)
    
    const isTimeSlotAvailable = daySchedule.slots.some((slot: any) => {
      const slotStart = new Date(`${requestedDate.toDateString()} ${slot.start}`)
      const slotEnd = new Date(`${requestedDate.toDateString()} ${slot.end}`)
      
      return requestedStart >= slotStart && requestedEnd <= slotEnd
    })

    if (!isTimeSlotAvailable) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Requested time slot is not available' 
      })
    }

    // Check for existing bookings that might conflict
    const existingBookings = await db.booking.findMany({
      where: {
        caregiverId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        OR: [
          {
            startAt: {
              lte: requestedEnd
            },
            endAt: {
              gte: requestedStart
            }
          }
        ]
      }
    })

    if (existingBookings.length > 0) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Time slot is already booked' 
      })
    }

    return NextResponse.json({ 
      available: true,
      caregiver: {
        id: caregiverId,
        // Add any other caregiver info needed
      }
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




















