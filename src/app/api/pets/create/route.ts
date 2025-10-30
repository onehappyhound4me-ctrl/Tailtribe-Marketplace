import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { 
      name, type, customType, breed, gender, age, weight, spayedNeutered, 
      medicalInfo, socialWithPets, socialWithPeople, character, behaviorNotes, photo,
      color, microchipNumber, vaccinations, allergies, medications, veterinarianName,
      veterinarianPhone, emergencyContact, specialNeeds, temperament, notes
    } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: 'Naam en type zijn verplicht' }, { status: 400 })
    }

    if (type === 'OTHER' && !customType) {
      return NextResponse.json({ error: 'Specificeer welk dier bij "Anders"' }, { status: 400 })
    }

    // Create pet
    const pet = await db.pet.create({
      data: {
        ownerId: session.user.id,
        name,
        type,
        customType: customType || null,
        breed: breed || null,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        spayedNeutered: spayedNeutered || false,
        medicalInfo: medicalInfo || null,
        socialWithPets: socialWithPets !== undefined ? socialWithPets : true,
        socialWithPeople: socialWithPeople !== undefined ? socialWithPeople : true,
        character: character || null,
        behaviorNotes: behaviorNotes || null,
        photo: photo || null,
        // Extra informatie velden
        color: color || null,
        microchipNumber: microchipNumber || null,
        vaccinations: vaccinations || null,
        allergies: allergies || null,
        medications: medications || null,
        veterinarianName: veterinarianName || null,
        veterinarianPhone: veterinarianPhone || null,
        emergencyContact: emergencyContact || null,
        specialNeeds: specialNeeds || null,
        temperament: temperament || null,
        notes: notes || null
      }
    })

    return NextResponse.json({ success: true, pet }, { status: 201 })
  } catch (error) {
    console.error('Create pet error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




