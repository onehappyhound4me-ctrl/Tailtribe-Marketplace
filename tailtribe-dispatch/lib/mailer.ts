import nodemailer from 'nodemailer'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  replyTo?: string
  /**
   * If true, throw on any send failure (used for critical flows like email verification).
   * If false/omitted, log and return (best-effort).
   */
  required?: boolean
}

export async function sendTransactionalEmail({ to, subject, html, replyTo, required }: SendEmailInput) {
  const from = process.env.DISPATCH_EMAIL_FROM ?? 'TailTribe <noreply@tailtribe.be>'
  const finalReplyTo = replyTo ?? process.env.DISPATCH_EMAIL_REPLY_TO
  const resendKey = (process.env.RESEND_API_KEY ?? '').trim()

  if (resendKey) {
    const sendViaResend = async (fromOverride: string) => {
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
          ...(finalReplyTo ? { reply_to: finalReplyTo } : {}),
        }),
        cache: 'no-store',
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(`Resend email failed (${res.status}) from="${fromOverride}": ${msg}`.slice(0, 2000))
      }
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

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('📧 Email not configured:', { to, subject })
    if (required) {
      throw new Error('Email not configured (missing RESEND_API_KEY or SMTP_HOST/SMTP_USER)')
    }
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || from,
      to,
      subject,
      html,
      ...(finalReplyTo ? { replyTo: finalReplyTo } : {}),
    })
  } catch (error) {
    console.error('SMTP email failed:', error)
    if (required) throw error
  }
}
