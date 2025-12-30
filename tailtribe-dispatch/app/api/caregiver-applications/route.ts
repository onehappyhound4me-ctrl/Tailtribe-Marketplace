import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'

export const dynamic = 'force-dynamic'

type CaregiverApplicationInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  services: string[]
  experience: string
  message?: string
  website?: string
}

type CaregiverApplicationRecord = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  services: string[]
  experience: string
  message?: string
  createdAt: string
  updatedAt: string
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidBelgianPostalCode(postalCode: string) {
  return /^\d{4}$/.test(postalCode)
}

function validate(body: any):
  | { ok: true; data: CaregiverApplicationInput }
  | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {}
  const allowedServices = new Set(DISPATCH_SERVICES.map((s) => s.id))

  const servicesRaw = Array.isArray(body?.services) ? body.services : []
  const services = servicesRaw.map((x: any) => String(x)).filter(Boolean)

  const data: CaregiverApplicationInput = {
    firstName: String(body?.firstName ?? ''),
    lastName: String(body?.lastName ?? ''),
    email: String(body?.email ?? ''),
    phone: String(body?.phone ?? ''),
    city: String(body?.city ?? ''),
    postalCode: String(body?.postalCode ?? ''),
    services,
    experience: String(body?.experience ?? ''),
    message: typeof body?.message === 'string' ? body.message : '',
    website: typeof body?.website === 'string' ? body.website : '',
  }

  // Honeypot
  if (data.website && data.website.trim().length > 0) {
    fieldErrors.website = 'Ongeldige inzending.'
  }

  if (!isNonEmptyString(data.firstName)) fieldErrors.firstName = 'Voornaam is verplicht.'
  if (!isNonEmptyString(data.lastName)) fieldErrors.lastName = 'Achternaam is verplicht.'

  if (!isNonEmptyString(data.email) || !isValidEmail(data.email)) {
    fieldErrors.email = 'Vul een geldig e-mailadres in.'
  }

  if (!isNonEmptyString(data.phone)) fieldErrors.phone = 'Telefoonnummer is verplicht.'
  if (!isNonEmptyString(data.city)) fieldErrors.city = 'Stad is verplicht.'

  if (!isNonEmptyString(data.postalCode) || !isValidBelgianPostalCode(data.postalCode)) {
    fieldErrors.postalCode = 'Vul een geldige postcode in (4 cijfers).'
  }

  const validServices = data.services.filter((s) => allowedServices.has(s as any))
  if (validServices.length === 0) {
    fieldErrors.services = 'Selecteer minstens één service.'
  }
  data.services = validServices

  if (!isNonEmptyString(data.experience) || data.experience.trim().length < 10) {
    fieldErrors.experience = 'Geef een korte toelichting (minstens 10 tekens).'
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors }
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

let inMemoryApps: CaregiverApplicationRecord[] = []

async function createApplication(rec: CaregiverApplicationRecord) {
  if (!hasUpstash()) {
    inMemoryApps.push(rec)
    return
  }
  await upstashCmd(['SET', `tt:caregiver_app:${rec.id}`, JSON.stringify(rec)])
  await upstashCmd(['LPUSH', 'tt:caregiver_app:ids', rec.id])
  await upstashCmd(['LTRIM', 'tt:caregiver_app:ids', 0, 200])
}

function formatServiceLabels(ids: string[]) {
  const map = new Map(DISPATCH_SERVICES.map((s) => [s.id, s.name]))
  return ids.map((id) => map.get(id as any) ?? id).join(', ')
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
    const msg = await res.text().catch(() => '')
    console.error('Resend email failed:', res.status, msg)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validate(body)
    if (!validated.ok) {
      if (validated.fieldErrors.website) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: 'VALIDATION_ERROR', fieldErrors: validated.fieldErrors }, { status: 400 })
    }

    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    const rec: CaregiverApplicationRecord = {
      id,
      ...validated.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    delete (rec as any).website

    await createApplication(rec)

    const adminEmail = process.env.DISPATCH_ADMIN_EMAIL ?? 'steven@tailtribe.be'
    const services = formatServiceLabels(rec.services)

    void sendEmail({
      to: adminEmail,
      subject: `Nieuwe aanmelding verzorger – ${rec.firstName} ${rec.lastName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin: 0 0 12px 0;">Nieuwe aanmelding dierenverzorger</h2>
          <p style="margin: 0 0 12px 0;"><strong>${rec.firstName} ${rec.lastName}</strong> heeft een aanmelding ingediend.</p>
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
            <p style="margin:0 0 6px 0;"><strong>E-mail:</strong> ${rec.email}</p>
            <p style="margin:0 0 6px 0;"><strong>Telefoon:</strong> ${rec.phone}</p>
            <p style="margin:0 0 6px 0;"><strong>Locatie:</strong> ${rec.city}, ${rec.postalCode}</p>
            <p style="margin:0 0 6px 0;"><strong>Services:</strong> ${services}</p>
            <p style="margin:0;"><strong>Ervaring:</strong> ${String(rec.experience)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br/>')}</p>
          </div>
          ${
            rec.message
              ? `<p style="margin:12px 0 0 0;"><strong>Extra:</strong><br/>${String(rec.message)
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/\n/g, '<br/>')}</p>`
              : ''
          }
        </div>
      `,
      replyTo: rec.email,
    })

    void sendEmail({
      to: rec.email,
      subject: 'Aanmelding ontvangen – TailTribe',
      html: `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin: 0 0 12px 0;">We hebben je aanmelding ontvangen</h2>
          <p style="margin: 0 0 12px 0;">Hoi ${rec.firstName},</p>
          <p style="margin: 0 0 12px 0;">Bedankt voor je aanmelding als dierenverzorger. We nemen contact met je op zodra we je aanmelding bekeken hebben.</p>
          <p style="margin: 16px 0 0 0;">Met vriendelijke groet,<br/>TailTribe</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, id })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}


