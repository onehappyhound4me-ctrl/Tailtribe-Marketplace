import prisma from '@/lib/prisma'

type AvailabilityCheck = {
  caregiverUserId: string
  date: Date | string
  timeWindow?: string
}

const toUtcDate = (input: Date | string) => {
  if (typeof input === 'string') {
    const [year, month, day] = input.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }

  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate(), 0, 0, 0, 0))
}

export const isCaregiverAvailable = async ({ caregiverUserId, date }: AvailabilityCheck) => {
  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiverUserId },
    select: { id: true },
  })

  if (!profile) return false

  const availability = await prisma.availability.findFirst({
    where: {
      caregiverId: profile.id,
      date: toUtcDate(date),
      isAvailable: true,
    },
    select: { id: true },
  })

  return Boolean(availability)
}

export const assertCaregiverAvailable = async (params: AvailabilityCheck) => {
  const ok = await isCaregiverAvailable(params)
  if (!ok) {
    throw new Error('Verzorger is niet beschikbaar op deze dag')
  }
}
