import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        postalCode: true,
        country: true,
        lat: true,
        lng: true,
        preferences: true,
        howHeardAbout: true,
        perfectExperience: true,
        notificationPreferences: true,
        onboardingCompleted: true,
        pets: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
            age: true,
            weight: true,
            gender: true,
            spayedNeutered: true,
            medicalInfo: true,
            socialWithPets: true,
            socialWithPeople: true,
            character: true,
            photo: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country || 'BE',
      lat: user.lat,
      lng: user.lng,
      preferences: user.preferences,
      howHeardAbout: user.howHeardAbout,
      perfectExperience: user.perfectExperience,
      notificationPreferences: user.notificationPreferences,
      onboardingCompleted: user.onboardingCompleted || false,
      pets: user.pets || []
    })

  } catch (error) {
    console.error('Error fetching owner profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}