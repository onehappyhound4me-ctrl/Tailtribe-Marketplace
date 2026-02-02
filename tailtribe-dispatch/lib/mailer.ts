import nodemailer from 'nodemailer'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  headers?: Record<string, string>
  /**
   * Optional metadata for server-side logging/debugging (NOT sent to the provider).
   * Example: { kind: 'verify-email', url: 'https://...' }
   */
  meta?: Record<string, string>
  /**
   * If true, throw on any send failure (used for critical flows like email verification).
   * If false/omitted, log and return (best-effort).
   */
  required?: boolean
}

function maskEmail(email: string) {
  const clean = String(email || '').trim()
  const at = clean.indexOf('@')
  if (at <= 1) return clean ? '***' : ''
  const name = clean.slice(0, at)
  const domain = clean.slice(at + 1)
  const nameMasked = `${name[0]}***`
  const domainParts = domain.split('.')
  const domainMasked =
    domainParts.length >= 2 ? `${domainParts[0]?.[0] ?? ''}***.${domainParts.slice(1).join('.')}` : `${domain[0] ?? ''}***`
  return `${nameMasked}@${domainMasked}`
}

function extractEmailAddress(from: string) {
  // Supports "Name <email@domain>" and "email@domain"
  const m = String(from || '').match(/<([^>]+)>/)
  return (m?.[1] ?? from ?? '').trim()
}

function isFreeMailboxDomain(email: string) {
  const domain = (email.split('@')[1] || '').toLowerCase()
  return ['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.be', 'outlook.com', 'hotmail.com', 'live.com'].includes(domain)
}

function randomId() {
  try {
    // Node 18+ supports crypto.randomUUID, but keep fallback safe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyCrypto = (globalThis as any).crypto
    if (anyCrypto?.randomUUID) return anyCrypto.randomUUID()
  } catch {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function assertEmailConfig({ required, resendKey, smtpHost, smtpUser, smtpPass }: { required?: boolean; resendKey: string; smtpHost?: string; smtpUser?: string; smtpPass?: string }) {
  if (!required) return
  const hasResend = Boolean(resendKey)
  const hasSmtp = Boolean(smtpHost && smtpUser)
  if (!hasResend && !hasSmtp) {
    throw new Error('Email not configured: missing RESEND_API_KEY or SMTP_HOST/SMTP_USER (code: EMAIL_NOT_CONFIGURED)')
  }
  if (hasSmtp && !smtpPass) {
    throw new Error('Email not configured: missing SMTP_PASS (code: EMAIL_SMTP_PASS_MISSING)')
  }
}

export async function sendTransactionalEmail({ to, subject, html, text, replyTo, headers, meta, required }: SendEmailInput) {
  const from = process.env.DISPATCH_EMAIL_FROM ?? 'TailTribe <noreply@tailtribe.be>'
  const finalReplyTo = replyTo ?? process.env.DISPATCH_EMAIL_REPLY_TO
  const resendKey = (process.env.RESEND_API_KEY ?? '').trim()
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  assertEmailConfig({ required, resendKey, smtpHost, smtpUser, smtpPass })

  const requestId = meta?.requestId || randomId()
  const toMasked = maskEmail(to)
  const fromEmail = extractEmailAddress(from)
  const baseLog = {
    event: 'email.send',
    requestId,
    to: toMasked,
    subject,
    required: Boolean(required),
    meta: meta ?? undefined,
  }

  if (resendKey) {
    if (isFreeMailboxDomain(fromEmail)) {
      // Provider-specific best practice: never send transactional email from a free mailbox.
      const msg = `Bad sender domain for transactional email: "${fromEmail}". Use a verified domain sender (code: EMAIL_FROM_INVALID).`
      console.error(JSON.stringify({ ...baseLog, level: 'error', provider: 'resend', message: msg }))
      if (required) throw new Error(msg)
    }

    const sendViaResend = async (fromOverride: string) => {
      console.log(
        JSON.stringify({
          ...baseLog,
          level: 'info',
          provider: 'resend',
          from: fromOverride,
          replyTo: finalReplyTo || undefined,
          hasText: Boolean(text),
        })
      )
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromOverride,
          to,
          subject,
          html,
          ...(text ? { text } : {}),
          ...(finalReplyTo ? { reply_to: finalReplyTo } : {}),
          ...(headers ? { headers } : {}),
        }),
        cache: 'no-store',
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error(
          JSON.stringify({
            ...baseLog,
            level: 'error',
            provider: 'resend',
            from: fromOverride,
            status: res.status,
            response: body.slice(0, 2000),
          })
        )
        throw new Error(`Resend email failed (${res.status}) from="${fromOverride}": ${body}`.slice(0, 2000))
      }
      console.log(JSON.stringify({ ...baseLog, level: 'info', provider: 'resend', from: fromOverride, status: res.status, ok: true }))
    }

    try {
      await sendViaResend(from)
      return
    } catch (error) {
      console.error('Resend email failed:', error)

      // Safety fallback: if a custom domain sender is not verified, Resend can reject.
      // Retry once with Resend's verified onboarding sender to keep verification emails working.
      const fallbackFrom = 'TailTribe <onboarding@resend.dev>'
      if (from !== fallbackFrom) {
        try {
          console.log(JSON.stringify({ ...baseLog, level: 'warn', provider: 'resend', message: 'Retrying with Resend fallback sender.' }))
          await sendViaResend(fallbackFrom)
          return
        } catch (fallbackError) {
          console.error('Resend fallback sender failed:', fallbackError)
        }
      }

      if (required) throw error
      return
    }
  }

  if (!smtpHost || !smtpUser) {
    console.log('📧 Email not configured:', { to, subject })
    if (required) {
      throw new Error('Email not configured (missing RESEND_API_KEY or SMTP_HOST/SMTP_USER)')
    }
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    console.log(
      JSON.stringify({
        ...baseLog,
        level: 'info',
        provider: 'smtp',
        host: smtpHost,
        from: process.env.SMTP_FROM || from,
        replyTo: finalReplyTo || undefined,
        hasText: Boolean(text),
      })
    )
    await transporter.sendMail({
      from: process.env.SMTP_FROM || from,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(headers ? { headers } : {}),
      ...(finalReplyTo ? { replyTo: finalReplyTo } : {}),
    })
    console.log(JSON.stringify({ ...baseLog, level: 'info', provider: 'smtp', ok: true }))
  } catch (error) {
    console.error('SMTP email failed:', error)
    if (required) throw error
  }
}
