import nodemailer from 'nodemailer'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendTransactionalEmail({ to, subject, html, replyTo }: SendEmailInput) {
  const from = process.env.DISPATCH_EMAIL_FROM ?? 'TailTribe <noreply@tailtribe.be>'
  const finalReplyTo = replyTo ?? process.env.DISPATCH_EMAIL_REPLY_TO
  const resendKey = (process.env.RESEND_API_KEY ?? '').trim()

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          ...(finalReplyTo ? { reply_to: finalReplyTo } : {}),
        }),
        cache: 'no-store',
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        console.error('Resend email failed:', res.status, msg)
      }
      return
    } catch (error) {
      console.error('Resend email failed:', error)
      return
    }
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('📧 Email not configured:', { to, subject })
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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || from,
    to,
    subject,
    html,
    ...(finalReplyTo ? { replyTo: finalReplyTo } : {}),
  })
}
