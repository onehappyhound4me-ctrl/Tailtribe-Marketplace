import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { userId } = body as { userId?: string }
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const anonymizedEmail = `anon+${existing.id}@tailtribe.local`

  try {
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.verificationToken.deleteMany({ where: { identifier: existing.email } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          firstName: 'Anoniem',
          lastName: '',
          phone: null,
          image: null,
          emailVerified: null,
          passwordHash: null,
        },
      }),
      prisma.ownerProfile.updateMany({
        where: { userId },
        data: {
          address: null,
          city: 'Onbekend',
          postalCode: '0000',
          region: null,
          petsInfo: null,
        },
      }),
      prisma.caregiverProfile.updateMany({
        where: { userId },
        data: {
          city: 'Onbekend',
          postalCode: '0000',
          region: null,
          workRegions: '[]',
          services: '[]',
          servicePricing: null,
          companyName: null,
          enterpriseNumber: null,
          isSelfEmployed: false,
          hasLiabilityInsurance: false,
          liabilityInsuranceCompany: null,
          liabilityInsurancePolicyNumber: null,
          isApproved: false,
          isActive: false,
          bio: null,
          experience: '',
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/admin/users/anonymize', e)
    return NextResponse.json({ error: 'Failed to anonymize user' }, { status: 500 })
  }
}
