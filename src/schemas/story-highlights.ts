import { z } from 'zod'
import { VideoPlatform } from '@/lib/types'

// Video URL validation patterns
const YOUTUBE_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
const VIMEO_REGEX = /^https?:\/\/(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/

export const createHighlightSchema = z.object({
  videoUrl: z.string()
    .url('Ongeldige URL')
    .refine((url) => YOUTUBE_REGEX.test(url) || VIMEO_REGEX.test(url), {
      message: 'Alleen YouTube en Vimeo links zijn toegestaan'
    }),
  title: z.string()
    .max(100, 'Titel mag maximaal 100 karakters bevatten')
    .optional(),
  transcript: z.string()
    .max(2000, 'Transcript mag maximaal 2000 karakters bevatten')
    .optional(),
  expiresInDays: z.number()
    .min(1, 'Minimaal 1 dag')
    .max(30, 'Maximaal 30 dagen')
    .default(14),
})

export const updateHighlightSchema = z.object({
  id: z.string().cuid('Ongeldig highlight ID'),
  title: z.string()
    .max(100, 'Titel mag maximaal 100 karakters bevatten')
    .optional(),
  transcript: z.string()
    .max(2000, 'Transcript mag maximaal 2000 karakters bevatten')
    .optional(),
  published: z.boolean().optional(),
})

export const deleteHighlightSchema = z.object({
  id: z.string().cuid('Ongeldig highlight ID'),
})

// Helper function to extract platform and video ID from URL
export function parseVideoUrl(url: string): { platform: VideoPlatform; videoId: string } | null {
  // YouTube patterns
  const youtubeMatch = url.match(YOUTUBE_REGEX)
  if (youtubeMatch) {
    return {
      platform: VideoPlatform.YOUTUBE,
      videoId: youtubeMatch[3]
    }
  }

  // Vimeo patterns
  const vimeoMatch = url.match(VIMEO_REGEX)
  if (vimeoMatch) {
    return {
      platform: VideoPlatform.VIMEO,
      videoId: vimeoMatch[3]
    }
  }

  return null
}

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>
export type UpdateHighlightInput = z.infer<typeof updateHighlightSchema>
export type DeleteHighlightInput = z.infer<typeof deleteHighlightSchema>




