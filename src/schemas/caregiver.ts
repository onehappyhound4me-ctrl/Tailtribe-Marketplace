import { z } from 'zod'
import { ServiceType } from '@/lib/types'

export const searchCaregiversSchema = z.object({
  city: z.string().optional(),
  services: z.array(z.nativeEnum(ServiceType)).optional(),
  minRate: z.number().min(0).optional(),
  maxRate: z.number().min(0).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radius: z.number().min(1).max(50).default(10), // km
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sortBy: z.enum(['rating', 'price', 'distance']).default('rating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const updateCaregiverProfileSchema = z.object({
  city: z.string().min(2, 'Stad is verplicht').optional(),
  services: z.array(z.nativeEnum(ServiceType))
    .min(1, 'Selecteer minimaal één service').optional(),
  hourlyRate: z.number()
    .min(5, 'Tarief moet minimaal €5 per uur zijn')
    .max(100, 'Tarief mag maximaal €100 per uur zijn').optional(),
  bio: z.string()
    .min(50, 'Beschrijving moet minimaal 50 karakters bevatten')
    .max(500, 'Beschrijving mag maximaal 500 karakters bevatten').optional(),
  photos: z.array(z.string().url()).max(6, 'Maximaal 6 foto\'s toegestaan').optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
})

export const createListingSchema = z.object({
  title: z.string().min(5, 'Titel moet minimaal 5 karakters bevatten').max(100, 'Titel mag maximaal 100 karakters bevatten'),
  description: z.string().min(20, 'Beschrijving moet minimaal 20 karakters bevatten').max(1000, 'Beschrijving mag maximaal 1000 karakters bevatten'),
  minRate: z.number().min(5, 'Minimumtarief moet minimaal €5 per uur zijn').max(100, 'Minimumtarief mag maximaal €100 per uur zijn'),
  photos: z.array(z.string().url()).max(8, 'Maximaal 8 foto\'s toegestaan').optional(),
})

export const updateListingSchema = createListingSchema.extend({
  id: z.string().cuid('Ongeldig listing ID'),
  active: z.boolean().optional(),
}).partial().required({ id: true })

export const availabilitySchema = z.object({
  weeklyJson: z.record(z.string(), z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ongeldige tijd format (HH:MM)'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ongeldige tijd format (HH:MM)'),
  }))),
  exceptions: z.record(z.string().datetime(), z.object({
    available: z.boolean(),
    slots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ongeldige tijd format (HH:MM)'),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ongeldige tijd format (HH:MM)'),
    })).optional(),
  })).optional(),
})

export type SearchCaregiversInput = z.infer<typeof searchCaregiversSchema>
export type UpdateCaregiverProfileInput = z.infer<typeof updateCaregiverProfileSchema>
export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>

