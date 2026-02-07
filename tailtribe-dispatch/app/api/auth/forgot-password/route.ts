import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendTransactionalEmail } from '@/lib/mailer'
import { getPublicAppUrl } from '@/lib/env'

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

function serializeError(err: unknown) {
  const e = err as any
  return {
    name: e?.name,
    message: e?.message,
    stack: e?.stack,
    code: e?.code,
    status: e?.status,
    response: e?.response,
    cause: e?.cause,
  }
}

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const requestId =
    (crypto as any).randomUUID?.() ?? crypto.randomBytes(8).toString('hex')
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`forgot-password:${ip}`, 5, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Te veel aanvragen. Probeer later opnieuw.' }, { status: 429 })
  }

  const emailConfigured =
    Boolean((process.env.RESEND_API_KEY ?? '').trim()) ||
    (Boolean(process.env.SMTP_HOST) && Boolean(process.env.SMTP_USER))

  const body = await req.json().catch(() => ({}))
  const email = normalizeEmail(body?.email)
  if (!email) {
    return NextResponse.json({ error: 'Vul je e-mailadres in.' }, { status: 400 })
  }

  console.log(
    JSON.stringify({
      event: 'auth.forgot_password.request',
      requestId,
      email: maskEmail(email),
      emailConfigured,
    })
  )

  // Don’t leak whether an email exists.
  const genericOk = NextResponse.json({
    success: true,
    message: 'Als dit e-mailadres bestaat, sturen we een reset-link. Controleer ook je spam.',
    emailConfigured,
  })

  // If email delivery isn't configured, tell the user (still doesn't leak if the email exists).
  if (!emailConfigured) {
    return NextResponse.json({
      success: true,
      message:
        'Reset link kon niet automatisch verstuurd worden (e-mail niet geconfigureerd). Contacteer ons via /contact en vermeld je e-mailadres.',
      emailConfigured: false,
    })
  }

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

  const baseUrl = getPublicAppUrl()
  const resetUrl = new URL(`/forgot-password?token=${encodeURIComponent(token)}`, baseUrl).toString()
  const displayUrl = new URL('/forgot-password', baseUrl).toString()

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
        Werkt de knop niet? Open dan TailTribe en reset je wachtwoord via:<br>
        <a href="${resetUrl}">${displayUrl}</a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Deze link is 1 uur geldig. Als je dit niet hebt aangevraagd, negeer deze e-mail.
      </p>
    </div>
  `

  await sendTransactionalEmail({
    to: email,
    subject: 'Wachtwoord resetten - TailTribe',
    html,
  }).catch((err) => {
    console.error(
      JSON.stringify({
        event: 'auth.forgot_password.email_failed',
        requestId,
        email: maskEmail(email),
        error: serializeError(err),
      })
    )
  })

  return genericOk
}

