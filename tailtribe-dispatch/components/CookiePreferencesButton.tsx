'use client'

import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type Props = {
  className?: string
}

export function CookiePreferencesButton({ className }: Props) {
  const reset = () => {
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY)
      // Force reload so banners/analytics re-evaluate immediately.
      window.location.reload()
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={reset}
      className={
        className ??
        'mt-2 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50'
      }
    >
      Cookievoorkeuren wijzigen
    </button>
  )
}

