import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'
import { assertSlotNotInPast } from '@/lib/date-utils'
import { auth } from '@/lib/auth'
import { buildAdminBookingReceivedEmail, buildOwnerBookingReceivedEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendTransactionalEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

type BookingStatus = 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED'

type BookingInput = {
  service: string
  date: string
  time: string
  timeWindow: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  petName: string
  petType: string
  contactPreference: string
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

function isWithinBookingWindow(date: string) {
  if (!isValidDate(date)) return false
  const [y, m, d] = date.split('-').map(Number)
  const bookingDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setUTCDate(maxDate.getUTCDate() + 60)
  return bookingDay.getTime() <= maxDate.getTime()
}

function isValidBelgianPostalCode(postalCode: string) {
  return /^\d{4}$/.test(postalCode)
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
}

function formatServiceLabel(serviceId: string) {
  return DISPATCH_SERVICES.find((s) => s.id === (serviceId as any))?.name ?? serviceId
}

const TIME_WINDOW_MAP: Record<string, string> = {
  ochtend: 'MORNING',
  middag: 'AFTERNOON',
  avond: 'EVENING',
  nacht: 'NIGHT',
}

function normalizeTimeWindow(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const lower = trimmed.toLowerCase()
  if (TIME_WINDOW_MAP[lower]) return TIME_WINDOW_MAP[lower]
  return trimmed.toUpperCase()
}

function formatTimeWindow(value: string) {
  const map: Record<string, string> = {
    MORNING: 'Ochtend (07:00 - 12:00)',
    AFTERNOON: 'Middag (12:00 - 18:00)',
    EVENING: 'Avond (18:00 - 22:00)',
    NIGHT: 'Nacht (22:00 - 07:00)',
    ochtend: 'Ochtend (07:00 - 12:00)',
    middag: 'Middag (12:00 - 18:00)',
    avond: 'Avond (18:00 - 22:00)',
    nacht: 'Nacht (22:00 - 07:00)',
  }
  return map[value] ?? value
}

function formatContactPreference(value: string) {
  const map: Record<string, string> = {
    email: 'E-mail',
    telefoon: 'Telefoon',
    whatsapp: 'WhatsApp',
  }
  return map[value] ?? value
}


function validateBookingInput(body: any): { ok: true; data: BookingInput } | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {}
  const allowedServices = new Set(DISPATCH_SERVICES.map((s) => s.id))
  const allowedTimeWindows = new Set(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'])
  const allowedContactPreference = new Set(['email', 'telefoon', 'whatsapp'])

  const data: BookingInput = {
    service: String(body?.service ?? ''),
    date: String(body?.date ?? ''),
    time: String(body?.time ?? ''),
    timeWindow: normalizeTimeWindow(String(body?.timeWindow ?? '')),
    firstName: String(body?.firstName ?? ''),
    lastName: String(body?.lastName ?? ''),
    email: String(body?.email ?? ''),
    phone: String(body?.phone ?? ''),
    city: String(body?.city ?? ''),
    postalCode: String(body?.postalCode ?? ''),
    petName: String(body?.petName ?? ''),
    petType: String(body?.petType ?? ''),
    contactPreference: String(body?.contactPreference ?? ''),
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

  if (!isNonEmptyString(data.timeWindow) || !allowedTimeWindows.has(data.timeWindow)) {
    fieldErrors.timeWindow = 'Kies een tijdsblok.'
  }

  if (!isNonEmptyString(data.date) || !isValidDate(data.date)) {
    fieldErrors.date = 'Kies een geldige datum.'
  } else if (!isWithinBookingWindow(data.date)) {
    fieldErrors.date = 'Je kan maximaal 60 dagen vooruit boeken.'
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

  if (!isNonEmptyString(data.contactPreference) || !allowedContactPreference.has(data.contactPreference)) {
    fieldErrors.contactPreference = 'Kies één kanaal voor contact.'
  }

  if (!isOptionalString(body?.message)) {
    fieldErrors.message = 'Extra info moet tekst zijn.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  try {
    assertSlotNotInPast({ date: data.date, time: data.time, timeWindow: data.timeWindow })
  } catch (err: any) {
    return { ok: false, fieldErrors: { date: err.message ?? 'Datum ligt in het verleden' } }
  }

  return { ok: true, data }
}

function ensureAdmin(session: any) {
  return session && session.user?.role === 'ADMIN'
}

export async function GET() {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bookings)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateKey = session.user?.id ? `booking:${session.user.id}` : `booking:${ip}`
    const rate = await checkRateLimit(rateKey, 10, 10 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Te veel aanvragen. Probeer later opnieuw.' },
        { status: 429 }
      )
    }

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
    let slot
    try {
      slot = assertSlotNotInPast({
        date: validated.data.date,
        time: validated.data.time,
        timeWindow: validated.data.timeWindow,
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', fieldErrors: { date: err.message ?? 'Datum ligt in het verleden' } },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        ownerId: session.user.id,
        service: validated.data.service,
        date: slot.slotStart,
        time: validated.data.time,
        timeWindow: validated.data.timeWindow,
        city: validated.data.city,
        postalCode: validated.data.postalCode,
        region: null,
        address: null,
        petName: validated.data.petName,
        petType: validated.data.petType,
        petDetails: null,
        contactPreference: validated.data.contactPreference || 'email',
        message: validated.data.message?.trim() || null,
        status: 'PENDING',
      },
    })

    // Fire-and-forget notifications (don't block success)
    const appUrl = getAppUrl()
    const adminEmail = process.env.DISPATCH_ADMIN_EMAIL ?? 'steven@tailtribe.be'
    const serviceLabel = formatServiceLabel(booking.service)
    const timeWindowLabel = formatTimeWindow(booking.timeWindow)
    const contactPreferenceLabel = formatContactPreference(validated.data.contactPreference)

    const adminEmailPayload = buildAdminBookingReceivedEmail({
      firstName: validated.data.firstName,
      lastName: validated.data.lastName,
      serviceLabel,
      date: booking.date.toISOString(),
      time: booking.time ?? '',
      timeWindowLabel,
      city: booking.city,
      postalCode: booking.postalCode,
      email: validated.data.email,
      phone: validated.data.phone,
      contactPreferenceLabel,
      petName: booking.petName,
      petType: booking.petType,
      message: validated.data.message,
      appUrl,
    })

    const ownerEmailPayload = buildOwnerBookingReceivedEmail({
      firstName: validated.data.firstName,
      serviceLabel,
      date: booking.date.toISOString(),
      time: booking.time ?? '',
      timeWindowLabel,
      city: booking.city,
      postalCode: booking.postalCode,
      contactPreferenceLabel,
    })

    void sendTransactionalEmail({
      to: adminEmail,
      subject: adminEmailPayload.subject,
      html: adminEmailPayload.html,
      replyTo: validated.data.email,
    })
    void sendTransactionalEmail({
      to: validated.data.email,
      subject: ownerEmailPayload.subject,
      html: ownerEmailPayload.html,
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
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = String(body?.id ?? '')
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const allowedStatuses: BookingStatus[] = ['PENDING', 'ASSIGNED', 'CONFIRMED', 'COMPLETED']
    const data: Record<string, any> = {}
    if (typeof body.status === 'string' && allowedStatuses.includes(body.status as BookingStatus)) {
      data.status = body.status
    }
    if (typeof body.adminNotes === 'string') data.adminNotes = body.adminNotes
    if (typeof body.caregiverId === 'string') data.caregiverId = body.caregiverId

    const updated = await prisma.booking.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, booking: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '')
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}

