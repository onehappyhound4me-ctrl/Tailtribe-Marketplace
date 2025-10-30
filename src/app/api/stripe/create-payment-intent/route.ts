import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

import { PLATFORM_CONFIG } from '@/lib/constants'

const PLATFORM_COMMISSION = PLATFORM_CONFIG.COMMISSION_PERCENTAGE / 100 // 20%

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { bookingId, amount } = await req.json()

    // Get booking details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
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

    // Calculate amounts
    const totalAmount = Math.round(amount * 100) // Convert to cents
    const platformFee = Math.round(totalAmount * PLATFORM_COMMISSION)
    const caregiverAmount = totalAmount - platformFee

    // Check if caregiver has Stripe account (simplified check)
    // For now, assume all caregivers have accounts

    // Create payment intent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: 'acct_test_caregiver', // Placeholder for now
      },
      metadata: {
        bookingId: booking.id,
        caregiverId: booking.caregiverId,
        ownerId: booking.ownerId,
        platformFee: platformFee.toString(),
        caregiverAmount: caregiverAmount.toString()
      },
      description: `Boeking voor ${booking.caregiver.name}`
    })

    // Update booking with payment info
    await db.booking.update({
      where: { id: bookingId },
      data: {
        amountCents: totalAmount,
        platformFeeCents: platformFee,
        caregiverAmountCents: caregiverAmount,
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amounts: {
        total: totalAmount / 100,
        platformFee: platformFee / 100,
        caregiverReceives: caregiverAmount / 100
      }
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Payment error' },
      { status: 500 }
    )
  }
}





