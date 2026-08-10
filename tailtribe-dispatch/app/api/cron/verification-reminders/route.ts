import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationReminderEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Marker in VerificationToken.identifier zodat elke gebruiker maximaal
// één automatische herinnering krijgt (de verify-route zoekt enkel op token).
const REMINDER_PREFIX = 'reminder:'

const MAX_PER_RUN = 25
const MIN_ACCOUNT_AGE_MS = 24 * 60 * 60 * 1000
const REMINDER_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.DISPATCH_CRON_SECRET
  const provided =
    req.headers.get('x-cron-secret') ??
    (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - MIN_ACCOUNT_AGE_MS)
  const candidates = await prisma.user.findMany({
    where: {
      emailVerified: null,
      createdAt: { lt: cutoff },
      NOT: { email: { endsWith: '@example.com' } },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      verificationTokens: {
        where: { identifier: { startsWith: REMINDER_PREFIX } },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const results: Array<{ email: string; status: string }> = []
  let sent = 0

  for (const user of candidates) {
    if (user.verificationTokens.length > 0) continue // al herinnerd
    if (sent >= MAX_PER_RUN) break

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + REMINDER_TOKEN_TTL_MS)

    try {
      await prisma.verificationToken.create({
        data: {
          identifier: `${REMINDER_PREFIX}${user.email}`,
          token,
          expires,
          userId: user.id,
        },
      })
      await sendVerificationReminderEmail(user.email, user.firstName, token)
      sent++
      results.push({ email: user.email, status: 'sent' })
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      results.push({ email: user.email, status: `error: ${detail}`.slice(0, 200) })
    }
  }

  return NextResponse.json({ success: true, candidates: candidates.length, sent, results })
}
