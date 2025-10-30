import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const bookingSchema = z.object({
  caregiverId: z.string(),
  service: z.string(),
  dates: z.array(z.string()),
  dayTimes: z.record(z.object({
    startTime: z.string(),
    endTime: z.string()
  })),
  petName: z.string(),
  petType: z.string(),
  customAnimalType: z.string().optional().nullable(),
  petBreed: z.string(),
  specialInstructions: z.string().optional(),
  offLeashAllowed: z.boolean().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  veterinarianName: z.string().optional(),
  veterinarianPhone: z.string().optional(),
  veterinarianAddress: z.string().optional(),
  totalCost: z.number()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om te boeken' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📥 Received booking data:', {
      caregiverId: body.caregiverId,
      dates: body.dates,
      service: body.service
    })
    
    const validated = bookingSchema.parse(body)

    // Check availability before creating booking
    for (const date of validated.dates) {
      const dayTimes = validated.dayTimes[date]
      if (!dayTimes) continue
      
      const startAt = new Date(`${date}T${dayTimes.startTime}`)
      const endAt = new Date(`${date}T${dayTimes.endTime}`)
      
      // Check if caregiver is available at this time
      const availabilityCheck = await fetch(`${process.env.NEXTAUTH_URL}/api/availability/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: validated.caregiverId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          service: validated.service
        })
      })
      
      if (!availabilityCheck.ok) {
        const errorData = await availabilityCheck.json()
        return NextResponse.json(
          { error: `Beschikbaarheid probleem: ${errorData.reason}` },
          { status: 400 }
        )
      }
      
      const availabilityData = await availabilityCheck.json()
      if (!availabilityData.available) {
        return NextResponse.json(
          { error: `Verzorger is niet beschikbaar op ${date}: ${availabilityData.reason}` },
          { status: 400 }
        )
      }
    }

    // Get caregiver profile - caregiverId can be either userId or profileId
    let caregiver = await db.caregiverProfile.findUnique({
      where: { id: validated.caregiverId }
    })

    console.log('🔍 Lookup by profileId:', validated.caregiverId, '→', caregiver ? 'Found' : 'Not found')

    // If not found by profileId, try by userId
    if (!caregiver) {
      caregiver = await db.caregiverProfile.findUnique({
        where: { userId: validated.caregiverId }
      })
      console.log('🔍 Lookup by userId:', validated.caregiverId, '→', caregiver ? 'Found' : 'Not found')
    }

    if (!caregiver) {
      console.error('❌ Caregiver not found with ID:', validated.caregiverId)
      
      // Debug: Show all caregivers
      const allCaregivers = await db.caregiverProfile.findMany({
        select: { id: true, userId: true },
        take: 5
      })
      console.log('🔍 Available caregivers (first 5):', allCaregivers)
      
      return NextResponse.json(
        { error: 'Verzorger niet gevonden', caregiverId: validated.caregiverId },
        { status: 404 }
      )
    }

    console.log('✅ Caregiver found:', { id: caregiver.id, userId: caregiver.userId, hourlyRate: caregiver.hourlyRate })

    // Create a booking for the entire period
    const firstDate = validated.dates[0]
    const lastDate = validated.dates[validated.dates.length - 1]
    const firstTime = validated.dayTimes[firstDate]
    const lastTime = validated.dayTimes[lastDate]

    const startAt = new Date(`${firstDate}T${firstTime.startTime}:00`)
    const endAt = new Date(`${lastDate}T${lastTime.endTime}:00`)

    const amountCents = Math.round(validated.totalCost * 100)

    console.log('💾 Creating booking:', {
      ownerId: session.user.id,
      caregiverId: caregiver.userId,
      startAt,
      endAt,
      amountCents
    })

    const booking = await db.booking.create({
      data: {
        ownerId: session.user.id,
        caregiverId: caregiver.userId,
        startAt,
        endAt,
        status: 'PENDING',
        amountCents,
        currency: 'EUR',
        petName: validated.petName,
        petType: validated.petType,
        customAnimalType: validated.customAnimalType || null,
        petBreed: validated.petBreed,
        specialInstructions: validated.specialInstructions,
        offLeashAllowed: validated.offLeashAllowed || false,
        emergencyContactName: validated.emergencyContactName,
        emergencyContactPhone: validated.emergencyContactPhone,
        veterinarianName: validated.veterinarianName,
        veterinarianPhone: validated.veterinarianPhone,
        veterinarianAddress: validated.veterinarianAddress,
      },
      include: {
        caregiver: {
          select: {
            name: true,
            email: true,
          }
        },
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    console.log('✅ Booking created:', booking.id)

    // Create initial message with booking details
    const datesInfo = validated.dates.map(date => {
      const time = validated.dayTimes[date]
      return `📅 ${date}: ${time.startTime} - ${time.endTime}`
    }).join('\n')

    await db.message.create({
      data: {
        bookingId: booking.id,
        senderId: session.user.id,
        body: `Nieuwe boeking aangemaakt!\n\nService: ${validated.service}\nHuisdier: ${validated.petName} (${validated.petType}) - ${validated.petBreed}\n\nGeselecteerde dagen:\n${datesInfo}\n\nTotaal: €${validated.totalCost.toFixed(2)}${validated.specialInstructions ? `\n\nSpeciale instructies:\n${validated.specialInstructions}` : ''}`,
      }
    })

    console.log('✅ Message created for booking')

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      booking
    })

  } catch (error: any) {
    console.error('❌ Create multi-day booking error:', error)
    console.error('Error details:', error.message, error.stack)
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Er ging iets mis bij het maken van de boeking' },
      { status: 500 }
    )
  }
}
