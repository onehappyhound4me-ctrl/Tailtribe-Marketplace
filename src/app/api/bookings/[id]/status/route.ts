import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendBookingConfirmationEmail } from '@/lib/email-notifications'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { caregiverProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const { status } = await req.json()

    // Check if user is caregiver
    const isCaregiver = user.role === 'CAREGIVER'

    // Validate status
    const validStatuses = ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
    }

    // IMPORTANT: Caregivers CANNOT cancel bookings (only via support!)
    // They can only ACCEPT, DECLINE, or mark as COMPLETED
    if (isCaregiver && status === 'CANCELLED') {
      return NextResponse.json({ 
        error: 'Verzorgers kunnen boekingen niet zelf annuleren. Neem contact op met support via steven@tailtribe.be' 
      }, { status: 403 })
    }

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        caregiver: true,
        owner: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Boeking niet gevonden' }, { status: 404 })
    }

    // Check authorization
    const isBookingCaregiver = user.caregiverProfile?.id === booking.caregiverId
    const isOwner = user.id === booking.ownerId

    if (!isBookingCaregiver && !isOwner) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    // Update booking status
    const updated = await db.booking.update({
      where: { id: params.id },
      data: { 
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      },
      include: {
        caregiver: {
          select: { name: true, email: true }
        },
        owner: {
          select: { name: true, email: true }
        }
      }
    })

    // Send email notification to owner when caregiver accepts/declines
    if (isBookingCaregiver && (status === 'ACCEPTED' || status === 'DECLINED')) {
      await sendBookingConfirmationEmail({
        ownerEmail: updated.owner.email,
        ownerName: updated.owner.name || 'Klant',
        caregiverName: updated.caregiver.name || 'Verzorger',
        serviceName: 'Service',
        date: new Date(booking.startAt).toLocaleDateString('nl-NL'),
        status: status as 'ACCEPTED' | 'DECLINED'
      })
    }

    return NextResponse.json({ 
      success: true,
      booking: updated,
      message: `Boeking ${status === 'ACCEPTED' ? 'geaccepteerd' : status === 'DECLINED' ? 'geweigerd' : 'bijgewerkt'}`
    })

  } catch (error: any) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
