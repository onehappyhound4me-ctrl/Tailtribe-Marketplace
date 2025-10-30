import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            preferences: true,
            perfectExperience: true,
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
                character: true
              }
            }
          }
        },
        caregiver: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    })
    
    // Get caregiver profile separately
    let caregiverProfileId = null
    if (booking) {
      const profile = await db.caregiverProfile.findUnique({
        where: { userId: booking.caregiverId },
        select: { id: true }
      })
      caregiverProfileId = profile?.id || null
    }

    if (!booking) {
      return NextResponse.json({ error: 'Boeking niet gevonden' }, { status: 404 })
    }

    // Check authorization - user must be owner or caregiver
    if (booking.ownerId !== session.user.id && booking.caregiverId !== session.user.id) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    // Parse owner preferences
    const ownerPreferences = booking.owner.preferences ? JSON.parse(booking.owner.preferences) : null
    
    // Find the specific pet for this booking
    const bookingPet = booking.owner.pets.find(pet => 
      pet.name === booking.petName && pet.type === booking.petType
    )

    // Format the booking data
    const formattedBooking = {
      id: booking.id,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      amountCents: booking.amountCents,
      petName: booking.petName || '',
      petType: booking.petType || '',
      petBreed: booking.petBreed || '',
      specialInstructions: booking.specialInstructions || '',
      offLeashAllowed: booking.offLeashAllowed || false,
      emergencyContactName: booking.emergencyContactName || '',
      emergencyContactPhone: booking.emergencyContactPhone || '',
      veterinarianName: booking.veterinarianName || '',
      veterinarianPhone: booking.veterinarianPhone || '',
      veterinarianAddress: booking.veterinarianAddress || '',
      caregiverId: booking.caregiverId,
      caregiverProfileId: caregiverProfileId,
      ownerId: booking.ownerId,
      caregiver: {
        name: booking.caregiver.name || 'Verzorger',
        email: booking.caregiver.email || ''
      },
      owner: {
        name: booking.owner.name || 'Eigenaar',
        email: booking.owner.email || '',
        phone: booking.owner.phone || '',
        preferences: ownerPreferences,
        perfectExperience: booking.owner.perfectExperience || '',
        pets: booking.owner.pets
      },
      // Enhanced pet information
      petDetails: bookingPet ? {
        id: bookingPet.id,
        name: bookingPet.name,
        type: bookingPet.type,
        breed: bookingPet.breed,
        age: bookingPet.age,
        weight: bookingPet.weight,
        gender: bookingPet.gender,
        spayedNeutered: bookingPet.spayedNeutered,
        medicalInfo: bookingPet.medicalInfo,
        socialWithPets: bookingPet.socialWithPets,
        socialWithPeople: bookingPet.socialWithPeople,
        character: bookingPet.character
      } : null
    }

    return NextResponse.json({
      success: true,
      booking: formattedBooking
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de boeking' },
      { status: 500 }
    )
  }
}


















