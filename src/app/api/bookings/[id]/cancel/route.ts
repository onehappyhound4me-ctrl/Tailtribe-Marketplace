import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculateCancellation } from '@/lib/cancellation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        caregiver: {
          select: { name: true, email: true }
        },
        owner: {
          select: { name: true, email: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Boeking niet gevonden' }, { status: 404 })
    }

    // Only OWNER can cancel bookings (not caregivers!)
    if (user.id !== booking.ownerId) {
      return NextResponse.json({ 
        error: 'Alleen de eigenaar kan deze boeking annuleren. Verzorgers moeten contact opnemen met support.' 
      }, { status: 403 })
    }

    // Calculate cancellation fees
    const cancellation = calculateCancellation(
      new Date(booking.startAt),
      booking.amountCents / 100
    )

    if (!cancellation.canCancel) {
      return NextResponse.json({ 
        error: cancellation.reason 
      }, { status: 400 })
    }

    // Process refund if applicable
    let refundId = null
    if (cancellation.refundPercentage > 0 && booking.stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: Math.round(cancellation.refundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            bookingId: booking.id,
            cancellationFeePercentage: cancellation.feePercentage.toString()
          }
        })
        refundId = refund.id
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError)
        // Continue anyway - admin can manually refund
      }
    }

    // Update booking status
    const updated = await db.booking.update({
      where: { id: params.id },
      data: { 
        status: 'CANCELLED'
      }
    })

    // TODO: Send email to caregiver about cancellation

    return NextResponse.json({ 
      success: true,
      booking: updated,
      cancellation: {
        refundPercentage: cancellation.refundPercentage,
        refundAmount: cancellation.refundAmount,
        feeAmount: cancellation.feeAmount,
        stripeRefundId: refundId
      },
      message: `Boeking geannuleerd. ${cancellation.reason}${cancellation.refundAmount > 0 ? ` €${cancellation.refundAmount.toFixed(2)} wordt terugbetaald.` : ''}`
    })

  } catch (error: any) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}





