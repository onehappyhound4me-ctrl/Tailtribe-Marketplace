/**
 * Contact Gating Utilities
 * 
 * Protects caregiver privacy by limiting info visibility to users
 * who haven't booked yet. Standard for marketplace platforms.
 */

/**
 * Masks a full name to show only first name + last initial
 * @example "Emma Willems" → "Emma W."
 * @example "Jan" → "Jan"
 */
export function maskName(fullName: string | null | undefined): string {
  if (!fullName) return 'Verzorger'
  
  const parts = fullName.trim().split(' ')
  
  if (parts.length === 1) {
    return parts[0] // Only first name, return as-is
  }
  
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  
  return `${firstName} ${lastInitial}.`
}

/**
 * Limits photo array to only show first N photos
 * @param photos - Array of photo URLs
 * @param maxPhotos - Maximum number of photos to show (default: 2)
 */
export function limitPhotos(photos: string[] | null | undefined, maxPhotos: number = 2): string[] {
  if (!photos || photos.length === 0) return []
  return photos.slice(0, maxPhotos)
}

/**
 * Truncates bio text for non-booked users
 * @param bio - Full bio text
 * @param maxLength - Maximum character length (default: 150)
 */
export function truncateBio(bio: string | null | undefined, maxLength: number = 150): string {
  if (!bio) return ''
  
  if (bio.length <= maxLength) return bio
  
  // Truncate at word boundary
  const truncated = bio.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * Determines if contact info should be gated based on booking status
 * @param hasConfirmedBooking - Whether user has a confirmed booking with this caregiver
 * @param isLoggedIn - Whether user is logged in
 */
export function shouldGateContact(hasConfirmedBooking: boolean, isLoggedIn: boolean): boolean {
  // No gating needed if user has confirmed booking
  if (hasConfirmedBooking) return false
  
  // Gate contact for non-logged-in or users without bookings
  return true
}

/**
 * Gets appropriate gating message based on user state
 */
export function getGatingMessage(isLoggedIn: boolean): {
  title: string
  description: string
  action: string
  actionLink: string
} {
  if (!isLoggedIn) {
    return {
      title: 'Inloggen voor volledig profiel',
      description: 'Log in of registreer om de volledige naam, contactgegevens en alle foto\'s te zien.',
      action: 'Inloggen',
      actionLink: '/auth/signin'
    }
  }
  
  return {
    title: 'Boek om volledige informatie te zien',
    description: 'Na een bevestigde boeking krijg je toegang tot de volledige naam, telefoonnummer en alle foto\'s van deze verzorger.',
    action: 'Boek nu',
    actionLink: '#booking-form'
  }
}




