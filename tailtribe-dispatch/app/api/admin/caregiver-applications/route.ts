import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createNotification } from '@/lib/notifications'
import { sendCaregiverApprovedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  isSelfEmployed?: boolean
  hasLiabilityInsurance?: boolean
  liabilityInsuranceCompany?: string
  liabilityInsurancePolicyNumber?: string
  services: string[]
  experience: string
  message?: string
  createdAt: string
  updatedAt: string
}

function ensureAdmin(session: any) {
  return session && session.user?.role === 'ADMIN'
}

function parseJsonArray(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed.map((x) => String(x)) : []
  } catch {
    return []
  }
}

export async function GET() {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
          createdAt: true,
          updatedAt: true,
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
    experience: cg.experience ?? '',
    message: cg.bio ?? undefined,
    createdAt: cg.createdAt.toISOString(),
    updatedAt: cg.updatedAt.toISOString(),
  }))

  return NextResponse.json(payload)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '').trim()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id },
      include: { caregiverProfile: true },
    })
    if (!user || !user.caregiverProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (user.caregiverProfile.isApproved) {
      return NextResponse.json({ error: 'Already approved' }, { status: 409 })
    }

    const shouldGeneratePassword = !user.passwordHash
    const tempPassword = shouldGeneratePassword ? crypto.randomBytes(12).toString('base64url') : null
    const passwordHash = tempPassword ? await bcrypt.hash(tempPassword, 10) : null

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          role: 'CAREGIVER',
          passwordHash: passwordHash ?? undefined,
          emailVerified: new Date(),
        },
      })
      await tx.caregiverProfile.update({
        where: { userId: user.id },
        data: { isApproved: true, isActive: true },
      })
    })

    // Notify caregiver (best-effort; never block approval)
    try {
      const caregiverName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'verzorger'
      await createNotification({
        userId: user.id,
        type: 'ACCOUNT',
        title: 'Je bent goedgekeurd',
        message: 'Je verzorger-account is nu actief. Log in om je dashboard te bekijken.',
        entityId: user.id,
      })
      if (user.email) {
        await sendCaregiverApprovedEmail({
          caregiverEmail: user.email,
          caregiverName,
          tempPassword,
        })
      }
    } catch (notifyErr) {
      console.error('Failed to notify caregiver on approval', notifyErr)
    }

    return NextResponse.json({ success: true, userId: user.id, tempPassword })
  } catch (e) {
    console.error('POST /api/admin/caregiver-applications', e)
    return NextResponse.json({ error: 'Failed to approve caregiver application' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const id = String(body?.id ?? '').trim()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id }, include: { caregiverProfile: true } })
  if (!user || !user.caregiverProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (user.caregiverProfile.isApproved) {
    return NextResponse.json({ error: 'Cannot delete an approved caregiver via applications endpoint' }, { status: 409 })
  }

  await prisma.user.delete({ where: { id: user.id } })
  return NextResponse.json({ success: true })
}
