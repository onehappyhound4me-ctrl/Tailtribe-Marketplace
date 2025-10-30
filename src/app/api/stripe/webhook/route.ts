import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update booking status
        await db.booking.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id
          },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        })

        console.log(`Payment succeeded: ${paymentIntent.id}`)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        
        await db.booking.updateMany({
          where: {
            stripePaymentIntentId: failedPayment.id
          },
          data: {
            status: 'PENDING'
          }
        })

        console.log(`Payment failed: ${failedPayment.id}`)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Required for Stripe webhooks
export const dynamic = 'force-dynamic'
