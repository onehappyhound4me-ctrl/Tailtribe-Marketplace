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
