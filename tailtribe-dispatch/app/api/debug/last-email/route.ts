import { NextRequest, NextResponse } from 'next/server'

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return (m?.[1] ?? '').trim()
}

export async function GET(req: NextRequest) {
  const key = String(process.env.RESET_PASSWORD_ADMIN_KEY ?? '').trim()
  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const token = getBearerToken(req)
  if (!token || token !== key) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = (globalThis as any).__tt_last_email_status ?? null
  return NextResponse.json({ status }, { status: 200 })
}

