import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get caregiver profile
    const caregiver = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver profile not found' }, { status: 404 })
    }

    // Get availability
    const availability = await db.availability.findUnique({
      where: { caregiverId: caregiver.id }
    })

    if (!availability) {
      return NextResponse.json({ 
        availability: {
          weeklyJson: {
            maandag: { available: false, slots: [] },
            dinsdag: { available: false, slots: [] },
            woensdag: { available: false, slots: [] },
            donderdag: { available: false, slots: [] },
            vrijdag: { available: false, slots: [] },
            zaterdag: { available: false, slots: [] },
            zondag: { available: false, slots: [] }
          },
          exceptions: null
        }
      })
    }

    return NextResponse.json({ 
      availability: {
        weeklyJson: JSON.parse(availability.weeklyJson),
        exceptions: availability.exceptions ? JSON.parse(availability.exceptions) : null
      }
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { weeklyJson, exceptions } = body

    // Get caregiver profile
    const caregiver = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver profile not found' }, { status: 404 })
    }

    // Upsert availability
    const availability = await db.availability.upsert({
      where: { caregiverId: caregiver.id },
      update: {
        weeklyJson: JSON.stringify(weeklyJson),
        exceptions: exceptions ? JSON.stringify(exceptions) : null
      },
      create: {
        caregiverId: caregiver.id,
        weeklyJson: JSON.stringify(weeklyJson),
        exceptions: exceptions ? JSON.stringify(exceptions) : null
      }
    })

    return NextResponse.json({ 
      success: true,
      availability: {
        weeklyJson: JSON.parse(availability.weeklyJson),
        exceptions: availability.exceptions ? JSON.parse(availability.exceptions) : null
      }
    })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}