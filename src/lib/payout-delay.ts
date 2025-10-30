/**
 * Delayed Payout System
 * 
 * Prevents platform leakage by holding payouts 48-72 hours
 * - Gives time to verify service was completed
 * - Allows dispute window
 * - Prevents immediate cash-out after off-platform deal
 * 
 * Based on Airbnb/Rover model
 */

import { db } from './db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Payout delay in hours (default: 72 hours)
const PAYOUT_DELAY_HOURS = parseInt(process.env.PAYOUT_DELAY_HOURS || '72')

/**
 * Calculate when payout should be released
 */
export function calculatePayoutDate(bookingCompletedAt: Date): Date {
  const payoutDate = new Date(bookingCompletedAt)
  payoutDate.setHours(payoutDate.getHours() + PAYOUT_DELAY_HOURS)
  return payoutDate
}

/**
 * Check if payout can be released
 */
export function canReleasePayout(bookingCompletedAt: Date): boolean {
  const releaseDate = calculatePayoutDate(bookingCompletedAt)
  return new Date() >= releaseDate
}

/**
 * Get hours remaining until payout
 */
export function getHoursUntilPayout(bookingCompletedAt: Date): number {
  const releaseDate = calculatePayoutDate(bookingCompletedAt)
  const now = new Date()
  const diff = releaseDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)))
}

/**
 * Process pending payouts (called from cron)
 */
export async function processPendingPayouts(): Promise<{
  processed: number
  failed: number
  errors: string[]
}> {
  const results = {
    processed: 0,
    failed: 0,
    errors: [] as string[]
  }

  try {
    // Find completed bookings that are ready for payout
    const now = new Date()
    const releaseThreshold = new Date()
    releaseThreshold.setHours(releaseThreshold.getHours() - PAYOUT_DELAY_HOURS)

    const readyBookings = await db.booking.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          lte: releaseThreshold // Completed at least 72h ago
        },
        stripeTransferId: null, // Not yet transferred
        stripePaymentIntentId: { not: null } // Has payment
      },
      include: {
        caregiver: {
          select: {
            id: true,
            caregiverProfile: {
              select: {
                stripeAccountId: true
              }
            }
          }
        }
      },
      take: 50 // Process max 50 at a time
    })

    console.log(`Found ${readyBookings.length} bookings ready for payout`)

    for (const booking of readyBookings) {
      try {
        const stripeAccountId = booking.caregiver.caregiverProfile?.stripeAccountId

        if (!stripeAccountId) {
          results.errors.push(`Booking ${booking.id}: No Stripe account for caregiver`)
          results.failed++
          continue
        }

        if (!booking.caregiverAmountCents) {
          results.errors.push(`Booking ${booking.id}: No caregiver amount set`)
          results.failed++
          continue
        }

        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: booking.caregiverAmountCents,
          currency: 'eur',
          destination: stripeAccountId,
          description: `Uitbetaling voor boeking ${booking.id}`,
          metadata: {
            bookingId: booking.id,
            caregiverId: booking.caregiverId,
            delayedPayout: 'true',
            hoursDelayed: PAYOUT_DELAY_HOURS.toString()
          }
        })

        // Update booking with transfer ID
        await db.booking.update({
          where: { id: booking.id },
          data: {
            stripeTransferId: transfer.id
          }
        })

        results.processed++
        console.log(`✅ Payout processed for booking ${booking.id}: €${booking.caregiverAmountCents / 100}`)

        // TODO: Send email to caregiver
        // await sendPayoutNotification(...)

      } catch (error: any) {
        console.error(`❌ Payout failed for booking ${booking.id}:`, error.message)
        results.failed++
        results.errors.push(`Booking ${booking.id}: ${error.message}`)
      }
    }

    return results

  } catch (error: any) {
    console.error('Error processing payouts:', error)
    throw error
  }
}

/**
 * Cancel/reverse a payout (in case of dispute)
 */
export async function reversePayout(bookingId: string, reason: string): Promise<boolean> {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking || !booking.stripeTransferId) {
      return false
    }

    // Reverse the transfer (if not yet sent to bank)
    try {
      await stripe.transfers.createReversal(booking.stripeTransferId, {
        description: `Reversed: ${reason}`,
        metadata: {
          bookingId,
          reason
        }
      })

      console.log(`✅ Transfer reversed for booking ${bookingId}`)
      return true

    } catch (stripeError: any) {
      // Transfer already sent to bank - can't reverse
      console.error(`Cannot reverse transfer:`, stripeError.message)
      
      // Instead, issue refund to owner and notify admin
      // This creates a loss for the platform
      return false
    }

  } catch (error) {
    console.error('Error reversing payout:', error)
    return false
  }
}

/**
 * Get payout status for a booking
 */
export async function getPayoutStatus(bookingId: string): Promise<{
  status: 'pending' | 'delayed' | 'processing' | 'completed' | 'disputed'
  hoursRemaining?: number
  releaseDate?: Date
  amount?: number
}> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      caregiver: {
        select: {
          caregiverProfile: {
            select: {
              stripeAccountId: true
            }
          }
        }
      }
    }
  })

  if (!booking) {
    return { status: 'pending' }
  }

  // If already transferred
  if (booking.stripeTransferId) {
    return {
      status: 'completed',
      amount: booking.caregiverAmountCents ? booking.caregiverAmountCents / 100 : 0
    }
  }

  // If not yet completed
  if (booking.status !== 'COMPLETED' || !booking.completedAt) {
    return { status: 'pending' }
  }

  // Check if ready for payout
  const canPayout = canReleasePayout(booking.completedAt)
  const hoursRemaining = getHoursUntilPayout(booking.completedAt)
  const releaseDate = calculatePayoutDate(booking.completedAt)

  return {
    status: canPayout ? 'processing' : 'delayed',
    hoursRemaining: canPayout ? 0 : hoursRemaining,
    releaseDate,
    amount: booking.caregiverAmountCents ? booking.caregiverAmountCents / 100 : 0
  }
}





