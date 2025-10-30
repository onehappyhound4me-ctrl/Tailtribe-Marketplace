import { z } from 'zod'

export const caregiverProfileSchema = z.object({
  // Basic info
  fullName: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(80, 'Naam mag maximaal 80 karakters bevatten').optional(),
  phone: z.string().regex(/^[\d\s\+\-()]+$/, 'Ongeldig telefoonnummer').optional().or(z.literal('')),
  city: z.string().min(1, 'Stad is verplicht').max(100),
  postalCode: z.string().max(20).optional(),
  bio: z.string().max(600, 'Bio mag maximaal 600 karakters bevatten').optional(),
  
  // Services
  services: z.array(z.string()).min(1, 'Selecteer minimaal één dienst'),
  
  // Pricing
  hourlyRate: z.number().int().min(1, 'Uurtarief moet minimaal €1 zijn').max(500, 'Uurtarief mag maximaal €500 zijn'),
  
  // Certificates
  certificates: z.array(z.string()).optional(),
  
  // Profile photo
  profilePhoto: z.string().optional(),
  
  // Additional fields
  animalTypes: z.array(z.string()).optional(),
  customAnimalTypes: z.string().optional(),
  animalSizes: z.array(z.string()).optional(),
  maxAnimalsAtOnce: z.number().int().min(1).max(20).optional(),
  actionRadius: z.number().int().min(1).max(100).optional(),
  
  // Stripe info (read-only)
  stripeAccountId: z.string().optional(),
  stripeOnboarded: z.boolean().optional(),
  
  // Approval status (read-only)
  isApproved: z.boolean().optional(),
  
  // Financial info
  iban: z.string().optional().or(z.literal('')),
  accountHolder: z.string().optional().or(z.literal('')),
  vatNumber: z.string().optional().or(z.literal('')),
  businessNumber: z.string().optional().or(z.literal('')),
  
  // Service prices
  servicePrices: z.record(z.string(), z.string()).optional(),
})

export type CaregiverProfileInput = z.infer<typeof caregiverProfileSchema>
