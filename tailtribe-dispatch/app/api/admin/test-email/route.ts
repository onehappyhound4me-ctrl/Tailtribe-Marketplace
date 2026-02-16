import { NextRequest, NextResponse } from 'next/server'
import { sendTransactionalEmail } from '@/lib/mailer'

function adminNotificationEmail() {
  const fromDispatch = String(process.env.DISPATCH_ADMIN_EMAIL ?? '').trim()
  if (fromDispatch) return fromDispatch
  const fromAdminLogin = String(process.env.ADMIN_LOGIN_EMAIL ?? '').trim()
  if (fromAdminLogin) return fromAdminLogin
  return 'steven@tailtribe.be'
}

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return (m?.[1] ?? '').trim()
}

export async function POST(req: NextRequest) {
  // Reuse existing protected admin key if present.
  const key = String(process.env.RESET_PASSWORD_ADMIN_KEY ?? '').trim()
  if (!key) {
    // Hide endpoint if not configured.
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const token = getBearerToken(req)
  if (!token || token !== key) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // ok
  }

  const to = String(body?.to ?? adminNotificationEmail()).trim()
  const subject = String(body?.subject ?? 'TailTribe test email').trim()

  const now = new Date().toISOString()
  const html = String(body?.html ?? '').trim() || `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px 0;">Testmail TailTribe</h2>
      <p style="margin: 0 0 12px 0;">Als je dit leest, werkt e-mail verzending vanaf TailTribe.</p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
        <p style="margin:0;"><strong>Tijd:</strong> ${now}</p>
      </div>
    </div>
  `

  const text = String(body?.text ?? '').trim() || `Testmail TailTribe. Tijd: ${now}`

  try {
    await sendTransactionalEmail({
      to,
      subject,
      html,
      text,
      meta: { kind: 'admin-test-email' },
      required: true,
    })
    return NextResponse.json({ ok: true, to }, { status: 200 })
  } catch (e: any) {
    const detail = String(e?.message ?? e ?? '').slice(0, 500)
    return NextResponse.json({ ok: false, error: 'EMAIL_SEND_FAILED', detail }, { status: 500 })
  }
}

