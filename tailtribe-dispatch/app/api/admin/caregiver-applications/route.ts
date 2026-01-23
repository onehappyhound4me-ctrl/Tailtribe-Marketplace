import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

export async function GET() {
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasUpstash()) {
      try {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
        const res = await fetch(new URL('/api/caregiver-applications', base).toString(), { cache: 'no-store' })
        const data = await res.json().catch(() => [])
        return NextResponse.json(Array.isArray(data) ? data : [])
      } catch {
        return NextResponse.json([], { status: 200 })
      }
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    if (hasUpstash()) {
      await upstashCmd(['DEL', `tt:caregiver_app:${id}`])
      await upstashCmd(['LREM', 'tt:caregiver_app:ids', 0, id])
    } else {
      const apps = readApplicationsFromFile()
      const filtered = apps.filter((a) => a.id !== id)
      writeApplicationsToFile(filtered)
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete caregiver application' }, { status: 500 })
  }
}


