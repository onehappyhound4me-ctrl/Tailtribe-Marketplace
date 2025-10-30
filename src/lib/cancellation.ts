/**
 * Cancellation Policy & Fee Calculator (volgens TailTribe FAQ)
 * 
 * Rules (EXACT MATCH MET FAQ):
 * - Tot 1 dag vóór aanvang EN vóór 12:00 uur: 100% refund
 * - Later (maar vóór aanvang): 50% refund
 * - Tijdens reservatieperiode: geen refund
 */

export interface CancellationResult {
  canCancel: boolean
  refundPercentage: number
  feePercentage: number
  refundAmount: number
  feeAmount: number
  reason: string
}

export function calculateCancellation(
  bookingDate: Date,
  totalAmount: number,
  currentDate: Date = new Date()
): CancellationResult {
  const hoursUntilBooking = (bookingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60)
  const currentHour = currentDate.getHours()
  const currentMinute = currentDate.getMinutes()

  // Booking already started or passed
  if (hoursUntilBooking <= 0) {
    return {
      canCancel: false,
      refundPercentage: 0,
      feePercentage: 100,
      refundAmount: 0,
      feeAmount: totalAmount,
      reason: 'Boeking is al gestart of voorbij'
    }
  }

  // 100% refund: >24 hours until booking AND before 12:00 noon today
  const isBeforeNoon = currentHour < 12
  const moreThan24Hours = hoursUntilBooking >= 24

  if (moreThan24Hours && isBeforeNoon) {
    return {
      canCancel: true,
      refundPercentage: 100,
      feePercentage: 0,
      refundAmount: totalAmount,
      feeAmount: 0,
      reason: 'Volledige terugbetaling (>1 dag én vóór 12:00 uur)'
    }
  }

  // 50% refund: before booking starts but doesn't meet full refund criteria
  if (hoursUntilBooking > 0) {
    const refundAmount = totalAmount * 0.5
    const feeAmount = totalAmount * 0.5
    return {
      canCancel: true,
      refundPercentage: 50,
      feePercentage: 50,
      refundAmount,
      feeAmount,
      reason: '50% terugbetaling (later dan 1 dag vóór 12:00 uur)'
    }
  }

  // No refund (should not reach here due to first check, but safety)
  return {
    canCancel: true,
    refundPercentage: 0,
    feePercentage: 100,
    refundAmount: 0,
    feeAmount: totalAmount,
    reason: 'Geen terugbetaling'
  }
}

export function formatCancellationPolicy(): string {
  return `
**Annuleringsvoorwaarden:**

- **Tot 1 dag vóór aanvang EN vóór 12:00 uur:** Volledige terugbetaling (100%)
- **Later maar vóór aanvang:** 50% terugbetaling
- **Tijdens de reservatieperiode:** Geen terugbetaling

**Let op:** De annuleringstijd wordt berekend vanaf de geplande starttijd van de service.
  `.trim()
}

export function getCancellationWarning(
  hoursUntil: number, 
  currentDate: Date = new Date()
): {
  level: 'success' | 'warning' | 'error'
  message: string
} {
  const currentHour = currentDate.getHours()
  const isBeforeNoon = currentHour < 12
  const moreThan24Hours = hoursUntil >= 24

  if (moreThan24Hours && isBeforeNoon) {
    return {
      level: 'success',
      message: '✓ Gratis annuleren mogelijk (100% refund)'
    }
  }
  if (hoursUntil > 0) {
    return {
      level: 'warning',
      message: '⚠️ 50% annuleringskosten'
    }
  }
  return {
    level: 'error',
    message: '❌ Annuleren niet meer mogelijk'
  }
}

