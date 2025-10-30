import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const { bookingId, amount, reason } = await req.json()

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        owner: { select: { name: true, email: true } },
        caregiver: { select: { name: true, email: true } }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Boeking niet gevonden' }, { status: 404 })
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json({ error: 'Geen betaling gevonden' }, { status: 400 })
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full
      reason: 'requested_by_customer',
      metadata: {
        bookingId: booking.id,
        adminReason: reason || 'Manual refund by admin'
      }
    })

    // Update booking status
    await db.booking.update({
      where: { id: bookingId },
      data: { status: 'REFUNDED' }
    })

    // TODO: Send email to owner about refund

    return NextResponse.json({ 
      success: true,
      refund,
      message: `€${(refund.amount / 100).toFixed(2)} terugbetaald aan ${booking.owner.name}`
    })

  } catch (error: any) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: error.message || 'Refund failed' },
      { status: 500 }
    )
  }
}





