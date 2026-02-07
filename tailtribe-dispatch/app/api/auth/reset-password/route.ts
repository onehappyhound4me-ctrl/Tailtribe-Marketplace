import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`reset-password:${ip}`, 10, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Te veel pogingen. Probeer later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const token = String(body?.token ?? '').trim()
  const newPassword = String(body?.newPassword ?? '')

  if (!token) {
    return NextResponse.json({ error: 'Ongeldige reset link. Vraag een nieuwe aan.' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Wachtwoord moet minimaal 6 karakters lang zijn.' }, { status: 400 })
  }

  // IMPORTANT: some prod databases may not have `verificationToken.userId` (schema drift).
  // So we only select fields we need and derive the target user from `identifier=reset:<email>`.
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    select: { identifier: true, expires: true },
  }).catch(() => null)

  if (!record || record.expires < new Date() || !record.identifier.startsWith('reset:')) {
    return NextResponse.json({ error: 'Reset link is verlopen of ongeldig. Vraag een nieuwe aan.' }, { status: 400 })
  }

  const email = record.identifier.replace(/^reset:/, '').trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Reset link is ongeldig. Vraag een nieuwe aan.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null)
  if (!user) {
    return NextResponse.json({ error: 'Reset link is ongeldig. Vraag een nieuwe aan.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        // Ensure credentials login works immediately even if email verification was flaky.
        emailVerified: new Date(),
      },
    })
    await tx.verificationToken.delete({ where: { token } })
  })

  return NextResponse.json({ success: true })
}

