import { z } from 'zod'
import { ServiceType } from '@/lib/types'

export const createBookingSchema = z.object({
  caregiverId: z.string().cuid('Ongeldig caregiver ID'),
  listingId: z.string().cuid('Ongeldig listing ID').optional(),
  startAt: z.string().datetime('Ongeldige startdatum'),
  endAt: z.string().datetime('Ongeldige einddatum'),
  serviceType: z.nativeEnum(ServiceType, {
    required_error: 'Service type is verplicht',
  }),
  message: z.string().min(10, 'Bericht moet minimaal 10 karakters bevatten').max(500, 'Bericht mag maximaal 500 karakters bevatten').optional(),
}).refine((data) => {
  const start = new Date(data.startAt)
  const end = new Date(data.endAt)
  const now = new Date()
  
  return start > now && end > start
}, {
  message: 'Einddatum moet na startdatum liggen en in de toekomst zijn',
  path: ['endAt']
})

export const acceptBookingSchema = z.object({
  bookingId: z.string().cuid('Ongeldig booking ID'),
  message: z.string().max(500, 'Bericht mag maximaal 500 karakters bevatten').optional(),
})

export const declineBookingSchema = z.object({
  bookingId: z.string().cuid('Ongeldig booking ID'),
  reason: z.string().min(10, 'Reden moet minimaal 10 karakters bevatten').max(300, 'Reden mag maximaal 300 karakters bevatten'),
})

export const searchBookingsSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'PAID', 'REFUNDED']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>
export type DeclineBookingInput = z.infer<typeof declineBookingSchema>
export type SearchBookingsInput = z.infer<typeof searchBookingsSchema>

