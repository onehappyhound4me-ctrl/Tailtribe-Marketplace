import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// Get caregiver availability
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Alleen verzorgers kunnen beschikbaarheid ophalen' },
        { status: 403 }
      )
    }

    const caregiverProfile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id },
      include: { availability: true }
    })

    if (!caregiverProfile) {
      return NextResponse.json(
        { error: 'Verzorger niet gevonden' },
        { status: 404 }
      )
    }

    // Parse and return the weekly schedule
    let weeklyJson = null
    if (caregiverProfile.availability?.weeklyJson) {
      try {
        weeklyJson = JSON.parse(caregiverProfile.availability.weeklyJson)
      } catch (e) {
        console.error('Error parsing weeklyJson:', e)
      }
    }

    return NextResponse.json({
      weeklyJson,
      exceptions: caregiverProfile.availability?.exceptions || null
    })

  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// Update own availability
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Alleen verzorgers kunnen beschikbaarheid instellen' },
        { status: 403 }
      )
    }

    const { weeklyJson, exceptions } = await request.json()

    const caregiverProfile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!caregiverProfile) {
      return NextResponse.json(
        { error: 'Caregiver profiel niet gevonden' },
        { status: 404 }
      )
    }

    // Upsert availability
    const availability = await db.availability.upsert({
      where: { caregiverId: caregiverProfile.id },
      update: {
        weeklyJson: JSON.stringify(weeklyJson || {}),
        exceptions: JSON.stringify(exceptions || []),
      },
      create: {
        caregiverId: caregiverProfile.id,
        weeklyJson: JSON.stringify(weeklyJson || {}),
        exceptions: JSON.stringify(exceptions || []),
      }
    })

    return NextResponse.json({
      availability,
      message: 'Beschikbaarheid bijgewerkt!'
    })

  } catch (error) {
    console.error('Update availability error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
