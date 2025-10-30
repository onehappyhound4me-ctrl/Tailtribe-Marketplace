import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

// Create Stripe Connect account for caregiver
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Alleen verzorgers kunnen een Stripe account aanmaken' },
        { status: 403 }
      )
    }

    // Check if caregiver profile exists
    const profile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Caregiver profiel niet gevonden. Maak eerst je profiel compleet.' },
        { status: 400 }
      )
    }

    // If already has Stripe account, return onboarding link
    if (profile.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: profile.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payment`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payment?success=true`,
        type: 'account_onboarding',
      })

      return NextResponse.json({
        url: accountLink.url,
        accountId: profile.stripeAccountId
      })
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'BE', // België
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: session.user.id,
        caregiverProfileId: profile.id,
      }
    })

    // Save Stripe account ID
    await db.caregiverProfile.update({
      where: { id: profile.id },
      data: {
        stripeAccountId: account.id,
        stripeOnboarded: false,
      }
    })

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payment`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payment?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id
    })

  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// Check onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const profile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile?.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false
      })
    }

    // Check Stripe account status
    const account = await stripe.accounts.retrieve(profile.stripeAccountId)

    const isOnboarded = account.details_submitted && account.charges_enabled

    // Update database if status changed
    if (isOnboarded !== profile.stripeOnboarded) {
      await db.caregiverProfile.update({
        where: { id: profile.id },
        data: { stripeOnboarded: isOnboarded }
      })
    }

    return NextResponse.json({
      connected: true,
      onboarded: isOnboarded,
      accountId: profile.stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    })

  } catch (error: any) {
    console.error('Check onboarding error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




