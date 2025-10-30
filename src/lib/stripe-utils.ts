// Stripe utility functions
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export const PLATFORM_COMMISSION_PERCENTAGE = parseInt(
  process.env.PLATFORM_COMMISSION_PERCENTAGE || '20'
)

export function calculateCommission(amountCents: number) {
  const platformFee = Math.floor(amountCents * (PLATFORM_COMMISSION_PERCENTAGE / 100))
  const caregiverAmount = amountCents - platformFee
  const stripeFee = Math.ceil(amountCents * 0.029 + 30) // Stripe fee ~2.9% + €0.30

  return {
    total: amountCents,
    platformFee,
    caregiverAmount,
    stripeFee,
    netRevenue: platformFee - stripeFee,
  }
}

export async function createPaymentIntent({
  amount,
  bookingId,
  ownerId,
  caregiverId,
  platformFee,
}: {
  amount: number
  bookingId: string
  ownerId: string
  caregiverId: string
  platformFee: number
}) {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
    metadata: {
      bookingId,
      ownerId,
      caregiverId,
      platformFee: platformFee.toString(),
    },
    description: `TailTribe booking ${bookingId}`,
  })
}

export async function createTransfer({
  amount,
  destination,
  bookingId,
}: {
  amount: number
  destination: string
  bookingId: string
}) {
  return await stripe.transfers.create({
    amount,
    currency: 'eur',
    destination,
    metadata: { bookingId }
  })
}

export async function createRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string
  amount: number
  reason?: string
}) {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason: 'requested_by_customer',
    metadata: { reason: reason || 'Customer requested' }
  })
}

export { stripe }




