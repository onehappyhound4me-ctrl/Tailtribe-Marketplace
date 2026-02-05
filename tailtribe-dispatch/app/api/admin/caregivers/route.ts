import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { provinceSlugFromPostalCode } from '@/data/be-geo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const max = new Date(today)
  max.setDate(max.getDate() + 60)

  const caregivers = await prisma.caregiverProfile.findMany({
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
      availability: {
        where: {
          isAvailable: true,
          date: {
            gte: today,
            lte: max,
          },
        },
        select: {
          date: true,
          timeWindow: true,
        },
        orderBy: {
          date: 'asc',
        },
      },
    },
  })

  const payload = caregivers.map((cg) => {
    let services: string[] = []
    try {
      services = JSON.parse(cg.services || '[]')
      if (!Array.isArray(services)) services = []
    } catch {
      services = []
    }
    let workRegions: string[] = []
    try {
      workRegions = JSON.parse(cg.workRegions || '[]')
      if (!Array.isArray(workRegions)) workRegions = []
    } catch {
      workRegions = []
    }
    let servicePricing: Record<string, { unit: string; priceCents: number }> = {}
    try {
      servicePricing = JSON.parse(cg.servicePricing || '{}')
      if (!servicePricing || typeof servicePricing !== 'object') servicePricing = {}
    } catch {
      servicePricing = {}
    }
    return {
      id: cg.user.id,
      firstName: cg.user.firstName ?? '',
      lastName: cg.user.lastName ?? '',
      email: cg.user.email ?? '',
      phone: cg.user.phone ?? '',
      city: cg.city ?? '',
      postalCode: cg.postalCode ?? '',
      region: cg.region ?? provinceSlugFromPostalCode(cg.postalCode ?? '') ?? null,
      workRegions,
      services,
      servicePricing,
      companyName: cg.companyName ?? null,
      enterpriseNumber: cg.enterpriseNumber ?? null,
      isSelfEmployed: cg.isSelfEmployed,
      hasLiabilityInsurance: cg.hasLiabilityInsurance,
      liabilityInsuranceCompany: cg.liabilityInsuranceCompany ?? null,
      liabilityInsurancePolicyNumber: cg.liabilityInsurancePolicyNumber ?? null,
      maxDistance: cg.maxDistance ?? null,
      experience: cg.experience ?? '',
      bio: cg.bio ?? '',
      isApproved: cg.isApproved,
      isActive: cg.isActive,
      createdAt: cg.createdAt,
      availability: cg.availability.map((a) => ({
        date: a.date.toISOString(),
        timeWindow: a.timeWindow,
      })),
    }
  })

  return NextResponse.json(payload)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { caregiverId } = body as { caregiverId?: string }
  if (!caregiverId) {
    return NextResponse.json({ error: 'caregiverId is required' }, { status: 400 })
  }

  try {
    // Soft delete: mark profile inactive and remove user to avoid stale access
    await prisma.caregiverProfile.updateMany({
      where: { userId: caregiverId },
      data: { isActive: false, isApproved: false },
    })
    await prisma.user.delete({
      where: { id: caregiverId },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/caregivers', e)
    return NextResponse.json({ error: 'Failed to delete caregiver' }, { status: 500 })
  }
}
