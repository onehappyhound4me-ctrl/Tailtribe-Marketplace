import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

const PLATFORM_COMMISSION_PERCENTAGE = parseInt(
  process.env.PLATFORM_COMMISSION_PERCENTAGE || '15'
)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
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
        },
        owner: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Boeking niet gevonden' },
        { status: 404 }
      )
    }

    if (booking.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Boeking moet eerst geaccepteerd worden' },
        { status: 400 }
      )
    }

    // Calculate amounts
    const totalAmount = booking.amountCents
    const platformFee = Math.floor(totalAmount * (PLATFORM_COMMISSION_PERCENTAGE / 100))
    const caregiverAmount = totalAmount - platformFee

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      metadata: {
        bookingId: booking.id,
        ownerId: booking.ownerId,
        caregiverId: booking.caregiverId,
        platformFee: platformFee.toString(),
      },
      description: `TailTribe boeking voor ${booking.caregiver.name}`,
    })

    // Update booking with payment info
    await db.booking.update({
      where: { id: bookingId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        platformFeeCents: platformFee,
        caregiverAmountCents: caregiverAmount,
        status: 'PAID',
        paidAt: new Date(),
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount / 100,
      platformFee: platformFee / 100,
      caregiverAmount: caregiverAmount / 100,
    })

  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




