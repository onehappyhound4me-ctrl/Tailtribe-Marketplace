// Date formatting utilities
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('nl-BE', options || {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('nl-BE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Price formatting
export function formatPrice(cents: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function formatPriceSimple(amount: number) {
  return `€${amount.toFixed(2).replace('.', ',')}`
}

// Duration calculations
export function calculateHours(startAt: Date | string, endAt: Date | string) {
  const start = typeof startAt === 'string' ? new Date(startAt) : startAt
  const end = typeof endAt === 'string' ? new Date(endAt) : endAt
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
}

// Exact hours calculation for pricing (includes partial hours)
export function calculateExactHours(startAt: Date | string, endAt: Date | string) {
  const start = typeof startAt === 'string' ? new Date(startAt) : startAt
  const end = typeof endAt === 'string' ? new Date(endAt) : endAt
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

export function calculateDays(startAt: Date | string, endAt: Date | string) {
  const hours = calculateHours(startAt, endAt)
  return Math.ceil(hours / 24)
}

// Service labels in Dutch
export const serviceLabelsNL: Record<string, string> = {
  DOG_WALKING: 'Hondenuitlaat',
  GROUP_DOG_WALKING: 'Groepsuitlaat',
  DOG_TRAINING: 'Hondentraining',
  PET_SITTING: 'Dierenoppas',
  PET_BOARDING: 'Dierenopvang',
  HOME_CARE: 'Verzorging aan huis',
  PET_TRANSPORT: 'Transport huisdieren',
  SMALL_ANIMAL_CARE: 'Verzorging kleinvee',
  EVENT_COMPANION: 'Begeleiding events',
}

// Status labels
export const statusLabelsNL: Record<string, string> = {
  PENDING: 'In afwachting',
  ACCEPTED: 'Geaccepteerd',
  DECLINED: 'Afgewezen',
  PAID: 'Betaald',
  COMPLETED: 'Voltooid',
  CANCELLED: 'Geannuleerd',
  REFUNDED: 'Terugbetaald',
}

// Truncate text
export function truncate(text: string, length: number = 100) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}




