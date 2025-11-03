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

    const body = await request.json()
    
    // Check if pet with same name and type already exists for this owner
    const existingPet = await db.pet.findFirst({
      where: {
        ownerId: session.user.id,
        name: body.name.trim(),
        type: body.type
      }
    })

    let pet
    if (existingPet) {
      // Update existing pet instead of creating duplicate
      pet = await db.pet.update({
        where: { id: existingPet.id },
        data: {
          breed: body.breed || null,
          gender: body.gender || null,
          age: body.age || null,
          weight: body.weight || null,
          spayedNeutered: body.spayedNeutered || false,
          medicalInfo: body.medicalInfo || null,
          socialWithPets: body.socialWithPets !== undefined ? body.socialWithPets : true,
          socialWithPeople: body.socialWithPeople !== undefined ? body.socialWithPeople : true,
          character: body.character || null
        }
      })
    } else {
      // Create new pet
      pet = await db.pet.create({
        data: {
          ownerId: session.user.id,
          name: body.name.trim(),
          type: body.type,
          breed: body.breed || null,
          gender: body.gender || null,
          age: body.age || null,
          weight: body.weight || null,
          spayedNeutered: body.spayedNeutered || false,
          medicalInfo: body.medicalInfo || null,
          socialWithPets: body.socialWithPets !== undefined ? body.socialWithPets : true,
          socialWithPeople: body.socialWithPeople !== undefined ? body.socialWithPeople : true,
          character: body.character || null
        }
      })
    }

    return NextResponse.json({ success: true, pet, isUpdate: !!existingPet })

  } catch (error) {
    console.error('Create pet error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




































