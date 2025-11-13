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

    const { pets } = await request.json()
    
    if (!pets || !Array.isArray(pets) || pets.length === 0) {
      return NextResponse.json({ error: 'Geen huisdieren opgegeven' }, { status: 400 })
    }

    // Validate all pets first
    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i]
      
      if (!pet.name || !pet.name.trim()) {
        return NextResponse.json({ error: `Naam voor huisdier ${i + 1} is verplicht` }, { status: 400 })
      }
      
      if (!pet.type) {
        return NextResponse.json({ error: `Type voor huisdier ${i + 1} is verplicht` }, { status: 400 })
      }
    }

    // Create all pets in a transaction
    const createdPets = await db.$transaction(
      pets.map(pet => 
        db.pet.create({
          data: {
            ownerId: session.user.id,
            name: pet.name,
            type: pet.type,
            breed: pet.breed || null,
            gender: pet.gender || null,
            age: pet.age || null,
            weight: pet.weight || null,
            spayedNeutered: pet.spayedNeutered || false,
            medicalInfo: pet.medicalInfo || null,
            socialWithPets: pet.socialWithPets !== undefined ? pet.socialWithPets : true,
            socialWithPeople: pet.socialWithPeople !== undefined ? pet.socialWithPeople : true,
            character: pet.character || null
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      pets: createdPets,
      count: createdPets.length 
    })

  } catch (error) {
    console.error('Create multiple pets error:', error)
    return NextResponse.json({ error: 'Er ging iets mis bij het opslaan van de huisdieren' }, { status: 500 })
  }
}

















