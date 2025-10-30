import { z } from 'zod'

export const sendMessageSchema = z.object({
  bookingId: z.string().cuid('Ongeldig booking ID'),
  body: z.string()
    .min(1, 'Bericht mag niet leeg zijn')
    .max(1000, 'Bericht mag maximaal 1000 karakters bevatten')
    .trim(),
})

export const getMessagesSchema = z.object({
  bookingId: z.string().cuid('Ongeldig booking ID'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  before: z.string().datetime().optional(), // For pagination
})

export const markMessagesReadSchema = z.object({
  bookingId: z.string().cuid('Ongeldig booking ID'),
  messageIds: z.array(z.string().cuid()).optional(), // If not provided, marks all unread messages as read
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type GetMessagesInput = z.infer<typeof getMessagesSchema>
export type MarkMessagesReadInput = z.infer<typeof markMessagesReadSchema>





