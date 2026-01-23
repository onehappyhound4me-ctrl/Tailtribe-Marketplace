import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers

// Force node runtime (bcrypt incompatible with Edge)
export const runtime = 'nodejs'
