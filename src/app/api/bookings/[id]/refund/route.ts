import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'
import { sendRefundEmail } from '@/lib/email-notifications'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Boeking niet gevonden' },
        { status: 404 }
      )
    }

    // Check permissions (owner can request refund)
    if (booking.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    if (booking.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Alleen betaalde boekingen kunnen worden terugbetaald' },
        { status: 400 }
      )
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Geen Stripe payment gevonden' },
        { status: 400 }
      )
    }

    // Check if refund is allowed (e.g., before start date)
    const now = new Date()
    const startDate = new Date(booking.startAt)
    const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundAmount = booking.amountCents

    // Partial refund if less than 24h before start
    if (hoursDiff < 24) {
      refundAmount = Math.floor(booking.amountCents * 0.5) // 50% refund
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        bookingId: booking.id,
        reason: reason || 'Owner requested cancellation'
      }
    })

    // Update booking status
    await db.booking.update({
      where: { id: params.id },
      data: {
        status: 'REFUNDED',
      }
    })

    // Send email notifications
    try {
      await sendRefundEmail({
        ownerEmail: booking.owner.email,
        ownerName: booking.owner.name,
        amount: refundAmount / 100,
        bookingId: booking.id,
        reason: reason || undefined
      })
    } catch (emailError) {
      console.error('Error sending refund email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      message: hoursDiff < 24 
        ? 'Terugbetaling van 50% is verwerkt (minder dan 24u voor start)'
        : 'Volledige terugbetaling is verwerkt'
    })

  } catch (error: any) {
    console.error('Refund error:', error)
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




