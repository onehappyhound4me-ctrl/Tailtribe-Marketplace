import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to find by CaregiverProfile.id first, then by userId
    let caregiver = await db.caregiverProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        availability: true
      }
    })

    // If not found by id, try by userId
    if (!caregiver) {
      caregiver = await db.caregiverProfile.findUnique({
        where: { userId: params.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          availability: true
        }
      })
    }

    if (!caregiver) {
      return NextResponse.json(
        { error: 'Verzorger niet gevonden' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const services = caregiver.services ? caregiver.services.split(',') : []
    const photos = JSON.parse(caregiver.photos || '[]')

    return NextResponse.json({
      id: caregiver.id,
      name: caregiver.user.name || 'Verzorger',
      city: caregiver.city,
      hourlyRate: caregiver.hourlyRate,
      photo: caregiver.user.image || '',
      services: services,
      photos: photos,
      bio: caregiver.bio,
      availabilityData: caregiver.availabilityData || null,
      availabilityWeekly: caregiver.availability?.weeklyJson || null,
      availabilityExceptions: caregiver.availability?.exceptions || null
    })

  } catch (error) {
    console.error('Error fetching caregiver:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van verzorger' },
      { status: 500 }
    )
  }
}


















