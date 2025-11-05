export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    // Remove duplicates: keep the most recent pet for each name+type combination
    const seen = new Map<string, typeof allPets[0]>()
    const pets: typeof allPets = []
    
    for (const pet of allPets) {
      const key = `${pet.name.toLowerCase().trim()}_${pet.type}`
      if (!seen.has(key)) {
        seen.set(key, pet)
        pets.push(pet)
      }
    }

    return NextResponse.json({ pets })

  } catch (error) {
    console.error('List pets error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




































