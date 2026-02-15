'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  fallbackHref?: string
  className?: string
  ariaLabel?: string
  children?: React.ReactNode
}

function safeDecodeURIComponent(v: string) {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

function isSafeInternalPath(v: string) {
  const s = String(v ?? '').trim()
  if (!s) return false
  if (!s.startsWith('/')) return false
  if (s.startsWith('//')) return false
  if (s.includes('://')) return false
  if (s.includes('\\')) return false
  if (s.includes('\n') || s.includes('\r')) return false
  return true
}

export function BackButton({
  fallbackHref = '/',
  className,
  ariaLabel = 'Ga terug',
  children,
}: Props) {
  const router = useRouter()

  const onClick = useCallback(() => {
    // Highest priority: explicit "from" (internal only).
    try {
      const fromRaw = new URLSearchParams(window.location.search).get('from') || ''
      const from = safeDecodeURIComponent(fromRaw)
      if (from && isSafeInternalPath(from) && from !== window.location.pathname + window.location.search) {
        router.push(from)
        return
      }
    } catch {
      // ignore
    }

    // Prefer real browser history when available.
    try {
      const idx = (window.history.state as any)?.idx
      if (typeof idx === 'number' && idx > 0) {
        router.back()
        return
      }
      if (window.history.length > 1) {
        router.back()
        return
      }
    } catch {
      // ignore
    }

    // Fallback when opened directly / in a new tab.
    if (fallbackHref && isSafeInternalPath(fallbackHref)) {
      const current = `${window.location.pathname}${window.location.search ?? ''}`
      if (fallbackHref !== current) router.push(fallbackHref)
    }
  }, [router, fallbackHref])

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={className}>
      {children ?? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path
            fillRule="evenodd"
            d="M11.53 3.47a.75.75 0 0 1 0 1.06L7.06 9l4.47 4.47a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}

