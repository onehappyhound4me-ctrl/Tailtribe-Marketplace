import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres').min(1, 'E-mailadres is verplicht'),
})

export const onboardingSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten'),
  role: z.enum(['OWNER', 'CAREGIVER'], {
    required_error: 'Selecteer een rol',
  }),
})

export const caregiverOnboardingSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten'),
  city: z.string().min(2, 'Stad is verplicht'),
  services: z.array(z.enum(['DOG_WALKING', 'PET_SITTING', 'TRAINING', 'TRANSPORT']))
    .min(1, 'Selecteer minimaal één service'),
  hourlyRate: z.number().min(5, 'Tarief moet minimaal €5 per uur zijn').max(800, 'Tarief mag maximaal €800 per uur zijn'),
  bio: z.string().min(80, 'Beschrijving moet minimaal 80 karakters bevatten').max(500, 'Beschrijving mag maximaal 500 karakters bevatten'),
  photos: z.array(z.string().url()).optional(),
})

export type SignInInput = z.infer<typeof signInSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
export type CaregiverOnboardingInput = z.infer<typeof caregiverOnboardingSchema>

