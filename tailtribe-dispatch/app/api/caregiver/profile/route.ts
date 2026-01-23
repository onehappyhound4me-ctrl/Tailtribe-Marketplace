import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DISPATCH_SERVICES } from '@/lib/services'
import { getImpersonationContext } from '@/lib/impersonation'

const ALLOWED_PRICING_UNITS = ['HALF_HOUR', 'HOUR', 'HALF_DAY', 'DAY'] as const
type PricingUnit = (typeof ALLOWED_PRICING_UNITS)[number]

type ServicePricingMap = Record<
  string,
  {
    unit: PricingUnit
    priceCents: number
  }
>

const normalizeServices = (input: unknown): string[] => {
  if (!Array.isArray(input)) return []
  const allowed = new Set<string>(DISPATCH_SERVICES.map((service) => String(service.id)))
  const nameToId = new Map<string, string>(
    DISPATCH_SERVICES.map((service) => [service.name.toLowerCase(), service.id])
  )
  const slugToId = new Map<string, string>(
    DISPATCH_SERVICES.map((service) => [service.slug.toLowerCase(), service.id])
  )
  const legacyEnglish = new Map<string, string>([
    ['dog walking', 'DOG_WALKING'],
    ['group dog walking', 'GROUP_DOG_WALKING'],
    ['dog training', 'DOG_TRAINING'],
    ['pet sitting', 'PET_SITTING'],
    ['pet boarding', 'PET_BOARDING'],
    ['home care', 'HOME_CARE'],
    ['pet transport', 'PET_TRANSPORT'],
    ['small animal care', 'SMALL_ANIMAL_CARE'],
    ['event companion', 'EVENT_COMPANION'],
  ])

  const normalized = input
    .map((service) => {
      if (typeof service === 'number' || (typeof service === 'string' && /^\d+$/.test(service))) {
        const idx = Number(service)
        return DISPATCH_SERVICES[idx]?.id ?? null
      }
      if (typeof service !== 'string') return null
      const trimmed = service.trim()
      if (allowed.has(trimmed)) return trimmed
      const key = trimmed.toLowerCase()
      return nameToId.get(key) ?? slugToId.get(key) ?? legacyEnglish.get(key) ?? null
    })
    .filter((service): service is string => Boolean(service))

  return Array.from(new Set(normalized))
}

const parseServicePricing = (raw: unknown, services: string[]) => {
  if (!raw || typeof raw !== 'object') return {} as ServicePricingMap
  const input = raw as Record<string, any>
  const output: ServicePricingMap = {}
  services.forEach((serviceId) => {
    const entry = input[serviceId]
    if (!entry) return
    const unit = entry.unit
    if (!ALLOWED_PRICING_UNITS.includes(unit)) return
    const priceRaw = String(entry.price ?? entry.priceCents ?? '').replace(',', '.')
    const priceValue = Number(priceRaw)
    if (!Number.isFinite(priceValue) || priceValue <= 0) return
    const priceCents =
      entry.priceCents != null && Number.isFinite(Number(entry.priceCents))
        ? Math.round(Number(entry.priceCents))
        : Math.round(priceValue * 100)
    output[serviceId] = { unit, priceCents }
  })
  return output
}

export async function GET() {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const effectiveRole = impersonation?.role ?? session?.user?.role

  if (!session || effectiveRole !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: impersonation?.role === 'CAREGIVER' ? impersonation.userId : session.user.id },
    })

    if (!profile) {
      return NextResponse.json(null)
    }

    const normalizedServices = normalizeServices(JSON.parse(profile.services || '[]'))
    const nextServicesJson = JSON.stringify(normalizedServices)
    if (profile.services !== nextServicesJson) {
      await prisma.caregiverProfile.update({
        where: { userId: session.user.id },
        data: { services: nextServicesJson },
      })
    }

    return NextResponse.json({ ...profile, services: nextServicesJson })
  } catch (error) {
    console.error('Failed to fetch caregiver profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      city,
      postalCode,
      region,
      workRegions,
      maxDistance,
      companyName,
      enterpriseNumber,
      isSelfEmployed,
      hasLiabilityInsurance,
      liabilityInsuranceCompany,
      liabilityInsurancePolicyNumber,
      services,
      servicePricing,
      experience,
      bio,
    } = body

    // Basisvalidatie stad/postcode
    if (!city || String(city).trim().length < 2) {
      return NextResponse.json({ error: 'Vul een geldige stad / gemeente in.' }, { status: 400 })
    }
    if (!postalCode || !/^\d{4}$/.test(String(postalCode))) {
      return NextResponse.json({ error: 'Vul een geldige Belgische postcode (4 cijfers) in.' }, { status: 400 })
    }

    // Check if profile exists
    const existing = await prisma.caregiverProfile.findUnique({
      where: { userId: session.user.id },
    })

    let profile
    const normalizedServices = normalizeServices(services)
    const parsedPricing = parseServicePricing(servicePricing, normalizedServices)

    if (normalizedServices.length > 0) {
      for (const serviceId of normalizedServices) {
        if (!parsedPricing[serviceId]) {
          return NextResponse.json(
            { error: 'Vul een geldige prijs en tijdseenheid in voor elke gekozen dienst.' },
            { status: 400 }
          )
        }
      }
    }

    if (existing) {
      // Update existing profile
      profile = await prisma.caregiverProfile.update({
        where: { userId: session.user.id },
        data: {
          city,
          postalCode,
          region: region || null,
          workRegions: JSON.stringify(workRegions || []),
          maxDistance: maxDistance || 20,
          companyName: companyName || null,
          enterpriseNumber: enterpriseNumber || null,
          isSelfEmployed: isSelfEmployed || false,
          hasLiabilityInsurance: hasLiabilityInsurance || false,
          liabilityInsuranceCompany: liabilityInsuranceCompany || null,
          liabilityInsurancePolicyNumber: liabilityInsurancePolicyNumber || null,
          services: JSON.stringify(normalizedServices),
          servicePricing: JSON.stringify(parsedPricing),
          experience,
          bio: bio || null,
        },
      })
    } else {
      // Create new profile
      profile = await prisma.caregiverProfile.create({
        data: {
          userId: session.user.id,
          city,
          postalCode,
          region: region || null,
          workRegions: JSON.stringify(workRegions || []),
          maxDistance: maxDistance || 20,
          companyName: companyName || null,
          enterpriseNumber: enterpriseNumber || null,
          isSelfEmployed: isSelfEmployed || false,
          hasLiabilityInsurance: hasLiabilityInsurance || false,
          liabilityInsuranceCompany: liabilityInsuranceCompany || null,
          liabilityInsurancePolicyNumber: liabilityInsurancePolicyNumber || null,
          services: JSON.stringify(normalizedServices),
          servicePricing: JSON.stringify(parsedPricing),
          experience,
          bio: bio || null,
        },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to save caregiver profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}
