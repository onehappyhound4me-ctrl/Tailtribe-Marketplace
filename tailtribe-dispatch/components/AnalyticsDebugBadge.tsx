'use client'

import { useEffect, useMemo, useState } from 'react'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type Status = {
  show: boolean
  consent: string | null
  hasGaId: boolean
  gaId: string | null
  gtagType: string
  gtagScriptPresent: boolean
}

export function AnalyticsDebugBadge() {
  const gaId = (process.env.NEXT_PUBLIC_GA_ID ?? '').trim()
  const hasGaId = Boolean(gaId)

  const [status, setStatus] = useState<Status>({
    show: false,
    consent: null,
    hasGaId,
    gaId: hasGaId ? gaId : null,
    gtagType: 'undefined',
    gtagScriptPresent: false,
  })

  const shouldShow = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('debugga')
  }, [])

  useEffect(() => {
    if (!shouldShow) return

    const read = () => {
      const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
      const gtagType = typeof (window as any).gtag
      const gtagScriptPresent = Boolean(
        document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
      )
      setStatus({
        show: true,
        consent,
        hasGaId,
        gaId: hasGaId ? gaId : null,
        gtagType,
        gtagScriptPresent,
      })
    }

    read()
    const id = window.setInterval(read, 1000)
    return () => window.clearInterval(id)
  }, [shouldShow, hasGaId, gaId])

  if (!status.show) return null

  return (
    <div className="fixed top-3 right-3 z-[3000] rounded-xl border border-gray-200 bg-white/90 backdrop-blur px-3 py-2 shadow-sm text-xs text-gray-800">
      <div className="font-semibold text-gray-900">Analytics debug</div>
      <div className="mt-1 space-y-0.5">
        <div>
          GA env: <span className="font-mono">{status.hasGaId ? 'OK' : 'MISSING'}</span>
        </div>
        <div>
          consent: <span className="font-mono">{String(status.consent)}</span>
        </div>
        <div>
          gtag: <span className="font-mono">{status.gtagType}</span>
        </div>
        <div>
          gtag.js: <span className="font-mono">{status.gtagScriptPresent ? 'loaded' : 'not-loaded'}</span>
        </div>
      </div>
    </div>
  )
}

