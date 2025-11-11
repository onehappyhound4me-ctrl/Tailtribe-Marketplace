// Platform Configuration
export const PLATFORM_CONFIG = {
  // Commission rates
  COMMISSION_PERCENTAGE: 20, // Platform commission on bookings (%)
  
  // Payment settings
  MIN_PAYOUT_AMOUNT: 25, // Minimum payout amount in EUR
  PAYOUT_FREQUENCY: 'weekly', // weekly, biweekly, monthly
  
  // Platform info
  SUPPORT_EMAIL: 'steven@tailtribe.be',
  PLATFORM_NAME: 'TailTribe',
  
  // Countries
  SUPPORTED_COUNTRIES: ['BE', 'NL'] as const,
  
  // Stripe (when implemented)
  STRIPE_FEE_PERCENTAGE: 2.0, // Stripe fee (%)
  STRIPE_FEE_FIXED: 0.25, // Stripe fixed fee in EUR
} as const

// Helper function to calculate payouts
export function calculatePayout(bookingAmount: number) {
  const commission = (bookingAmount * PLATFORM_CONFIG.COMMISSION_PERCENTAGE) / 100
  const caregiverAmount = bookingAmount - commission
  
  return {
    bookingAmount,
    commission,
    commissionPercentage: PLATFORM_CONFIG.COMMISSION_PERCENTAGE,
    caregiverAmount,
    caregiverPercentage: 100 - PLATFORM_CONFIG.COMMISSION_PERCENTAGE
  }
}

// Helper function to calculate booking price (what customer pays)
export function calculateBookingPrice(caregiverPrice: number) {
  // For now, customer pays what caregiver asks
  // Later you could add commission on top if you want
  return caregiverPrice
}




































