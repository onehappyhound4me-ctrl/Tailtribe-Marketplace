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
    const { bookingId, rating, comment } = body

    if (!bookingId || !rating) {
      return NextResponse.json({ error: 'Booking ID en rating zijn verplicht' }, { status: 400 })
    }

    // Verify booking exists and user is either owner or caregiver
    const booking = await db.booking.findUnique({
      include: {
        owner: true,
        caregiver: true
      },
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Boeking niet gevonden' }, { status: 404 })
    }

    // Determine who is writing the review and who is being reviewed
    const isOwner = booking.ownerId === session.user.id
    const isCaregiver = booking.caregiverId === session.user.id

    if (!isOwner && !isCaregiver) {
      return NextResponse.json({ error: 'Je hebt geen toegang tot deze boeking' }, { status: 403 })
    }

    const authorRole = isOwner ? 'OWNER' : 'CAREGIVER'
    const revieweeId = isOwner ? booking.caregiverId : booking.ownerId
    const revieweeRole = isOwner ? 'CAREGIVER' : 'OWNER'

    // Check if review already exists
    const existingReview = await db.review.findFirst({
      where: {
        bookingId,
        authorId: session.user.id
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Je hebt al een review geplaatst voor deze boeking' }, { status: 400 })
    }

    // Create review
    const review = await db.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || '',
        authorId: session.user.id,
        authorRole: authorRole,
        revieweeId: revieweeId,
        revieweeRole: revieweeRole,
        bookingId: bookingId
      }
    })

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het plaatsen van de review' },
      { status: 500 }
    )
  }
}
