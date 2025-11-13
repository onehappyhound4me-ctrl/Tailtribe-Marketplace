import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Huidig wachtwoord is verplicht'),
  newPassword: z.string().min(8, 'Nieuw wachtwoord moet minimaal 8 karakters zijn'),
  confirmPassword: z.string().min(1, 'Bevestig wachtwoord is verplicht'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Nieuwe wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om je wachtwoord te wijzigen' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = changePasswordSchema.parse(body)

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Je account heeft geen wachtwoord. Log in met Google om je account te beheren.' },
        { status: 400 }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validated.currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Huidig wachtwoord is onjuist' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Wachtwoord succesvol gewijzigd!'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het wijzigen van je wachtwoord' },
      { status: 500 }
    )
  }
}

