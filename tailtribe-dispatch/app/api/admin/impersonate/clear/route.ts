import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('impersonateRole', '', { path: '/', maxAge: 0 })
  res.cookies.set('impersonateUserId', '', { path: '/', maxAge: 0 })
  return res
}
