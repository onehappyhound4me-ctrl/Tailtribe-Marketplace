import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createTwoFactorToken } from '@/lib/twoFactor'
import { sendTwoFactorCodeEmail } from '@/lib/email-notifications'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = requestSchema.parse(body)

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        name: true,
      },
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ongeldige inloggegevens' },
        { status: 401 }
      )
    }

    const { code, expires } = await createTwoFactorToken(user.id)

    await sendTwoFactorCodeEmail({
      email: user.email,
      name: user.firstName || user.name,
      code,
      expiresAt: expires,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Controleer je gegevens en probeer opnieuw.' },
        { status: 400 }
      )
    }

    console.error('Error creating 2FA code:', error)
    return NextResponse.json(
      { error: 'Het versturen van de code is mislukt. Probeer opnieuw.' },
      { status: 500 }
    )
  }
}

