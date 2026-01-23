import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rate = await checkRateLimit(`register:${ip}`, 5, 10 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Te veel registraties. Probeer later opnieuw.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName, phone, role, address, city, postalCode, region, acceptTerms } = body

    // Validatie
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in' },
        { status: 400 }
      )
    }

    if (!['OWNER', 'CAREGIVER'].includes(role)) {
      return NextResponse.json(
        { error: 'Ongeldige rol' },
        { status: 400 }
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'Je moet akkoord gaan met de algemene voorwaarden' },
        { status: 400 }
      )
    }

    if (role === 'OWNER') {
      if (!address || !String(address).trim() || !city || !String(city).trim() || !postalCode || !String(postalCode).trim()) {
        return NextResponse.json(
          { error: 'Vul je volledige thuisadres in' },
          { status: 400 }
        )
      }
      if (!/^\d{4}$/.test(String(postalCode).trim())) {
        return NextResponse.json(
          { error: 'Vul een geldige Belgische postcode (4 cijfers) in' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al geregistreerd' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role,
        emailVerified: null, // Not verified yet
      },
    })

    if (role === 'OWNER') {
      await prisma.ownerProfile.create({
        data: {
          userId: user.id,
          city: String(city).trim(),
          postalCode: String(postalCode).trim(),
          region: region ? String(region).trim() : null,
          address: String(address).trim(),
        },
      })
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Valid for 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        userId: user.id,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, token)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Controleer je email voor verificatie',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij de registratie' },
      { status: 500 }
    )
  }
}
