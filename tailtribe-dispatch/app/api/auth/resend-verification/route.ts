import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'

export const runtime = 'nodejs'

function normalizeEmail(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`resend-verify:${ip}`, 5, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Te veel aanvragen. Probeer later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const email = normalizeEmail(body?.email)
  if (!email) {
    return NextResponse.json({ error: 'Vul je e-mailadres in.' }, { status: 400 })
  }

  const emailConfigured =
    Boolean((process.env.RESEND_API_KEY ?? '').trim()) ||
    (Boolean(process.env.SMTP_HOST) && Boolean(process.env.SMTP_USER))
  if (!emailConfigured) {
    return NextResponse.json(
      { error: 'E-mail verzending is niet geconfigureerd. Probeer later opnieuw.' },
      { status: 500 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email } }).catch(() => null)
  // Don’t leak whether an email exists.
  const okMsg = 'Als je account bestaat, is de verificatie e-mail opnieuw verstuurd. Controleer ook je spam.'
  if (!user) return NextResponse.json({ success: true, message: okMsg })

  if (user.emailVerified) {
    return NextResponse.json({ success: true, message: 'Je e-mail is al geverifieerd. Je kan nu inloggen.' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  // Replace any existing verification tokens for this email.
  await prisma.verificationToken
    .deleteMany({
      where: { identifier: email, userId: user.id },
    })
    .catch(() => null)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      userId: user.id,
    },
  })

  try {
    await sendVerificationEmail(email, token)
  } catch (emailError) {
    const detail =
      emailError instanceof Error
        ? emailError.message
        : typeof emailError === 'string'
          ? emailError
          : (() => {
              try {
                return JSON.stringify(emailError)
              } catch {
                return String(emailError)
              }
            })()
    return NextResponse.json(
      {
        error: 'Kon geen verificatiemail versturen. (code: EMAIL_SEND_FAILED)',
        detail: String(detail).slice(0, 300),
        hint: 'Controleer RESEND_API_KEY en DISPATCH_EMAIL_FROM (verified sender/domain).',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, message: okMsg })
}

