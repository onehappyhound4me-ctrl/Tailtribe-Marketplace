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

    const pet = await db.pet.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Huisdier niet gevonden' }, { status: 404 })
    }

    // Check authorization - user must be owner
    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      pet: pet
    })

  } catch (error) {
    console.error('Error fetching pet:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van het huisdier' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const pet = await db.pet.findUnique({
      where: { id: params.id }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Huisdier niet gevonden' }, { status: 404 })
    }

    // Check authorization
    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const body = await req.json()
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json({ error: 'Naam en type zijn verplicht' }, { status: 400 })
    }

    const updatedPet = await db.pet.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        customType: body.customType || null,
        breed: body.breed || null,
        age: body.age && body.age.trim() !== '' ? parseInt(body.age, 10) : null,
        weight: body.weight && body.weight.trim() !== '' ? parseFloat(body.weight) : null,
        gender: body.gender || null,
        spayedNeutered: body.spayedNeutered || false,
        medicalInfo: body.medicalInfo || null,
        socialWithPets: body.socialWithPets !== undefined ? body.socialWithPets : true,
        socialWithPeople: body.socialWithPeople !== undefined ? body.socialWithPeople : true,
        character: body.character || null,
        behaviorNotes: body.behaviorNotes || null,
        photo: body.photo || null,
        // Extra informatie velden
        color: body.color || null,
        microchipNumber: body.microchipNumber || null,
        vaccinations: body.vaccinations || null,
        allergies: body.allergies || null,
        medications: body.medications || null,
        veterinarianName: body.veterinarianName || null,
        veterinarianPhone: body.veterinarianPhone || null,
        emergencyContact: body.emergencyContact || null,
        specialNeeds: body.specialNeeds || null,
        temperament: body.temperament || null,
        notes: body.notes || null
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      pet: updatedPet
    })

  } catch (error) {
    console.error('Error updating pet:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het bijwerken van het huisdier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const pet = await db.pet.findUnique({
      where: { id: params.id }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Huisdier niet gevonden' }, { status: 404 })
    }

    // Check authorization
    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    await db.pet.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Huisdier verwijderd'
    })

  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwijderen van het huisdier' },
      { status: 500 }
    )
  }
}

























