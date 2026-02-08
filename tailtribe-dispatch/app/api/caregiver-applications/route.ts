import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PENDING_ROLE = 'PENDING_CAREGIVER'

type CaregiverApplicationInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  companyName?: string
  enterpriseNumber?: string
  isSelfEmployed: boolean
  hasLiabilityInsurance: boolean
  liabilityInsuranceCompany?: string
  liabilityInsurancePolicyNumber?: string
  services: string[]
  servicePricing: Record<string, { unit: string; priceCents: number }>
  experience: string
  message?: string
  acceptTerms?: boolean
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
  companyName?: string
  enterpriseNumber?: string
  isSelfEmployed: boolean
  hasLiabilityInsurance: boolean
  liabilityInsuranceCompany?: string
  liabilityInsurancePolicyNumber?: string
  services: string[]
  servicePricing: Record<string, { unit: string; priceCents: number }>
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

function isValidEnterpriseOrVatNumber(input: string) {
  const s = input.trim().toUpperCase().replace(/\s+/g, '').replace(/\./g, '').replace(/-/g, '')
  const digits = (s.startsWith('BE') ? s.slice(2) : s).replace(/\D/g, '')
  return /^\d{10}$/.test(digits)
}

function normalizeEnterpriseOrVatNumber(input: string) {
  const s = input.trim().toUpperCase().replace(/\s+/g, '').replace(/\./g, '').replace(/-/g, '')
  const digits = (s.startsWith('BE') ? s.slice(2) : s).replace(/\D/g, '')
  return digits ? `BE${digits}` : ''
}

function maskEmail(email: string) {
  const e = String(email || '').trim()
  const at = e.indexOf('@')
  if (at <= 1) return '***'
  const name = e.slice(0, at)
  const domain = e.slice(at + 1)
  return `${name.slice(0, 1)}***@${domain}`
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

function validate(body: any):
  | { ok: true; data: CaregiverApplicationInput }
  | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {}
  const allowedServices = new Set(DISPATCH_SERVICES.map((s) => s.id))
  const allowedUnits = new Set(['HALF_HOUR', 'HOUR', 'HALF_DAY', 'DAY'])

  const servicesRaw = Array.isArray(body?.services) ? body.services : []
  const services = servicesRaw.map((x: any) => String(x)).filter(Boolean)
  const pricingRaw =
    body?.servicePricing && typeof body.servicePricing === 'object' ? (body.servicePricing as Record<string, any>) : {}

  const data: CaregiverApplicationInput = {
    firstName: String(body?.firstName ?? ''),
    lastName: String(body?.lastName ?? ''),
    email: String(body?.email ?? ''),
    phone: String(body?.phone ?? ''),
    city: String(body?.city ?? ''),
    postalCode: String(body?.postalCode ?? ''),
    companyName: typeof body?.companyName === 'string' ? body.companyName : '',
    enterpriseNumber: body?.enterpriseNumber ? String(body.enterpriseNumber) : '',
    isSelfEmployed: Boolean(body?.isSelfEmployed),
    hasLiabilityInsurance: Boolean(body?.hasLiabilityInsurance),
    liabilityInsuranceCompany: typeof body?.liabilityInsuranceCompany === 'string' ? body.liabilityInsuranceCompany : '',
    liabilityInsurancePolicyNumber:
      typeof body?.liabilityInsurancePolicyNumber === 'string' ? body.liabilityInsurancePolicyNumber : '',
    services,
    servicePricing: {},
    experience: String(body?.experience ?? ''),
    message: typeof body?.message === 'string' ? body.message : '',
    acceptTerms: Boolean(body?.acceptTerms),
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

  if (data.enterpriseNumber) {
    if (!isValidEnterpriseOrVatNumber(data.enterpriseNumber)) {
      fieldErrors.enterpriseNumber = 'Vul een geldig ondernemingsnummer / btw-nummer in of laat leeg.'
    } else {
      data.enterpriseNumber = normalizeEnterpriseOrVatNumber(data.enterpriseNumber)
    }
  }

  // Zelfstandige/BA laten we voorlopig optioneel (geen harde blokkade)

  const validServices = data.services.filter((s) => allowedServices.has(s as any))
  if (validServices.length === 0) {
    fieldErrors.services = 'Selecteer minstens één dienst.'
  }
  data.services = validServices

  // Require pricing per selected service.
  // Note: proposals can still work with "Prijs in overleg" for existing caregivers,
  // but for new caregiver applications we want pricing filled in upfront.
  const servicePricing: Record<string, { unit: string; priceCents: number }> = {}
  for (const serviceId of data.services) {
    const raw = pricingRaw?.[serviceId]
    const unit = String(raw?.unit ?? '').trim().toUpperCase()
    const priceStr = String(raw?.price ?? '').trim()

    if (!unit || !allowedUnits.has(unit)) {
      fieldErrors[`pricing.${serviceId}`] = 'Kies een eenheid (bv. per uur of per dag).'
      continue
    }

    // Accept both "15.00" and "15,00"
    const parsed = Number(priceStr.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed <= 0) {
      fieldErrors[`pricing.${serviceId}`] = 'Vul een geldige prijs in (bv. 15,00).'
      continue
    }
    const priceCents = Math.round(parsed * 100)
    servicePricing[serviceId] = { unit, priceCents }
  }
  if (data.services.length > 0 && Object.keys(servicePricing).length !== data.services.length) {
    fieldErrors.servicePricing = 'Vul een prijs in voor elke gekozen dienst.'
  }
  data.servicePricing = servicePricing

  if (!isNonEmptyString(data.experience) || data.experience.trim().length < 50) {
    fieldErrors.experience = 'Geef een korte toelichting (minstens 50 tekens).'
  }

  if (!data.acceptTerms) {
    fieldErrors.acceptTerms = 'Je moet akkoord gaan met de algemene voorwaarden.'
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors }
  return { ok: true, data }
}

function parseJsonArray(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed.map((x) => String(x)) : []
  } catch {
    return []
  }
}

