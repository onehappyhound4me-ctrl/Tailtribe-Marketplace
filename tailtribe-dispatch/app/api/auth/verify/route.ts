import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')?.trim()

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl))
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl))
  }

  if (record.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null)
    return NextResponse.redirect(new URL('/login?error=token_expired', baseUrl))
  }

  const userId = record.userId
  if (!userId) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null)
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl))
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
    select: { email: true, firstName: true },
  })

  await prisma.verificationToken.delete({ where: { token } }).catch(() => null)
  await sendWelcomeEmail(user.email, user.firstName ?? 'daar')

  return NextResponse.redirect(new URL('/login?verified=1', baseUrl))
}
