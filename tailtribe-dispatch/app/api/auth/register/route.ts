import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkRateLimit } from '@/lib/rate-limit'

function normalizeEmail(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function toSafeErrorResponse(err: any) {
  const code = typeof err?.code === 'string' ? err.code : undefined
  // Keep messages user-friendly and avoid leaking internals.
  // We *do* include a short code so you can quickly diagnose production issues.
  const mapped: Record<string, string> = {
    P2002: 'Dit e-mailadres is al geregistreerd.',
    P2021: 'Database probleem (tabel ontbreekt). Probeer later opnieuw.',
    P2022: 'Database probleem (kolom ontbreekt). Probeer later opnieuw.',
    P1001: 'Database is niet bereikbaar. Probeer later opnieuw.',
    P1002: 'Database timeout. Probeer later opnieuw.',
  }
  const message = code ? mapped[code] ?? 'Er ging iets mis bij de registratie.' : 'Er ging iets mis bij de registratie.'
  return { message, code }
}

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
    const emailNormalized = normalizeEmail(email)

    // Validatie
    if (!emailNormalized || !password || !firstName || !lastName || !role) {
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
    const existingUser = await prisma.user.findUnique({ where: { email: emailNormalized } })
      .catch(() => null)
      ?? (await prisma.user.findFirst({
          where: { email: { equals: emailNormalized } },
        }))

    if (existingUser) {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al geregistreerd' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user/profile/token atomically (prevents "half registered" users).
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: emailNormalized,
          passwordHash,
          firstName: String(firstName).trim(),
          lastName: String(lastName).trim(),
          phone: phone ? String(phone).trim() : null,
          role,
          // Production hotfix: don't require email verification to use the product.
          // Email delivery can be flaky/misconfigured; registration must stay usable.
          emailVerified: new Date(),
        },
      })

      if (role === 'OWNER') {
        await tx.ownerProfile.create({
          data: {
            userId: createdUser.id,
            city: String(city).trim(),
            postalCode: String(postalCode).trim(),
            region: region ? String(region).trim() : null,
            address: String(address).trim(),
          },
        })
      }

      return createdUser
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Account aangemaakt. Je kan nu meteen inloggen.',
    })
  } catch (error) {
    try {
      ;(globalThis as any).__tt_last_register_error = {
        at: new Date().toISOString(),
        name: (error as any)?.name ?? null,
        code: (error as any)?.code ?? null,
        message: (error as any)?.message ?? String(error),
        // keep it short
        stack: String((error as any)?.stack ?? '').slice(0, 1500) || null,
      }
    } catch {
      // ignore
    }
    console.error('Registration error:', error)
    const safe = toSafeErrorResponse(error)
    return NextResponse.json(
      {
        error: safe.code ? `${safe.message} (code: ${safe.code})` : safe.message,
      },
      { status: 500 }
    )
  }
}
