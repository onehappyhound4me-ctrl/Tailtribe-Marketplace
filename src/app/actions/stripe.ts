'use server'

import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createPaymentLink(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

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
      throw new Error('Booking not found')
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'bancontact'],
      currency: 'eur',
      customer_email: session.user.email!,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Dierenverzorging - ${booking.caregiver.name}`,
              description: `Boeking van ${new Date(booking.startAt).toLocaleDateString('nl-BE')} tot ${new Date(booking.endAt).toLocaleDateString('nl-BE')}`,
            },
            unit_amount: booking.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}`,
      metadata: {
        booking_id: bookingId,
        caregiver_id: booking.caregiverId,
        owner_id: booking.ownerId,
      },
    })

    // Update booking with payment link
    await db.booking.update({
      where: { id: bookingId },
      data: { 
        paymentLink: checkoutSession.url,
        status: 'ACCEPTED' // Move to accepted when payment link is created
      }
    })

    return { success: true, paymentUrl: checkoutSession.url }

  } catch (error) {
    console.error('Create payment link error:', error)
    return { success: false, error: 'Er ging iets mis bij het maken van de betaallink' }
  }
}

export async function createConnectAccount(caregiverId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'CAREGIVER') {
      throw new Error('Only caregivers can create connect accounts')
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'BE',
      email: session.user.email!,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?setup=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?setup=complete`,
      type: 'account_onboarding',
    })

    // TODO: Add stripeAccountId and stripeAccountStatus fields to CaregiverProfile schema
    // await db.caregiverProfile.update({
    //   where: { id: caregiverId },
    //   data: { 
    //     stripeAccountId: account.id,
    //     stripeAccountStatus: 'pending'
    //   }
    // })

    return { success: true, onboardingUrl: accountLink.url }

  } catch (error) {
    console.error('Create connect account error:', error)
    return { success: false, error: 'Er ging iets mis bij het maken van het Stripe account' }
  }
}

export async function getAccountStatus(stripeAccountId: string) {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId)
    
    return {
      success: true,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      }
    }

  } catch (error) {
    console.error('Get account status error:', error)
    return { success: false, error: 'Er ging iets mis bij het ophalen van account status' }
  }
}