async function upsertPendingApplication(rec: CaregiverApplicationRecord): Promise<string> {
  const email = String(rec.email || '').trim().toLowerCase()
  if (!email) throw new Error('Missing email')

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { caregiverProfile: true },
  })

  if (existing && (existing.role === 'OWNER' || existing.role === 'ADMIN')) {
    throw new Error('Email bestaat al als ander type gebruiker (geen verzorger).')
  }

  if (existing?.caregiverProfile?.isApproved) {
    throw new Error('Je hebt al een verzorgersaccount. Gebruik je dashboard om je profiel te beheren.')
  }

  const servicesJson = JSON.stringify(Array.isArray(rec.services) ? rec.services : [])
  const servicePricingJson = JSON.stringify(rec.servicePricing ?? {})
  const workRegionsJson = JSON.stringify([])

  if (!existing) {
    const created = await prisma.user.create({
      data: {
        email,
        role: PENDING_ROLE,
        firstName: String(rec.firstName ?? '').trim() || 'Verzorger',
        lastName: String(rec.lastName ?? '').trim() || '',
        phone: String(rec.phone ?? '').trim() || null,
        caregiverProfile: {
          create: {
            city: String(rec.city ?? '').trim(),
            postalCode: String(rec.postalCode ?? '').trim(),
            region: null,
            workRegions: workRegionsJson,
            companyName: String(rec.companyName ?? '').trim() || null,
            enterpriseNumber: String(rec.enterpriseNumber ?? '').trim() || null,
            isSelfEmployed: Boolean(rec.isSelfEmployed),
            hasLiabilityInsurance: Boolean(rec.hasLiabilityInsurance),
            liabilityInsuranceCompany: String(rec.liabilityInsuranceCompany ?? '').trim() || null,
            liabilityInsurancePolicyNumber: String(rec.liabilityInsurancePolicyNumber ?? '').trim() || null,
            services: servicesJson,
            servicePricing: servicePricingJson,
            experience: String(rec.experience ?? '').trim(),
            bio: String(rec.message ?? '').trim() || null,
            isApproved: false,
            isActive: false,
          },
        },
      },
      select: { id: true },
    })
    return created.id
  }

  // Existing pending caregiver: update details & ensure profile exists.
  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: {
      role: existing.role === 'CAREGIVER' ? 'CAREGIVER' : PENDING_ROLE,
      firstName: String(rec.firstName ?? '').trim() || existing.firstName,
      lastName: String(rec.lastName ?? '').trim() || existing.lastName,
      phone: String(rec.phone ?? '').trim() || existing.phone,
      caregiverProfile: existing.caregiverProfile
        ? {
            update: {
              city: String(rec.city ?? '').trim(),
              postalCode: String(rec.postalCode ?? '').trim(),
              companyName: String(rec.companyName ?? '').trim() || null,
              enterpriseNumber: String(rec.enterpriseNumber ?? '').trim() || null,
              isSelfEmployed: Boolean(rec.isSelfEmployed),
              hasLiabilityInsurance: Boolean(rec.hasLiabilityInsurance),
              liabilityInsuranceCompany: String(rec.liabilityInsuranceCompany ?? '').trim() || null,
              liabilityInsurancePolicyNumber: String(rec.liabilityInsurancePolicyNumber ?? '').trim() || null,
              services: servicesJson,
              servicePricing: servicePricingJson,
              experience: String(rec.experience ?? '').trim(),
              bio: String(rec.message ?? '').trim() || null,
              isApproved: false,
              isActive: false,
            },
          }
        : {
            create: {
              city: String(rec.city ?? '').trim(),
              postalCode: String(rec.postalCode ?? '').trim(),
              region: null,
              workRegions: workRegionsJson,
              companyName: String(rec.companyName ?? '').trim() || null,
              enterpriseNumber: String(rec.enterpriseNumber ?? '').trim() || null,
              isSelfEmployed: Boolean(rec.isSelfEmployed),
              hasLiabilityInsurance: Boolean(rec.hasLiabilityInsurance),
              liabilityInsuranceCompany: String(rec.liabilityInsuranceCompany ?? '').trim() || null,
              liabilityInsurancePolicyNumber: String(rec.liabilityInsurancePolicyNumber ?? '').trim() || null,
              services: servicesJson,
              servicePricing: servicePricingJson,
              experience: String(rec.experience ?? '').trim(),
              bio: String(rec.message ?? '').trim() || null,
              isApproved: false,
              isActive: false,
            },
          },
    },
    select: { id: true },
  })

  return updated.id
}

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pending = await prisma.caregiverProfile.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    const payload: CaregiverApplicationRecord[] = pending.map((cg) => ({
      id: cg.user.id,
      firstName: cg.user.firstName ?? '',
      lastName: cg.user.lastName ?? '',
      email: cg.user.email ?? '',
      phone: cg.user.phone ?? '',
      city: cg.city ?? '',
      postalCode: cg.postalCode ?? '',
      companyName: cg.companyName ?? undefined,
      enterpriseNumber: cg.enterpriseNumber ?? undefined,
      isSelfEmployed: cg.isSelfEmployed,
      hasLiabilityInsurance: cg.hasLiabilityInsurance,
      liabilityInsuranceCompany: cg.liabilityInsuranceCompany ?? undefined,
      liabilityInsurancePolicyNumber: cg.liabilityInsurancePolicyNumber ?? undefined,
      services: parseJsonArray(cg.services),
      servicePricing: (() => {
        try {
          return JSON.parse(cg.servicePricing || '{}')
        } catch {
          return {}
        }
      })(),
      experience: cg.experience ?? '',
      message: cg.bio ?? undefined,
      createdAt: cg.createdAt.toISOString(),
      updatedAt: cg.updatedAt.toISOString(),
    }))

    return NextResponse.json(payload)
  } catch (e) {
    console.error('Failed to fetch caregiver applications:', e)
    return NextResponse.json({ error: 'Failed to fetch caregiver applications' }, { status: 500 })
  }
}

