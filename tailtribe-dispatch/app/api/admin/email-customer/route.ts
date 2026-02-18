import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/mailer'
import { getPublicAppUrl } from '@/lib/env'

export const dynamic = 'force-dynamic'

function ensureAdmin(session: any) {
  return session && session.user?.role === 'ADMIN'
}

function getAppUrl() {
  return getPublicAppUrl()
}

function formatServiceLabel(serviceId: string) {
  return DISPATCH_SERVICES.find((s) => s.id === (serviceId as any))?.name ?? serviceId
}

async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  })
}


export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const bookingId = String(body?.bookingId ?? '')
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    const booking = await getBookingById(bookingId)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const appUrl = getAppUrl()
    const serviceLabel = formatServiceLabel(booking.service)

    const ownerName =
      `${booking.owner?.firstName ?? ''} ${booking.owner?.lastName ?? ''}`.trim() ||
      booking.owner?.email ||
      'klant'
    const formattedDate = new Date(booking.date).toLocaleDateString('nl-BE')
    const formattedTime = booking.time ? ` om ${booking.time}` : ''
    if (!booking.owner?.email) {
      return NextResponse.json({ error: 'Owner email ontbreekt' }, { status: 400 })
    }

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px 0;">Bevestiging van je aanvraag</h2>
        <p style="margin: 0 0 12px 0;">Hoi ${ownerName},</p>
        <p style="margin: 0 0 12px 0;">
          Bedankt voor je aanvraag bij TailTribe. We nemen contact met je op om alles te bevestigen.
        </p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
          <p style="margin:0 0 6px 0;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin:0 0 6px 0;"><strong>Datum/Tijd:</strong> ${formattedDate}${formattedTime}</p>
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

    await sendTransactionalEmail({
      to: booking.owner.email,
      subject: 'Bevestiging van je aanvraag – TailTribe',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to send email' }, { status: 500 })
  }
}


