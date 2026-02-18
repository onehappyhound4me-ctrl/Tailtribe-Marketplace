import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function missingDatabaseUrlPrisma(): PrismaClient {
  // Avoid crashing builds (e.g. Vercel Preview without env vars).
  // We only throw when code actually tries to use Prisma.
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error(
        '[env] DATABASE_URL ontbreekt. Zet DATABASE_URL in Vercel Environment Variables (Production) en redeploy.'
      )
    },
  })
}

export const prisma =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL ? new PrismaClient() : missingDatabaseUrlPrisma())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
