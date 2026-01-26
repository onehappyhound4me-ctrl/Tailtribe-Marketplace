import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error(
    '[env] DATABASE_URL ontbreekt. Zet DATABASE_URL in Vercel Environment Variables (Production) en redeploy.'
  )
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
