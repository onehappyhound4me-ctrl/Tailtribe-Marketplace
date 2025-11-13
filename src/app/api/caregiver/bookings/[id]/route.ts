import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendBookingConfirmationEmail } from '@/lib/email-notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action } = await request.json()
    
    if (!action || !['confirm', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Check if booking exists and belongs to this caregiver
    const booking = await db.booking.findFirst({
      where: {
        id: params.id,
        caregiverId: session.user.id
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        caregiver: {
          select: {
            name: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Booking is not pending' }, { status: 400 })
    }

    // Update booking status
    const newStatus = action === 'confirm' ? 'ACCEPTED' : 'DECLINED'
    
    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: { status: newStatus }
    })

    // Send email notification to owner about status change
    try {
      await sendBookingConfirmationEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name || 'Eigenaar',
        caregiverName: booking.caregiver.name || 'Verzorger',
        serviceName: 'Dierenverzorging', // Default service name
        date: `${new Date(booking.startAt).toLocaleDateString('nl-NL')} - ${new Date(booking.endAt).toLocaleDateString('nl-NL')}`,
        status: newStatus === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED'
      })
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status
      }
    })

  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}























