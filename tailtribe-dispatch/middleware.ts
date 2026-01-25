import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = (req.headers.get('host') ?? '').toLowerCase()

  // Always allow static files (images, videos, source maps, etc.).
  // Otherwise middleware may redirect asset requests to /login (e.g. /tailtribe_logo_*.png),
  // which makes images "disappear" on mobile Safari.
  if (/\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|map|mp4|webm)$/i.test(pathname)) {
    return NextResponse.next()
  }

  // Always redirect to the canonical host (no www).
  // This prevents "www" from pointing at an older deployment (favicon/logo issues),
  // and keeps a single canonical domain for SEO/caching.
  if (
    host === 'www.tailtribe.be' ||
    host === 'tailtribe.nl' ||
    host === 'www.tailtribe.nl'
  ) {
    const url = new URL(req.url)
    url.hostname = 'tailtribe.be'
    url.protocol = 'https:'
    url.host = 'tailtribe.be'
    return NextResponse.redirect(url, 308)
  }
  const impersonateRole = req.cookies.get('impersonateRole')?.value
  const impersonateUserId = req.cookies.get('impersonateUserId')?.value

  // Edge-safe: avoid importing Node-only modules via lib/auth.ts (bcrypt).
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  }).catch(() => null)
  const role = (token as any)?.role as string | undefined
  const userId = (token as any)?.id as string | undefined
  const isAuthed = Boolean(token && userId)

  const isImpersonating = role === 'ADMIN' && impersonateRole && impersonateUserId

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Public routes (no auth needed)
  const publicRoutes = [
    // NOTE: '/' must be handled as exact match (otherwise every pathname startsWith('/') and everything becomes public)
    '/login',
    '/register',
    '/boeken',
    '/bedankt',
    '/verzorger-aanmelden',
    '/verzorger-aanmelden/bedankt',
    '/diensten',
    '/blog',
    '/over-ons',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/cookies',
  ]

  const isPublicRoute =
    pathname === '/' ||
    publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isPublicApi = pathname === '/api/auth/register' || pathname === '/api/bookings'

  // Allow public routes
  if (isPublicRoute || isPublicApi) {
    return NextResponse.next()
  }

  // Admin routes: always require admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isAuthed || role !== 'ADMIN') {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protected routes - require authentication
  if (!isAuthed) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Community: only CAREGIVER or ADMIN
  if (pathname.startsWith('/community')) {
    if (role !== 'CAREGIVER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Caregiver routes - only CAREGIVER
  if (pathname.startsWith('/dashboard/caregiver')) {
    if (role !== 'CAREGIVER') {
      if (isImpersonating && impersonateRole === 'CAREGIVER') {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Owner routes - only OWNER
  if (pathname.startsWith('/dashboard/owner')) {
    if (role !== 'OWNER') {
      if (isImpersonating && impersonateRole === 'OWNER') {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Generic /dashboard - redirect based on role
  if (pathname === '/dashboard') {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    if (role === 'CAREGIVER') {
      return NextResponse.redirect(new URL('/dashboard/caregiver', req.url))
    }
    if (role === 'OWNER') {
      return NextResponse.redirect(new URL('/dashboard/owner', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/|favicon.ico|assets/|api/auth|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|map|mp4|webm)$).*)',
  ],
}


