import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendTransactionalEmail } from '@/lib/mailer'

function normalizeEmail(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`forgot-password:${ip}`, 5, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Te veel aanvragen. Probeer later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const email = normalizeEmail(body?.email)
  if (!email) {
    return NextResponse.json({ error: 'Vul je e-mailadres in.' }, { status: 400 })
  }

  // Don’t leak whether an email exists.
  const genericOk = NextResponse.json({
    success: true,
    message: 'Als dit e-mailadres bestaat, sturen we een reset-link. Controleer ook je spam.',
  })

  const user = await prisma.user.findUnique({ where: { email } }).catch(() => null)
  if (!user) return genericOk

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1h

  // Keep only a few active reset tokens per user.
  await prisma.verificationToken.deleteMany({
    where: {
      userId: user.id,
      identifier: `reset:${email}`,
    },
  }).catch(() => null)

  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
      userId: user.id,
    },
  })

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://tailtribe.be'
  const resetUrl = `${baseUrl}/forgot-password?token=${token}`

  const emailConfigured =
    Boolean((process.env.RESEND_API_KEY ?? '').trim()) ||
    (Boolean(process.env.SMTP_HOST) && Boolean(process.env.SMTP_USER))

  if (!emailConfigured) {
    // Still return OK (don’t leak). But provide a better message for real users.
    return NextResponse.json({
      success: true,
      message:
        'Reset link kon niet automatisch verstuurd worden (e-mail niet geconfigureerd). Contacteer ons via /contact en vermeld je e-mailadres.',
    })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Wachtwoord resetten</h1>
      <p>Klik op de knop hieronder om je wachtwoord te resetten:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}"
           style="background: linear-gradient(to right, #10b981, #3b82f6);
                  color: white;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 25px;
                  font-weight: bold;
                  display: inline-block;">
          Reset wachtwoord
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Of kopieer deze link in je browser:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Deze link is 1 uur geldig. Als je dit niet hebt aangevraagd, negeer deze e-mail.
      </p>
    </div>
  `

  await sendTransactionalEmail({
    to: email,
    subject: 'Reset je TailTribe wachtwoord',
    html,
  }).catch(() => {
    // Keep response stable; user can still contact support.
  })

  return genericOk
}

