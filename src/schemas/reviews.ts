import { z } from 'zod'

export const createReviewSchema = z.object({
  caregiverId: z.string().cuid('Ongeldig caregiver ID'),
  bookingId: z.string().cuid('Ongeldig booking ID').optional(),
  rating: z.number()
    .min(1, 'Beoordeling moet minimaal 1 ster zijn')
    .max(5, 'Beoordeling mag maximaal 5 sterren zijn')
    .int('Beoordeling moet een heel getal zijn'),
  comment: z.string()
    .min(10, 'Opmerking moet minimaal 10 karakters bevatten')
    .max(200, 'Opmerking mag maximaal 200 karakters bevatten')
    .trim()
    .optional(),
})

export const updateReviewSchema = z.object({
  id: z.string().cuid('Ongeldig review ID'),
  rating: z.number()
    .min(1, 'Beoordeling moet minimaal 1 ster zijn')
    .max(5, 'Beoordeling mag maximaal 5 sterren zijn')
    .int('Beoordeling moet een heel getal zijn')
    .optional(),
  comment: z.string()
    .min(10, 'Opmerking moet minimaal 10 karakters bevatten')
    .max(1000, 'Opmerking mag maximaal 1000 karakters bevatten')
    .trim()
    .optional(),
})

export const getReviewsSchema = z.object({
  caregiverId: z.string().cuid('Ongeldig caregiver ID').optional(),
  authorId: z.string().cuid('Ongeldig author ID').optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const deleteReviewSchema = z.object({
  id: z.string().cuid('Ongeldig review ID'),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type GetReviewsInput = z.infer<typeof getReviewsSchema>
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>





