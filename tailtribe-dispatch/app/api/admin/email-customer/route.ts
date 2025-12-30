import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'

export const dynamic = 'force-dynamic'

type BookingRecord = {
  id: string
  service: string
  date: string
  time: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  petName: string
  petType: string
  message?: string
  status: string
  assignedTo: string | null
  adminNotes: string
  createdAt: string
  updatedAt: string
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
}

function formatServiceLabel(serviceId: string) {
  return DISPATCH_SERVICES.find((s) => s.id === (serviceId as any))?.name ?? serviceId
}

async function upstashCmd<T = any>(cmd: any[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Upstash not configured')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Upstash error ${res.status}`)
  const data = await res.json()
  return data?.result as T
}

async function getBookingById(id: string): Promise<BookingRecord | null> {
  const raw = await upstashCmd<string | null>(['GET', `tt:booking:${id}`])
  if (!raw) return null
  try {
    return JSON.parse(raw) as BookingRecord
  } catch {
    return null
  }
}

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  const from = process.env.DISPATCH_EMAIL_FROM ?? 'TailTribe <noreply@tailtribe.be>'
  const finalReplyTo = replyTo ?? process.env.DISPATCH_EMAIL_REPLY_TO

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
    throw new Error(`Resend failed: ${res.status} ${msg}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const bookingId = String(body?.bookingId ?? '')
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    // We rely on Upstash for persistence in production.
    const booking = await getBookingById(bookingId)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const appUrl = getAppUrl()
    const serviceLabel = formatServiceLabel(booking.service)

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px 0;">Bevestiging van je aanvraag</h2>
        <p style="margin: 0 0 12px 0;">Hoi ${booking.firstName},</p>
        <p style="margin: 0 0 12px 0;">
          Bedankt voor je aanvraag bij TailTribe. We nemen contact met je op om alles te bevestigen.
        </p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
          <p style="margin:0 0 6px 0;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin:0 0 6px 0;"><strong>Datum/Tijd:</strong> ${booking.date} om ${booking.time}</p>
          <p style="margin:0;"><strong>Locatie:</strong> ${booking.city}, ${booking.postalCode}</p>
        </div>
        <p style="margin:16px 0 0 0;">
          Je kan ons bereiken via <a href="${appUrl}/contact">${appUrl}/contact</a>.
        </p>
        <p style="margin:16px 0 0 0;">
          Met vriendelijke groet,<br/>TailTribe
        </p>
      </div>
    `

    await sendEmail({
      to: booking.email,
      subject: 'Bevestiging van je aanvraag – TailTribe',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to send email' }, { status: 500 })
  }
}


