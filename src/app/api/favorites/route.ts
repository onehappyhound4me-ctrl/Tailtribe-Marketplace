import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all favorites for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Get favorites with caregiver details
    const favorites = await db.favorite.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        caregiverId: true,
        createdAt: true
      }
    })

    // Get caregiver profiles for favorites - Filter out test users
    const caregiverIds = favorites.map(f => f.caregiverId)
    const caregivers = await db.caregiverProfile.findMany({
      where: { 
        id: { in: caregiverIds },
        isApproved: true,
        user: {
          AND: [
            {
              OR: [
                { email: { not: { contains: 'test', mode: 'insensitive' } } },
                { email: null }
              ]
            },
            {
              OR: [
                { email: { not: { contains: 'example.com', mode: 'insensitive' } } },
                { email: null }
              ]
            },
            {
              OR: [
                { name: { not: { contains: 'test', mode: 'insensitive' } } },
                { name: null }
              ]
            },
          ],
        },
      },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      }
    })
    
    // Additional client-side filtering
    const filteredCaregivers = caregivers.filter(caregiver => {
      const email = caregiver.user.email?.toLowerCase() || ''
      const name = caregiver.user.name?.toLowerCase() || ''
      const testPatterns = ['test', 'example.com', 'demo', 'fake', 'temp', 'sample']
      return !testPatterns.some(pattern => email.includes(pattern) || name.includes(pattern))
    })

    return NextResponse.json({ 
      favorites: favorites.map(fav => ({
        ...fav,
        caregiver: filteredCaregivers.find(c => c.id === fav.caregiverId)
      }))
    })

  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}

// POST - Add favorite
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const { caregiverId } = await req.json()

    if (!caregiverId) {
      return NextResponse.json({ error: 'caregiverId is verplicht' }, { status: 400 })
    }

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        ownerId_caregiverId: {
          ownerId: user.id,
          caregiverId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Al toegevoegd aan favorieten' }, { status: 400 })
    }

    // Create favorite
    const favorite = await db.favorite.create({
      data: {
        ownerId: user.id,
        caregiverId
      }
    })

    return NextResponse.json({ 
      success: true,
      favorite,
      message: 'Toegevoegd aan favorieten'
    })

  } catch (error: any) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove favorite
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const { caregiverId } = await req.json()

    await db.favorite.deleteMany({
      where: {
        ownerId: user.id,
        caregiverId
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Verwijderd uit favorieten'
    })

  } catch (error: any) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}





