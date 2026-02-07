import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { consumePasswordResetToken } from '@/lib/passwordReset'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = z
      .object({
        token: z.string().min(1),
        password: z.string().min(8, 'Wachtwoord moet minimaal 8 karakters zijn'),
      })
      .safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message ?? 'Token en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const userId = await consumePasswordResetToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Ongeldige of verlopen reset link' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Wachtwoord succesvol gereset'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




