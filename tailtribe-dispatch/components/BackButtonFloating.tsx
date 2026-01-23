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
      className="fixed top-28 right-5 md:top-32 md:right-10 z-[1200] inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
    >
      ← Vorige
    </button>
  )
}
