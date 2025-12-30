import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'

export const dynamic = 'force-dynamic'

// In-memory storage fallback (dev)
let bookings: any[] = []

type BookingStatus = 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED'

type BookingInput = {
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
  website?: string
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isOptionalString(v: unknown): v is string | undefined {
  return typeof v === 'undefined' || typeof v === 'string'
}

function isValidEmail(email: string) {
  // Good-enough validation (avoid over-rejecting)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidTime(time: string) {
  // HTML <input type="time"> uses HH:MM (24h)
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}

function isValidDate(date: string) {
  // HTML <input type="date"> uses YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

function isValidBelgianPostalCode(postalCode: string) {
  return /^\d{4}$/.test(postalCode)
}

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
  status: BookingStatus
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
  if (!apiKey) return

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.DISPATCH_EMAIL_FROM ?? 'TailTribe <noreply@tailtribe.be>',
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    // Do not fail booking creation for email issues
    const msg = await res.text().catch(() => '')
    console.error('Resend email failed:', res.status, msg)
  }
}

function validateBookingInput(body: any): { ok: true; data: BookingInput } | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {}
  const allowedServices = new Set(DISPATCH_SERVICES.map((s) => s.id))

  const data: BookingInput = {
    service: String(body?.service ?? ''),
    date: String(body?.date ?? ''),
    time: String(body?.time ?? ''),
    firstName: String(body?.firstName ?? ''),
    lastName: String(body?.lastName ?? ''),
    email: String(body?.email ?? ''),
    phone: String(body?.phone ?? ''),
    city: String(body?.city ?? ''),
    postalCode: String(body?.postalCode ?? ''),
    petName: String(body?.petName ?? ''),
    petType: String(body?.petType ?? ''),
    message: typeof body?.message === 'string' ? body.message : '',
    website: typeof body?.website === 'string' ? body.website : '',
  }

  // Honeypot: if filled, treat as spam
  if (typeof data.website === 'string' && data.website.trim().length > 0) {
    fieldErrors.website = 'Ongeldige inzending.'
  }

  if (!isNonEmptyString(data.service) || !allowedServices.has(data.service as any)) {
    fieldErrors.service = 'Selecteer een geldige service.'
  }

  if (!isNonEmptyString(data.date) || !isValidDate(data.date)) {
    fieldErrors.date = 'Kies een geldige datum.'
  }

  if (!isNonEmptyString(data.time) || !isValidTime(data.time)) {
    fieldErrors.time = 'Kies een geldig tijdstip.'
  }

  if (!isNonEmptyString(data.firstName)) fieldErrors.firstName = 'Voornaam is verplicht.'
  if (!isNonEmptyString(data.lastName)) fieldErrors.lastName = 'Achternaam is verplicht.'

  if (!isNonEmptyString(data.email) || !isValidEmail(data.email)) {
    fieldErrors.email = 'Vul een geldig e-mailadres in.'
  }

  if (!isNonEmptyString(data.phone)) {
    fieldErrors.phone = 'Telefoonnummer is verplicht.'
  }

  if (!isNonEmptyString(data.city)) fieldErrors.city = 'Stad is verplicht.'

  if (!isNonEmptyString(data.postalCode) || !isValidBelgianPostalCode(data.postalCode)) {
    fieldErrors.postalCode = 'Vul een geldige postcode in (4 cijfers).'
  }

  if (!isNonEmptyString(data.petName)) fieldErrors.petName = 'Naam van je huisdier is verplicht.'
  if (!isNonEmptyString(data.petType)) fieldErrors.petType = 'Selecteer het type huisdier.'

  if (!isOptionalString(body?.message)) {
    fieldErrors.message = 'Extra info moet tekst zijn.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return { ok: true, data }
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

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function readAllBookings(): Promise<BookingRecord[]> {
  if (!hasUpstash()) return bookings as BookingRecord[]

  const ids = (await upstashCmd<string[]>(['LRANGE', 'tt:bookings:ids', 0, 200])) ?? []
  if (ids.length === 0) return []
  const keys = ids.map((id) => `tt:booking:${id}`)
  const raws = (await upstashCmd<(string | null)[]>(['MGET', ...keys])) ?? []
  const parsed: BookingRecord[] = []
  for (const raw of raws) {
    if (!raw) continue
    try {
      parsed.push(JSON.parse(raw))
    } catch {
      // ignore corrupted entries
    }
  }
  return parsed
}

async function createBooking(rec: BookingRecord) {
  if (!hasUpstash()) {
    bookings.push(rec)
    return
  }

  await upstashCmd(['SET', `tt:booking:${rec.id}`, JSON.stringify(rec)])
  await upstashCmd(['LPUSH', 'tt:bookings:ids', rec.id])
  // keep list bounded
  await upstashCmd(['LTRIM', 'tt:bookings:ids', 0, 200])
}

async function updateBooking(rec: BookingRecord) {
  if (!hasUpstash()) {
    const idx = bookings.findIndex((b) => String(b.id) === rec.id)
    if (idx !== -1) bookings[idx] = rec
    return
  }
  await upstashCmd(['SET', `tt:booking:${rec.id}`, JSON.stringify(rec)])
}

async function deleteBooking(id: string) {
  if (!hasUpstash()) {
    bookings = bookings.filter((b) => String(b.id) !== String(id))
    return
  }
  await upstashCmd(['DEL', `tt:booking:${id}`])
  await upstashCmd(['LREM', 'tt:bookings:ids', 0, id])
}

export async function GET() {
  const all = await readAllBookings()
  return NextResponse.json(all)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validated = validateBookingInput(body)
    if (!validated.ok) {
      // If honeypot triggered, return generic success to reduce bot feedback loops
      if (validated.fieldErrors.website) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', fieldErrors: validated.fieldErrors },
        { status: 400 }
      )
    }
    
    const booking: BookingRecord = {
      id: Date.now().toString(),
      ...validated.data,
      status: 'PENDING' as BookingStatus,
      assignedTo: null,
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // never persist honeypot field
    delete (booking as any).website
    
    await createBooking(booking)
    
    // TODO: Send email notification to admin
    
    // Fire-and-forget notifications (don't block success)
    const appUrl = getAppUrl()
    const adminEmail = process.env.DISPATCH_ADMIN_EMAIL ?? 'steven@tailtribe.be'
    const serviceLabel = formatServiceLabel(booking.service)

    const adminHtml = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px 0;">Nieuwe aanvraag – TailTribe Dispatch</h2>
        <p style="margin: 0 0 12px 0;">
          <strong>${booking.firstName} ${booking.lastName}</strong> diende een aanvraag in.
        </p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
          <p style="margin:0 0 6px 0;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin:0 0 6px 0;"><strong>Datum/Tijd:</strong> ${booking.date} om ${booking.time}</p>
          <p style="margin:0 0 6px 0;"><strong>Locatie:</strong> ${booking.city}, ${booking.postalCode}</p>
          <p style="margin:0 0 6px 0;"><strong>Contact:</strong> ${booking.email} • ${booking.phone}</p>
          <p style="margin:0;"><strong>Huisdier:</strong> ${booking.petName} (${booking.petType})</p>
        </div>
        ${
          booking.message
            ? `<p style="margin:12px 0 0 0;"><strong>Extra info:</strong><br/>${String(booking.message)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br/>')}</p>`
            : ''
        }
        <p style="margin:16px 0 0 0;">
          <a href="${appUrl}/admin" style="display:inline-block;background:#10B981;color:white;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600;">
            Open admin dashboard
          </a>
        </p>
      </div>
    `

    const customerHtml = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px 0;">We hebben je aanvraag ontvangen</h2>
        <p style="margin: 0 0 12px 0;">Hoi ${booking.firstName},</p>
        <p style="margin: 0 0 12px 0;">
          Bedankt voor je aanvraag bij TailTribe. We nemen binnen <strong>2 uur</strong> contact met je op om alles te bevestigen.
        </p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
          <p style="margin:0 0 6px 0;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin:0 0 6px 0;"><strong>Datum/Tijd:</strong> ${booking.date} om ${booking.time}</p>
          <p style="margin:0;"><strong>Locatie:</strong> ${booking.city}, ${booking.postalCode}</p>
        </div>
        <p style="margin:16px 0 0 0;">
          Met vriendelijke groet,<br/>TailTribe
        </p>
      </div>
    `

    void sendEmail({
      to: adminEmail,
      subject: `Nieuwe aanvraag – ${serviceLabel} (${booking.city})`,
      html: adminHtml,
      replyTo: booking.email,
    })
    void sendEmail({
      to: booking.email,
      subject: 'Aanvraag ontvangen – TailTribe',
      html: customerHtml,
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = String(body?.id ?? '')
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const all = await readAllBookings()
    const existing = all.find((b) => String(b.id) === id)
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    const next: BookingRecord = { ...existing }

    const allowedStatuses: BookingStatus[] = ['PENDING', 'ASSIGNED', 'CONFIRMED', 'COMPLETED']
    if (typeof body.status === 'string' && allowedStatuses.includes(body.status as BookingStatus)) next.status = body.status
    if (typeof body.assignedTo === 'string' || body.assignedTo === null) next.assignedTo = body.assignedTo
    if (typeof body.adminNotes === 'string') next.adminNotes = body.adminNotes

    next.updatedAt = new Date().toISOString()
    await updateBooking(next)

    return NextResponse.json({ success: true, booking: next })
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '')
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    await deleteBooking(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}

