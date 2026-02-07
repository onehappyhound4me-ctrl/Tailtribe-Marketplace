import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`change-password:${session.user.id}:${ip}`, 10, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Te veel pogingen. Probeer later opnieuw.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const currentPassword = String(body?.currentPassword ?? '')
  const newPassword = String(body?.newPassword ?? '')

  if (!currentPassword) {
    return NextResponse.json({ error: 'Vul je huidig wachtwoord in.' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Nieuw wachtwoord moet minimaal 6 karakters lang zijn.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Gebruiker niet gevonden.' }, { status: 404 })
  }
  if (!user.passwordHash) {
    return NextResponse.json(
      { error: 'Dit account heeft geen wachtwoord ingesteld. Gebruik “wachtwoord reset”.' },
      { status: 400 }
    )
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Huidig wachtwoord is niet correct.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  return NextResponse.json({ success: true })
}

