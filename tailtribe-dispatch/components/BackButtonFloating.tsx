'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'

export function BackButtonFloating() {
  const router = useRouter()
  const pathname = usePathname()

  // Toon de knop niet op home
  const show = useMemo(() => pathname && pathname !== '/', [pathname])

  if (!show) return null

  return (
    <button
      onClick={() => router.back()}
      aria-label="Ga terug"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 md:bottom-auto md:left-auto md:top-32 md:right-10 z-[1200] inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition h-11 px-4 rounded-full bg-white/90 backdrop-blur border border-emerald-200 shadow-sm md:h-auto md:px-0 md:rounded-none md:bg-transparent md:backdrop-blur-0 md:border-0 md:shadow-none"
    >
      ← Vorige
    </button>
  )
}
