'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type ConsentValue = 'accepted' | 'declined'

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored)
      return
    }
    setConsent(null)
  }, [])

  if (consent) return null

  const handleChoice = (value: ConsentValue) => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value)
    setConsent(value)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[2000]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-emerald-100 bg-white shadow-lg px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-700">
          We gebruiken enkel essentiële cookies om de site correct te laten werken. Voor analytische cookies vragen we eerst
          toestemming.{' '}
          <Link href="/cookies" className="text-emerald-700 hover:underline">
            Lees meer
          </Link>
          .
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleChoice('declined')}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Weigeren
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Akkoord
          </button>
        </div>
      </div>
    </div>
  )
}
