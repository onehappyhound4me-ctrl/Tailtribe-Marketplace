import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const petId = searchParams.get('id')

    if (!petId) {
      return NextResponse.json(
        { error: 'Pet ID is required' },
        { status: 400 }
      )
    }

    // Check if pet belongs to user
    const pet = await db.pet.findUnique({
      where: { id: petId }
    })

    if (!pet || pet.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Pet not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete pet
    await db.pet.delete({
      where: { id: petId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete pet error:', error)
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    )
  }
}

