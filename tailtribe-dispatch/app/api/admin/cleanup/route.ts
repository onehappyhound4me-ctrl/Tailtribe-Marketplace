import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runRetentionCleanup } from '@/lib/cleanup'

export const dynamic = 'force-dynamic'

function ensureAdmin(session: any) {
  return session && session.user?.role === 'ADMIN'
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const days = Math.max(1, Math.min(365, Math.round(Number(body?.days ?? 30))))
  const result = await runRetentionCleanup(days)

  return NextResponse.json({ success: true, ...result })
}
