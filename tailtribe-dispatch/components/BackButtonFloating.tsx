'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { routes } from '@/lib/routes'

export function BackButtonFloating() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const storageKeyPrev = 'tt_prev_path'
  const storageKeyLast = 'tt_last_path'
  const lastRecordedRef = useRef<string | null>(null)
  const fullPathRef = useRef<string>('')

  useEffect(() => {
    if (!pathname) return
    // Avoid `useSearchParams()` here: it requires a Suspense boundary and can break prerendering.
    // Reading from `window.location` is safe because this effect only runs on the client.
    const currentFullPath = `${window.location.pathname}${window.location.search ?? ''}`
    fullPathRef.current = currentFullPath
    // Avoid double-writes in React strict mode / rapid rerenders.
    if (lastRecordedRef.current === currentFullPath) return
    lastRecordedRef.current = currentFullPath
    try {
      const last = window.sessionStorage.getItem(storageKeyLast)
      if (last && last !== currentFullPath) {
        window.sessionStorage.setItem(storageKeyPrev, last)
      }
      window.sessionStorage.setItem(storageKeyLast, currentFullPath)
    } catch {
      // ignore
    }
  }, [pathname])

  // Toon de knop niet op home
  const show = Boolean(pathname && pathname !== '/')
  if (!show) return null

  const fallbackHref = (() => {
    const role = session?.user?.role
    if (role === 'ADMIN') return '/admin'
    if (role === 'OWNER') return '/dashboard/owner'
    if (role === 'CAREGIVER') return '/dashboard/caregiver'
    // Public fallback: prefer home (better than jumping to /diensten).
    return '/'
  })()

  const handleBack = () => {
    // In mobile browsers it’s common to open a page in a new tab, so `router.back()`
    // would send users to the homepage or even off-site. Prefer "real" in-app back,
    // otherwise fall back to a sensible dashboard for logged-in users.
    try {
      const idx = (window.history.state as any)?.idx
      // `document.referrer` is often empty for SPA navigations, so don't rely on it.
      // Next.js app-router sets `history.state.idx` for in-app navigations; if it's > 0,
      // we have something meaningful to go back to (e.g. Home after CTA click).
      if (typeof idx === 'number' && idx > 0) {
        router.back()
        return
      }
    } catch {
      // ignore and use fallback
    }

    // If history back isn't available (new tab, direct visit), fall back to the last in-app page.
    try {
      const prev = window.sessionStorage.getItem(storageKeyPrev)
      const current = fullPathRef.current || `${window.location.pathname}${window.location.search ?? ''}`
      if (prev && prev !== current) {
        router.push(prev)
        return
      }
    } catch {
      // ignore
    }

    if (fallbackHref && fallbackHref !== pathname) router.push(fallbackHref)
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
