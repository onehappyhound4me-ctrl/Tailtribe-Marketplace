import { z } from 'zod'
import { Role, BookingStatus } from '@/lib/types'

export const approveCaregiverSchema = z.object({
  caregiverId: z.string().cuid('Ongeldig caregiver ID'),
  approved: z.boolean(),
  reason: z.string()
    .min(10, 'Reden moet minimaal 10 karakters bevatten')
    .max(500, 'Reden mag maximaal 500 karakters bevatten')
    .optional(),
})

export const suspendUserSchema = z.object({
  userId: z.string().cuid('Ongeldig user ID'),
  suspended: z.boolean(),
  reason: z.string()
    .min(10, 'Reden moet minimaal 10 karakters bevatten')
    .max(500, 'Reden mag maximaal 500 karakters bevatten'),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid('Ongeldig user ID'),
  role: z.nativeEnum(Role),
})

export const refundBookingSchema = z.object({
  bookingId: z.string().cuid('Ongeldig booking ID'),
  amount: z.number()
    .min(0, 'Bedrag moet positief zijn')
    .optional(), // If not provided, refunds full amount
  reason: z.string()
    .min(10, 'Reden moet minimaal 10 karakters bevatten')
    .max(500, 'Reden mag maximaal 500 karakters bevatten'),
})

export const adminSearchUsersSchema = z.object({
  query: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  suspended: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const adminSearchBookingsSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'startAt', 'amountCents']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const adminStatsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
})

export type ApproveCaregiverInput = z.infer<typeof approveCaregiverSchema>
export type SuspendUserInput = z.infer<typeof suspendUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type RefundBookingInput = z.infer<typeof refundBookingSchema>
export type AdminSearchUsersInput = z.infer<typeof adminSearchUsersSchema>
export type AdminSearchBookingsInput = z.infer<typeof adminSearchBookingsSchema>
export type AdminStatsInput = z.infer<typeof adminStatsSchema>




