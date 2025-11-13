import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendServiceCompletionEmail } from '@/lib/email-notifications'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        caregiverProfile: true
      }
    })

    if (!user?.caregiverProfile) {
      return NextResponse.json({ error: 'Alleen verzorgers kunnen services voltooien' }, { status: 403 })
    }

    const { 
      bookingId, 
      photos, 
      checkInLocation, 
      checkOutLocation, 
      notes, 
      rating 
    } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Verify booking belongs to this caregiver
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        owner: { select: { name: true, email: true } },
        serviceCompletion: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Boeking niet gevonden' }, { status: 404 })
    }

    if (booking.caregiverId !== user.id) {
      return NextResponse.json({ error: 'Deze boeking behoort niet tot jou' }, { status: 403 })
    }

    if (booking.status !== 'ACCEPTED' && booking.status !== 'PAID') {
      return NextResponse.json({ error: 'Deze boeking kan niet worden voltooid' }, { status: 400 })
    }

    if (booking.serviceCompletion) {
      return NextResponse.json({ error: 'Service is al voltooid' }, { status: 400 })
    }

    // Create service completion record
    const completion = await db.serviceCompletion.create({
      data: {
        bookingId,
        photos: photos ? JSON.stringify(photos) : null,
        checkInTime: new Date(),
        checkOutTime: new Date(),
        checkInLocation,
        checkOutLocation,
        notes,
        rating: rating ? parseInt(rating) : null,
      }
    })

    // Update booking status to COMPLETED
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    // Send email notification to owner
    try {
      await sendServiceCompletionEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name,
        caregiverName: user.name || 'Verzorger',
        serviceName: 'Dierenverzorging', // Default service name
        bookingId: booking.id,
        date: `${new Date(booking.startAt).toLocaleDateString('nl-NL')} - ${new Date(booking.endAt).toLocaleDateString('nl-NL')}`,
        notes: notes || undefined
      })
    } catch (emailError) {
      console.error('Error sending service completion email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      completion: {
        id: completion.id,
        bookingId: completion.bookingId,
        photos: completion.photos ? JSON.parse(completion.photos) : [],
        notes: completion.notes,
        completedAt: completion.completedAt
      },
      message: 'Service succesvol voltooid! De eigenaar ontvangt een notificatie.'
    })

  } catch (error: any) {
    console.error('Error creating service completion:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete service' },
      { status: 500 }
    )
  }
}





