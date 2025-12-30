import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type CaregiverApplicationRecord = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  services: string[]
  experience: string
  message?: string
  createdAt: string
  updatedAt: string
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
    const body = await request.json().catch(() => ({}))
    const id = String(body?.id ?? '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await upstashCmd(['DEL', `tt:caregiver_app:${id}`])
    await upstashCmd(['LREM', 'tt:caregiver_app:ids', 0, id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete caregiver application' }, { status: 500 })
  }
}


