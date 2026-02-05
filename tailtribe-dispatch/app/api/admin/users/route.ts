import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { provinceSlugFromPostalCode } from '@/data/be-geo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [owners, caregivers] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'OWNER' },
      include: { ownerProfile: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'CAREGIVER' },
      include: { caregiverProfile: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const ownersPayload = owners.map((owner) => ({
    id: owner.id,
    name: `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() || owner.email,
    email: owner.email,
    phone: owner.phone ?? null,
    createdAt: owner.createdAt,
    profile: {
      address: owner.ownerProfile?.address ?? null,
      city: owner.ownerProfile?.city ?? null,
      postalCode: owner.ownerProfile?.postalCode ?? null,
      region:
        owner.ownerProfile?.region ??
        provinceSlugFromPostalCode(owner.ownerProfile?.postalCode ?? '') ??
        null,
      petsInfo: owner.ownerProfile?.petsInfo ?? null,
    },
  }))

  const caregiversPayload = caregivers.map((caregiver) => {
    let services: string[] = []
    let workRegions: string[] = []
    try {
      services = JSON.parse(caregiver.caregiverProfile?.services || '[]')
      if (!Array.isArray(services)) services = []
    } catch {
      services = []
    }
    try {
      workRegions = JSON.parse(caregiver.caregiverProfile?.workRegions || '[]')
      if (!Array.isArray(workRegions)) workRegions = []
    } catch {
      workRegions = []
    }

    return {
      id: caregiver.id,
      name: `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email,
      email: caregiver.email,
      phone: caregiver.phone ?? null,
      createdAt: caregiver.createdAt,
      profile: {
        city: caregiver.caregiverProfile?.city ?? null,
        postalCode: caregiver.caregiverProfile?.postalCode ?? null,
        region:
          caregiver.caregiverProfile?.region ??
          provinceSlugFromPostalCode(caregiver.caregiverProfile?.postalCode ?? '') ??
          null,
        workRegions,
        services,
        companyName: caregiver.caregiverProfile?.companyName ?? null,
        enterpriseNumber: caregiver.caregiverProfile?.enterpriseNumber ?? null,
        isSelfEmployed: caregiver.caregiverProfile?.isSelfEmployed ?? null,
        hasLiabilityInsurance: caregiver.caregiverProfile?.hasLiabilityInsurance ?? null,
        liabilityInsuranceCompany: caregiver.caregiverProfile?.liabilityInsuranceCompany ?? null,
        liabilityInsurancePolicyNumber: caregiver.caregiverProfile?.liabilityInsurancePolicyNumber ?? null,
        isApproved: caregiver.caregiverProfile?.isApproved ?? null,
        isActive: caregiver.caregiverProfile?.isActive ?? null,
      },
    }
  })

  return NextResponse.json({ owners: ownersPayload, caregivers: caregiversPayload })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { userId } = body as { userId?: string }
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/users', e)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
