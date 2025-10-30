// Since we're using SQLite, we need to define the enum types manually
export type Role = 'OWNER' | 'CAREGIVER' | 'ADMIN'
export type ServiceType = 'DOG_WALKING' | 'GROUP_DOG_WALKING' | 'DOG_TRAINING' | 'PET_SITTING' | 'PET_BOARDING' | 'HOME_CARE' | 'EVENT_COMPANION' | 'PET_TRANSPORT' | 'SMALL_ANIMAL_CARE'
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'PAID' | 'REFUNDED'
export type VideoPlatform = 'YOUTUBE' | 'VIMEO'

// Export as const objects for easier usage
export const Role = {
  OWNER: 'OWNER' as const,
  CAREGIVER: 'CAREGIVER' as const,
  ADMIN: 'ADMIN' as const
}

export const ServiceType = {
  DOG_WALKING: 'DOG_WALKING' as const,
  GROUP_DOG_WALKING: 'GROUP_DOG_WALKING' as const,
  DOG_TRAINING: 'DOG_TRAINING' as const,
  PET_SITTING: 'PET_SITTING' as const,
  PET_BOARDING: 'PET_BOARDING' as const,
  HOME_CARE: 'HOME_CARE' as const,
  EVENT_COMPANION: 'EVENT_COMPANION' as const,
  PET_TRANSPORT: 'PET_TRANSPORT' as const,
  SMALL_ANIMAL_CARE: 'SMALL_ANIMAL_CARE' as const
}

export const BookingStatus = {
  PENDING: 'PENDING' as const,
  ACCEPTED: 'ACCEPTED' as const,
  DECLINED: 'DECLINED' as const,
  PAID: 'PAID' as const,
  REFUNDED: 'REFUNDED' as const
}

export const VideoPlatform = {
  YOUTUBE: 'YOUTUBE' as const,
  VIMEO: 'VIMEO' as const
}

// Service type labels for UI
export const serviceLabels: Record<ServiceType, string> = {
  'DOG_WALKING': 'Hondenuitlaat',
  'GROUP_DOG_WALKING': 'Groepsuitlaat voor honden',
  'DOG_TRAINING': 'Hondentraining',
  'PET_SITTING': 'Dierenoppas',
  'PET_BOARDING': 'Dierenopvang',
  'HOME_CARE': 'Verzorging aan huis',
  'EVENT_COMPANION': 'Begeleiding events (bruiloft)',
  'PET_TRANSPORT': 'Transport huisdieren',
  'SMALL_ANIMAL_CARE': 'Verzorging kleinvee'
}

// Booking status labels for UI
export const bookingStatusLabels: Record<BookingStatus, string> = {
  'PENDING': 'In afwachting',
  'ACCEPTED': 'Geaccepteerd',
  'DECLINED': 'Afgewezen',
  'PAID': 'Betaald',
  'REFUNDED': 'Terugbetaald'
}
