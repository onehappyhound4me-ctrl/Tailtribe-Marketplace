import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Users should be logged in to view profiles
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    // First, get the user with minimal fields to check if they exist
    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        caregiverProfile: true,
        pets: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Return user data with proper structure
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      city: user.city || user.caregiverProfile?.city || null,
      bio: user.caregiverProfile?.bio || null,
      createdAt: user.createdAt,
      caregiverProfile: user.caregiverProfile ? {
        hourlyRate: user.caregiverProfile.hourlyRate,
        services: user.caregiverProfile.services,
        bio: user.caregiverProfile.bio,
        photos: user.caregiverProfile.photos
      } : null,
      pets: user.pets?.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        photo: pet.photo
      })) || []
    })

  } catch (error) {
    console.error('Get user error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
