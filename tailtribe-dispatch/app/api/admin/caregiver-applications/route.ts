import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createNotification } from '@/lib/notifications'
import { sendCaregiverApprovedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DATA_FILE = path.join(process.cwd(), 'data', 'caregiver-applications.json')

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

async function getApplicationById(id: string): Promise<CaregiverApplicationRecord | null> {
  if (hasUpstash()) {
    const raw = await upstashCmd<string | null>(['GET', `tt:caregiver_app:${id}`])
    if (!raw) return null
    try {
      return JSON.parse(raw) as CaregiverApplicationRecord
    } catch {
      return null
    }
  }
  const apps = readApplicationsFromFile()
  return apps.find((a) => a.id === id) ?? null
}

async function deleteApplicationById(id: string) {
  if (hasUpstash()) {
    await upstashCmd(['DEL', `tt:caregiver_app:${id}`])
    await upstashCmd(['LREM', 'tt:caregiver_app:ids', 0, id])
    return
  }
  const apps = readApplicationsFromFile()
  const filtered = apps.filter((a) => a.id !== id)
  writeApplicationsToFile(filtered)
}

export async function GET() {
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasUpstash()) {
      return NextResponse.json(readApplicationsFromFile(), { status: 200 })
    }
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
    return NextResponse.json({ error: 'Failed to fetch caregiver applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const app = await getApplicationById(id)
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const email = String(app.email ?? '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.role !== 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Email bestaat al als ander type gebruiker (geen verzorger).' },
        { status: 409 }
      )
    }

    const isNewUser = !existing
    const tempPassword = isNewUser ? crypto.randomBytes(12).toString('base64url') : null
    const passwordHash = tempPassword ? await bcrypt.hash(tempPassword, 10) : null

    const user =
      existing ??
      (await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'CAREGIVER',
          firstName: String(app.firstName ?? '').trim() || 'Verzorger',
          lastName: String(app.lastName ?? '').trim() || '',
          phone: String(app.phone ?? '').trim() || null,
          emailVerified: new Date(),
        },
      }))

    // Ensure caregiver profile exists and is approved/active.
    const services = Array.isArray(app.services) ? app.services : []
    const workRegions: string[] = []
    const experience = String(app.experience ?? '').trim()
    const bio = String(app.message ?? '').trim() || null

    await prisma.caregiverProfile.upsert({
      where: { userId: user.id },
      update: {
        city: String(app.city ?? '').trim() || 'Onbekend',
        postalCode: String(app.postalCode ?? '').trim() || '0000',
        region: null,
        workRegions: JSON.stringify(workRegions),
        companyName: String(app.companyName ?? '').trim() || null,
        enterpriseNumber: String(app.enterpriseNumber ?? '').trim() || null,
        isSelfEmployed: Boolean(app.isSelfEmployed),
        hasLiabilityInsurance: Boolean(app.hasLiabilityInsurance),
        liabilityInsuranceCompany: String(app.liabilityInsuranceCompany ?? '').trim() || null,
        liabilityInsurancePolicyNumber: String(app.liabilityInsurancePolicyNumber ?? '').trim() || null,
        services: JSON.stringify(services),
        experience: experience || '—',
        bio,
        isApproved: true,
        isActive: true,
      },
      create: {
        userId: user.id,
        city: String(app.city ?? '').trim() || 'Onbekend',
        postalCode: String(app.postalCode ?? '').trim() || '0000',
        region: null,
        workRegions: JSON.stringify(workRegions),
        companyName: String(app.companyName ?? '').trim() || null,
        enterpriseNumber: String(app.enterpriseNumber ?? '').trim() || null,
        isSelfEmployed: Boolean(app.isSelfEmployed),
        hasLiabilityInsurance: Boolean(app.hasLiabilityInsurance),
        liabilityInsuranceCompany: String(app.liabilityInsuranceCompany ?? '').trim() || null,
        liabilityInsurancePolicyNumber: String(app.liabilityInsurancePolicyNumber ?? '').trim() || null,
        services: JSON.stringify(services),
        experience: experience || '—',
        bio,
        isApproved: true,
        isActive: true,
      },
    })

    // Remove intake entry after conversion to avoid duplicates.
    await deleteApplicationById(id)

    // Notify caregiver (best-effort; never block approval)
    try {
      const caregiverName =
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'verzorger'
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
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await deleteApplicationById(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete caregiver application' }, { status: 500 })
  }
}


