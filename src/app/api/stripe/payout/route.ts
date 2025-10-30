import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

// Process payout to caregiver after service completion
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Alleen admin kan payouts uitvoeren' },
        { status: 403 }
      )
    }

    const { bookingId } = await request.json()

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        caregiver: {
          include: {
            caregiverProfile: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Boeking niet gevonden' },
        { status: 404 }
      )
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Boeking moet voltooid zijn voor payout' },
        { status: 400 }
      )
    }

    if (booking.stripeTransferId) {
      return NextResponse.json(
        { error: 'Payout al uitgevoerd' },
        { status: 400 }
      )
    }

    const caregiverProfile = booking.caregiver.caregiverProfile

    if (!caregiverProfile?.stripeAccountId) {
      return NextResponse.json(
        { error: 'Verzorger heeft geen Stripe account gekoppeld' },
        { status: 400 }
      )
    }

    // Create transfer to caregiver's Stripe Connect account
    const transfer = await stripe.transfers.create({
      amount: booking.caregiverAmountCents || 0,
      currency: 'eur',
      destination: caregiverProfile.stripeAccountId,
      metadata: {
        bookingId: booking.id,
        caregiverId: booking.caregiverId,
      }
    })

    // Update booking
    await db.booking.update({
      where: { id: bookingId },
      data: {
        stripeTransferId: transfer.id,
      }
    })

    // TODO: Send email notification to caregiver

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: transfer.amount / 100,
      },
      message: 'Payout succesvol uitgevoerd'
    })

  } catch (error: any) {
    console.error('Payout error:', error)
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// Get all payouts (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const bookingsWithPayouts = await db.booking.findMany({
      where: {
        stripeTransferId: { not: null }
      },
      include: {
        caregiver: {
          select: { name: true, email: true }
        },
        owner: {
          select: { name: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 100
    })

    return NextResponse.json({
      payouts: bookingsWithPayouts.map(b => ({
        id: b.id,
        transferId: b.stripeTransferId,
        amount: (b.caregiverAmountCents || 0) / 100,
        caregiver: b.caregiver.name,
        owner: b.owner.name,
        date: b.updatedAt,
      }))
    })

  } catch (error) {
    console.error('Get payouts error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




