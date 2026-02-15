import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function normalizeEmail(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function maskEmail(email: string) {
  const e = String(email || '').trim()
  const [user, domain] = e.split('@')
  if (!user || !domain) return 'invalid-email'
  const u = user.length <= 2 ? `${user[0] ?? ''}*` : `${user.slice(0, 2)}***`
  const dParts = domain.split('.')
  const d0 = dParts[0] ?? ''
  const dMasked = d0 ? `${d0[0]}***` : '***'
  const rest = dParts.slice(1).join('.')
  return `${u}@${dMasked}${rest ? `.${rest}` : ''}`
}

export async function POST(req: NextRequest) {
  const adminKey = String(process.env.RESET_PASSWORD_ADMIN_KEY ?? '').trim()
  // If not configured, pretend it doesn't exist (avoid exposing attack surface).
  if (!adminKey) return new NextResponse('Not found', { status: 404 })

  const auth = String(req.headers.get('authorization') ?? '').trim()
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  if (!token || token !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requestId =
    (crypto as any).randomUUID?.() ?? crypto.randomBytes(8).toString('hex')
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`admin-reset-password:${ip}`, 10, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Te veel pogingen. Probeer later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const email = normalizeEmail(body?.email)
  const newPassword = String(body?.newPassword ?? '')

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Missing email.' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  console.log(
    JSON.stringify({
      event: 'admin.reset_password.request',
      requestId,
      email: maskEmail(email),
    })
  )

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null)
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: new Date(),
      },
    })
    await tx.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    })
  })

  return new NextResponse(null, { status: 204 })
}

