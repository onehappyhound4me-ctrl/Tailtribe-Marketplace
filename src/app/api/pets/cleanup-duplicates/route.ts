import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Cleanup API to remove duplicate pets
// Keep the most recent pet for each name+type combination
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    // Get all pets for this user
    const allPets = await db.pet.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Find duplicates: group by name+type
    const petGroups = new Map<string, typeof allPets>()
    
    for (const pet of allPets) {
      const key = `${pet.name.toLowerCase().trim()}_${pet.type}`
      if (!petGroups.has(key)) {
        petGroups.set(key, [])
      }
      petGroups.get(key)!.push(pet)
    }

    // Delete duplicates (keep the first one, which is the most recent due to desc sort)
    let deletedCount = 0
    const idsToDelete: string[] = []

    for (const [key, pets] of petGroups.entries()) {
      if (pets.length > 1) {
        // Keep the first (most recent), delete the rest
        for (let i = 1; i < pets.length; i++) {
          idsToDelete.push(pets[i].id)
        }
      }
    }

    // Delete duplicates in batch
    if (idsToDelete.length > 0) {
      await db.pet.deleteMany({
        where: {
          id: { in: idsToDelete },
          ownerId: session.user.id // Extra safety check
        }
      })
      deletedCount = idsToDelete.length
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `${deletedCount} duplicaten verwijderd`
    })

  } catch (error) {
    console.error('Cleanup duplicates error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}

