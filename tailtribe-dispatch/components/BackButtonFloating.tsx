'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { routes } from '@/lib/routes'

export function BackButtonFloating() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  // Toon de knop niet op home
  const show = useMemo(() => pathname && pathname !== '/', [pathname])

  if (!show) return null

  const fallbackHref = (() => {
    const role = session?.user?.role
    if (role === 'ADMIN') return '/admin'
    if (role === 'OWNER') return '/dashboard/owner'
    if (role === 'CAREGIVER') return '/dashboard/caregiver'
    // Public fallback should never be a generic home redirect (avoids "random" jumps to /).
    return routes.diensten
  })()

  const handleBack = () => {
    // In mobile browsers it’s common to open a page in a new tab, so `router.back()`
    // would send users to the homepage or even off-site. Prefer "real" in-app back,
    // otherwise fall back to a sensible dashboard for logged-in users.
    try {
      const idx = (window.history.state as any)?.idx
      const ref = document.referrer || ''
      const sameOriginRef = (() => {
        if (!ref) return false
        try {
          return new URL(ref).origin === window.location.origin
        } catch {
          return false
        }
      })()

      if (typeof idx === 'number' && idx > 0 && sameOriginRef) {
        router.back()
        return
      }
    } catch {
      // ignore and use fallback
    }

    if (fallbackHref && fallbackHref !== pathname) {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Ga terug"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 md:bottom-auto md:left-auto md:top-32 md:right-10 z-[1200] inline-flex items-center justify-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition h-11 w-11 md:w-auto px-0 md:px-0 rounded-full bg-white/90 backdrop-blur border border-emerald-200 shadow-sm md:h-auto md:justify-start md:rounded-none md:bg-transparent md:backdrop-blur-0 md:border-0 md:shadow-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 fill-current">
        <path
          fillRule="evenodd"
          d="M11.53 3.47a.75.75 0 0 1 0 1.06L7.06 9l4.47 4.47a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="hidden md:inline">Vorige</span>
    </button>
  )
}
