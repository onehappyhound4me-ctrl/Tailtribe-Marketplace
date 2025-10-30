import Stripe from 'stripe'

// Use a placeholder key for development builds
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLATFORM_FEE_BPS = parseInt(process.env.PLATFORM_FEE_BPS || '1000') // 10%

export async function createConnectedAccount(email: string, country: string = 'BE') {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
    })

    return account
  } catch (error) {
    console.error('Error creating Stripe connected account:', error)
    throw error
  }
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}

export async function createCheckoutSession({
  amountCents,
  currency = 'eur',
  connectedAccountId,
  platformFeeCents,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  amountCents: number
  currency?: string
  connectedAccountId: string
  platformFeeCents: number
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bancontact'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'TailTribe Service',
              description: 'Pet care service booking',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: connectedAccountId,
        },
        metadata,
      },
      metadata,
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function retrieveAccount(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return account
  } catch (error) {
    console.error('Error retrieving account:', error)
    throw error
  }
}

export async function createRefund(chargeId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount,
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}

export function calculatePlatformFee(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_BPS) / 10000)
}

export function formatAmount(amountCents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100)
}