function formatServiceLabels(ids: string[]) {
  const map = new Map(DISPATCH_SERVICES.map((s) => [s.id, s.name]))
  return ids.map((id) => map.get(id as any) ?? id).join(', ')
}


export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  try {
    const session = await auth()
    if (session?.user?.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Je bent ingelogd als eigenaar. Log uit om je als dierenverzorger aan te melden.' },
        { status: 403 }
      )
    }
    if (session?.user?.role === 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Je hebt al een verzorgersaccount. Gebruik je dashboard om je profiel te beheren.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = validate(body)
    if (!validated.ok) {
      if (validated.fieldErrors.website) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: 'VALIDATION_ERROR', fieldErrors: validated.fieldErrors }, { status: 400 })
    }

    const rec: CaregiverApplicationRecord = {
      id: 'pending',
      ...validated.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.info(
      JSON.stringify({
        msg: 'caregiver_application.submit',
        requestId,
        email: maskEmail(rec.email),
        servicesCount: rec.services?.length ?? 0,
        ts: new Date().toISOString(),
      })
    )

    const userId = await upsertPendingApplication(rec)
    rec.id = userId

    const adminEmail = process.env.DISPATCH_ADMIN_EMAIL ?? 'steven@tailtribe.be'
    const services = formatServiceLabels(rec.services)

    // Email sending should never block the application submission.
    // If email is not configured (or fails), log it and still return success to the user.
    void (async () => {
      try {
        await sendTransactionalEmail({
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
            ${rec.companyName ? `<p style="margin:0 0 6px 0;"><strong>Bedrijf:</strong> ${String(rec.companyName)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')}</p>` : ''}
            <p style="margin:0 0 6px 0;"><strong>Ondernemingsnummer/btw:</strong> ${rec.enterpriseNumber}</p>
            <p style="margin:0 0 6px 0;"><strong>Zelfstandige:</strong> ${rec.isSelfEmployed ? 'Ja' : 'Nee'}</p>
            <p style="margin:0 0 6px 0;"><strong>BA-verzekering:</strong> ${rec.hasLiabilityInsurance ? 'Ja' : 'Nee'}</p>
            ${
              rec.liabilityInsuranceCompany
                ? `<p style="margin:0 0 6px 0;"><strong>Verzekeraar:</strong> ${String(rec.liabilityInsuranceCompany)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}</p>`
                : ''
            }
            ${
              rec.liabilityInsurancePolicyNumber
                ? `<p style="margin:0 0 6px 0;"><strong>Polisnummer:</strong> ${String(rec.liabilityInsurancePolicyNumber)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}</p>`
                : ''
            }
            <p style="margin:0 0 6px 0;"><strong>Diensten:</strong> ${services}</p>
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
      } catch (e) {
        console.error(
          JSON.stringify({
            msg: 'caregiver_application.email_failed',
            requestId,
            kind: 'admin',
            to: maskEmail(adminEmail),
            detail: getErrorMessage(e),
            ts: new Date().toISOString(),
          })
        )
        if (e instanceof Error && e.stack) console.error(e.stack)
      }
    })()

    void (async () => {
      try {
        await sendTransactionalEmail({
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
      } catch (e) {
        console.error(
          JSON.stringify({
            msg: 'caregiver_application.email_failed',
            requestId,
            kind: 'applicant',
            to: maskEmail(rec.email),
            detail: getErrorMessage(e),
            ts: new Date().toISOString(),
          })
        )
        if (e instanceof Error && e.stack) console.error(e.stack)
      }
    })()

    return NextResponse.json({ success: true, id: userId })
  } catch (e) {
    const message = getErrorMessage(e)
    const detail = message
    const hint = 'Check Vercel logs voor requestId en error stack.'

    console.error(
      JSON.stringify({
        msg: 'caregiver_application.submit_failed',
        requestId,
        detail,
        ts: new Date().toISOString(),
      })
    )
    if (e instanceof Error && e.stack) {
      console.error(e.stack)
    }

    return NextResponse.json(
      { error: 'Failed to submit application', code: 'CAREGIVER_APPLICATION_FAILED', requestId, detail, hint },
      { status: 500 }
    )
  }
}


