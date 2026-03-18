import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function pick(name: string) {
  const v = String(process.env[name] ?? '').trim()
  return v ? v : null
}

function mask(value: string | null) {
  if (!value) return null
  if (value.length <= 6) return '***'
  return `${value.slice(0, 2)}***${value.slice(-2)}`
}

export async function GET() {
  const resendKey = pick('RESEND_API_KEY')
  const smtpHost = pick('SMTP_HOST')
  const smtpUser = pick('SMTP_USER')
  const smtpPass = pick('SMTP_PASS')

  const configured = Boolean(resendKey || (smtpHost && smtpUser))

  const last = (globalThis as any).__tt_last_email_status ?? null

  return NextResponse.json(
    {
      configured,
      provider: resendKey ? 'resend' : smtpHost && smtpUser ? 'smtp' : 'none',
      from: pick('DISPATCH_EMAIL_FROM'),
      adminEmail: pick('DISPATCH_ADMIN_EMAIL'),
      resendKeyPresent: Boolean(resendKey),
      smtp: {
        host: smtpHost,
        userMasked: mask(smtpUser),
        passPresent: Boolean(smtpPass),
      },
      lastEmailStatus: last,
      now: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}

