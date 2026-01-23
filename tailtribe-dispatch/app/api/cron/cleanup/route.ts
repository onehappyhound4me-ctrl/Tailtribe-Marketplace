import { NextRequest, NextResponse } from 'next/server'
import { runRetentionCleanup } from '@/lib/cleanup'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.DISPATCH_CRON_SECRET
  const provided = req.headers.get('x-cron-secret') ?? ''
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const daysParam = searchParams.get('days')
  const days = Math.max(1, Math.min(365, Math.round(Number(daysParam ?? 30))))

  const result = await runRetentionCleanup(days)
  return NextResponse.json({ success: true, ...result })
}
