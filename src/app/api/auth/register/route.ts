import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
  firstName: z.string().min(2, 'Voornaam moet minimaal 2 karakters zijn'),
  lastName: z.string().min(2, 'Achternaam moet minimaal 2 karakters zijn'),
  role: z.enum(['OWNER', 'CAREGIVER']).default('OWNER'),
  referralCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Een account met dit email adres bestaat al' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        name: `${validated.firstName} ${validated.lastName}`, // Keep full name for backward compatibility
        role: validated.role,
        referredBy: validated.referralCode || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    })

    return NextResponse.json({
      user,
      message: 'Account succesvol aangemaakt. Je kunt nu inloggen.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het aanmaken van je account' },
      { status: 500 }
    )
  }
}




