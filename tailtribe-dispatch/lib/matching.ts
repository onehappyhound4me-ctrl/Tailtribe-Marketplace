import prisma from '@/lib/prisma'

type EligibleParams = {
  service: string
  postalCode?: string | null
  region?: string | null
  date: Date
  timeWindow: string
}

type EligibleOptions = {
  /**
   * If true: only return caregivers that explicitly marked availability
   * for this date + timeWindow.
   */
  requireAvailability?: boolean
}

const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()

const parseRegions = (value?: string | null) => {
  if (!value) return [] as string[]
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const parseServices = (value?: string | null) => {
  if (!value) return [] as string[]
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : []
  } catch {
    return []
  }
}

// Province match is the primary rule; fallback to postal proximity when province is unknown
const regionScore = (params: {
  caregiverRegion?: string | null
  caregiverWorkRegions?: string | null
  caregiverPostal?: string | null
  targetRegion?: string | null
  targetPostal?: string | null
}) => {
  const target = normalize(params.targetRegion)
  const caregiverRegion = normalize(params.caregiverRegion)
  const caregiverWorkRegions = parseRegions(params.caregiverWorkRegions)
    .map((region) => normalize(region))
    .filter(Boolean)

  if (target) {
    if (caregiverRegion === target || caregiverWorkRegions.includes(target)) return 2
    return 0
  }

  const caregiverPostal = params.caregiverPostal
  const targetPostal = params.targetPostal
  if (!caregiverPostal || !targetPostal) return 0
  if (caregiverPostal === targetPostal) return 2
  if (caregiverPostal.slice(0, 2) === targetPostal.slice(0, 2)) return 1
  return 0
}

export async function getEligibleCaregivers(params: EligibleParams) {
  return getEligibleCaregiversWithOptions(params, {})
}

export async function getEligibleCaregiversWithOptions(params: EligibleParams, options: EligibleOptions) {
  const { service, postalCode, region, date, timeWindow } = params
  const targetDate = new Date(date)

  // NOTE: keep findMany() args shape stable to satisfy Prisma's TS types.
  // We only toggle the `where.availability.some` filter.
  const caregivers = await prisma.caregiverProfile.findMany({
    where: {
      isApproved: true,
      isActive: true,
      user: { role: 'CAREGIVER' },
      ...(options.requireAvailability
        ? {
            availability: {
              some: {
                date: targetDate,
                isAvailable: true,
              },
            },
          }
        : {}),
    },
    include: {
      user: true,
      availability: {
        where: {
          date: targetDate,
          isAvailable: true,
        },
      },
    },
  })

  const ranked = caregivers
    .filter((cg) => parseServices(cg.services).includes(service))
    .map((cg) => {
      const rScore = regionScore({
        caregiverRegion: cg.region,
        caregiverWorkRegions: cg.workRegions,
        caregiverPostal: cg.postalCode,
        targetRegion: region,
        targetPostal: postalCode,
      })
      const hasAvailability = cg.availability.length > 0
      const score = rScore * 2 + (hasAvailability ? 1 : 0)
      const regionReason =
        region && rScore > 0 ? 'Zelfde provincie' : rScore > 1 ? 'Zelfde postcode' : rScore === 1 ? 'Nabije regio' : 'Regio onbekend'
      return {
        id: cg.userId,
        name: `${cg.user.firstName ?? ''} ${cg.user.lastName ?? ''}`.trim() || cg.user.email,
        postalCode: cg.postalCode,
        availability: hasAvailability,
        score,
        reasons: [
          hasAvailability ? 'Beschikbaar' : 'Geen beschikbaarheid gevonden',
          regionReason,
          `Service: ${service}`,
        ],
      }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked
}
