import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { userId, role } = body as { userId?: string; role?: 'OWNER' | 'CAREGIVER' }
  if (!userId || (role !== 'OWNER' && role !== 'CAREGIVER')) {
    return NextResponse.json({ error: 'Ongeldige data' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  if (!user || user.role !== role) {
    return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
  }

  const res = NextResponse.json({ success: true })
  const secure = process.env.NODE_ENV === 'production'
  res.cookies.set('impersonateRole', role, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
  res.cookies.set('impersonateUserId', userId, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
  return res
}
