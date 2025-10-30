import { db } from './db'

/**
 * Checks if a user has a confirmed booking with a specific caregiver
 * @param userId - The user's ID
 * @param caregiverId - The caregiver's user ID
 * @returns true if user has ACCEPTED or PAID booking with this caregiver
 */
export async function hasConfirmedBookingWith(
  userId: string | undefined,
  caregiverId: string
): Promise<boolean> {
  if (!userId) return false
  
  try {
    const confirmedBooking = await db.booking.findFirst({
      where: {
        ownerId: userId,
        caregiverId: caregiverId,
        status: {
          in: ['ACCEPTED', 'PAID']
        }
      }
    })
    
    return !!confirmedBooking
  } catch (error) {
    console.error('Error checking booking status:', error)
    return false
  }
}

/**
 * Gets the booking relationship between a user and caregiver
 * @returns Object with booking status info
 */
export async function getBookingRelationship(
  userId: string | undefined,
  caregiverId: string
): Promise<{
  hasBooking: boolean
  hasConfirmedBooking: boolean
  bookingCount: number
}> {
  if (!userId) {
    return {
      hasBooking: false,
      hasConfirmedBooking: false,
      bookingCount: 0
    }
  }
  
  try {
    const [allBookings, confirmedBookings] = await Promise.all([
      db.booking.count({
        where: {
          ownerId: userId,
          caregiverId: caregiverId
        }
      }),
      db.booking.count({
        where: {
          ownerId: userId,
          caregiverId: caregiverId,
          status: {
            in: ['ACCEPTED', 'PAID']
          }
        }
      })
    ])
    
    return {
      hasBooking: allBookings > 0,
      hasConfirmedBooking: confirmedBookings > 0,
      bookingCount: allBookings
    }
  } catch (error) {
    console.error('Error getting booking relationship:', error)
    return {
      hasBooking: false,
      hasConfirmedBooking: false,
      bookingCount: 0
    }
  }
}




