import { NextRequest, NextResponse } from 'next/server'
import { DISPATCH_SERVICES } from '@/lib/services'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { sendTransactionalEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

const DATA_FILE = path.join(process.cwd(), 'data', 'caregiver-applications.json')

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

  const servicesRaw = Array.isArray(body?.services) ? body.services : []
  const services = servicesRaw.map((x: any) => String(x)).filter(Boolean)

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

  if (!isNonEmptyString(data.experience) || data.experience.trim().length < 50) {
    fieldErrors.experience = 'Geef een korte toelichting (minstens 50 tekens).'
  }

  if (!data.acceptTerms) {
    fieldErrors.acceptTerms = 'Je moet akkoord gaan met de algemene voorwaarden.'
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
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const snippet = text && text.length > 600 ? `${text.slice(0, 600)}…` : text
    throw new Error(`Upstash error ${res.status}${snippet ? `: ${snippet}` : ''}`)
  }
  const data = await res.json()
  return data?.result as T
}

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function readApplicationsFromFile(): CaregiverApplicationRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.error('Failed to read caregiver applications file:', e)
  }
  return []
}

function writeApplicationsToFile(apps: CaregiverApplicationRecord[]) {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to write caregiver applications file:', e)
  }
}

async function createApplication(rec: CaregiverApplicationRecord) {
  if (!hasUpstash()) {
    const apps = readApplicationsFromFile()
    apps.push(rec)
    writeApplicationsToFile(apps)
    return
  }
  try {
    await upstashCmd(['SET', `tt:caregiver_app:${rec.id}`, JSON.stringify(rec)])
    await upstashCmd(['LPUSH', 'tt:caregiver_app:ids', rec.id])
    await upstashCmd(['LTRIM', 'tt:caregiver_app:ids', 0, 200])
    return
  } catch (e) {
    // Do not block submissions if Upstash is temporarily unreachable/misconfigured.
    console.error(
      JSON.stringify({
        msg: 'caregiver_application.store_failed',
        id: rec.id,
        upstashEnabled: true,
        detail: getErrorMessage(e),
        ts: new Date().toISOString(),
      })
    )
    if (e instanceof Error && e.stack) console.error(e.stack)
  }

  // Fallback: file storage (best-effort). In serverless this may not persist; still don't fail user.
  const apps = readApplicationsFromFile()
  apps.push(rec)
  writeApplicationsToFile(apps)
}

export async function GET() {
  try {
    if (!hasUpstash()) {
      const apps = readApplicationsFromFile()
      return NextResponse.json(apps)
    }
    try {
      const ids = (await upstashCmd<string[]>(['LRANGE', 'tt:caregiver_app:ids', 0, 200])) ?? []
      if (ids.length === 0) return NextResponse.json([])
      const keys = ids.map((id) => `tt:caregiver_app:${id}`)
      const raws = (await upstashCmd<(string | null)[]>(['MGET', ...keys])) ?? []
      const parsed: CaregiverApplicationRecord[] = []
      for (const raw of raws) {
        if (!raw) continue
        try {
          parsed.push(JSON.parse(raw))
        } catch {
          // ignore
        }
      }
      return NextResponse.json(parsed)
    } catch (e) {
      console.error('Failed to fetch caregiver applications from Upstash:', e)
      // Fallback (best-effort)
      const apps = readApplicationsFromFile()
      return NextResponse.json(apps)
    }
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

    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    const rec: CaregiverApplicationRecord = {
      id,
      ...validated.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    delete (rec as any).website

    console.info(
      JSON.stringify({
        msg: 'caregiver_application.submit',
        requestId,
        upstashEnabled: hasUpstash(),
        email: maskEmail(rec.email),
        servicesCount: rec.services?.length ?? 0,
        ts: new Date().toISOString(),
      })
    )

    await createApplication(rec)

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

    return NextResponse.json({ success: true, id })
  } catch (e) {
    const message = getErrorMessage(e)
    const isUpstash = /upstash/i.test(message) || hasUpstash()
    const detail = message
    const hint = isUpstash
      ? 'Upstash lijkt (gedeeltelijk) geconfigureerd maar faalt. Controleer UPSTASH_REDIS_REST_URL en UPSTASH_REDIS_REST_TOKEN in Vercel (Production).'
      : 'Check Vercel logs voor requestId en error stack.'

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


