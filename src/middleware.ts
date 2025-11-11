import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting using in-memory store (for production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Domain-based country routing
  const isNLDomain = hostname.includes('tailtribe.nl')
  const isBEDomain = hostname.includes('tailtribe.be')
  
  // If on NL domain and path starts with /nl, remove the prefix
  if (isNLDomain && pathname.startsWith('/nl')) {
    const newPath = pathname.replace(/^\/nl/, '') || '/'
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return NextResponse.redirect(url)
  }
  
  // If on BE domain and accessing root, ensure it's BE (no /nl prefix needed)
  // This is handled by the app structure already

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // More strict limits for auth routes (increased for development)
    const limit = pathname.startsWith('/api/auth/') ? 100 : 1000
    
    if (!rateLimit(ip, limit)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Protected routes - require authentication
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/booking',
    '/messages',
    '/settings',
    '/reviews',
  ]

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Redirect /dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      if (token.role === 'CAREGIVER') {
        url.pathname = '/dashboard/caregiver'
      } else if (token.role === 'OWNER') {
        url.pathname = '/dashboard/owner'
      } else if (token.role === 'ADMIN') {
        url.pathname = '/admin'
      } else {
        url.pathname = '/dashboard/owner' // fallback
      }
      return NextResponse.redirect(url)
    }

    // Admin only routes
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CORS for API routes (if needed)
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
