'use client'

import { useEffect } from 'react'

type ServiceNavMeta = {
  component?: string | null
  slug?: string | null
  serviceId?: string | null
}

function buildServiceNavError(meta: ServiceNavMeta, hrefAttr: string | null) {
  const component = meta.component || 'unknown'
  const slug = meta.slug || 'unknown'
  const serviceId = meta.serviceId || 'unknown'
  const href = hrefAttr ?? '(missing href)'
  return new Error(
    `[TailTribe][navigation] Service link resolved to "/" on click.\n` +
      `component=${component}\n` +
      `slug=${slug}\n` +
      `serviceId=${serviceId}\n` +
      `hrefAttr=${href}\n`
  )
}

export function NavigationClickGuards() {
  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      // Only care about left-clicks. Let middle-click / ctrl-click open in new tab without interfering.
      if (event.button !== 0) return
      if (event.defaultPrevented) return

      const target = event.target as HTMLElement | null
      if (!target) return

      const a = target.closest('a[data-nav="service"]') as HTMLAnchorElement | null
      if (!a) return

      const hrefAttr = a.getAttribute('href')
      if (hrefAttr !== '/') return

      const meta: ServiceNavMeta = {
        component: a.getAttribute('data-component'),
        slug: a.getAttribute('data-service-slug'),
        serviceId: a.getAttribute('data-service-id'),
      }

      if (process.env.NODE_ENV !== 'production') {
        // Hard fail in development so we catch this immediately.
        throw buildServiceNavError(meta, hrefAttr)
      }

      // In production, never throw from a click handler; warn so it shows up in logs/monitoring.
      // eslint-disable-next-line no-console
      console.warn('[TailTribe][navigation] Service link resolved to "/" on click', {
        ...meta,
        hrefAttr,
        pathname: window.location.pathname,
      })
    }

    document.addEventListener('click', onClickCapture, { capture: true })
    return () => document.removeEventListener('click', onClickCapture, { capture: true } as any)
  }, [])

  return null
}

