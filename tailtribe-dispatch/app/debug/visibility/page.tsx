import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VisibilityDebugClient } from './visibility-client'

export const metadata: Metadata = {
  title: 'Visibility debug',
  description: 'Debugpagina voor SEO/analytics zichtbaarheid. Geen persoonlijke data.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function VisibilityDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Home" />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-tt border border-black/5 p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Visibility / SEO / Analytics debug</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Deze pagina helpt objectief te checken of <code className="font-mono">robots.txt</code>,{' '}
            <code className="font-mono">sitemap.xml</code> en analytics events werken. Geen login nodig.
          </p>
          <VisibilityDebugClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VisibilityDebugClient } from '@/components/VisibilityDebugClient'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/debug/visibility', appUrl).toString()

export const metadata: Metadata = {
  title: 'Visibility debug',
  description: 'Debugpagina voor SEO/analytics zichtbaarheid (robots, sitemap, events).',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Visibility debug',
    description: 'Debugpagina voor SEO/analytics zichtbaarheid (robots, sitemap, events).',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function VisibilityDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-10 sm:py-12 pb-20">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Visibility / SEO / Analytics debug</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
              Deze pagina toont objectief of <code className="font-mono">robots.txt</code> en{' '}
              <code className="font-mono">sitemap.xml</code> bereikbaar zijn, welke canonical base gebruikt wordt, en welke events
              in de browser getracked worden.
            </p>
            <div className="mt-3 text-sm text-gray-700">
              Snelle links:{' '}
              <Link href="/robots.txt" className="text-emerald-700 hover:underline">
                /robots.txt
              </Link>
              {' • '}
              <Link href="/sitemap.xml" className="text-emerald-700 hover:underline">
                /sitemap.xml
              </Link>
              {' • '}
              <Link href="/api/health/seo" className="text-emerald-700 hover:underline">
                /api/health/seo
              </Link>
            </div>
          </header>

          <VisibilityDebugClient />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type HealthPayload = any

function fmtTs(ts: number) {
  try {
    return new Date(ts).toLocaleString('nl-BE')
  } catch {
    return String(ts)
  }
}

function readUtm() {
  const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  const out: Record<string, string> = {}
  for (const k of keys) {
    const v = sp.get(k)
    if (v) out[k] = v
  }
  return out
}

export default function VisibilityDebugPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [build, setBuild] = useState<any | null>(null)
  const [tick, setTick] = useState(0)

  const utm = useMemo(() => (typeof window === 'undefined' ? {} : readUtm()), [])
  const referrer = useMemo(() => (typeof document === 'undefined' ? null : document.referrer || null), [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/health/seo', { cache: 'no-store' })
        const json = await res.json()
        if (alive) setHealth(json)
      } catch {
        // ignore
      }
    })()
    ;(async () => {
      try {
        const res = await fetch('/api/debug/build', { cache: 'no-store' })
        const json = await res.json()
        if (alive) setBuild(json)
      } catch {
        // ignore
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const consent = typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) : null
  const lastEvents = typeof window !== 'undefined' ? (window as any).__tt_last_events ?? [] : []

  const gtagType = typeof (window as any)?.gtag
  const gaId = (process.env.NEXT_PUBLIC_GA_ID ?? '').trim()
  const gtmId = (process.env.NEXT_PUBLIC_GTM_ID ?? '').trim()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Visibility / SEO / Analytics debug</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Deze pagina geeft objectief bewijs of robots/sitemap bereikbaar zijn en of events op je toestel getrackt worden.
              (Geen gevoelige data.)
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href="/robots.txt" className="px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50">
                robots.txt
              </Link>
              <Link href="/sitemap.xml" className="px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50">
                sitemap.xml
              </Link>
              <Link
                href="/api/health/seo"
                className="px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 font-mono"
              >
                /api/health/seo
              </Link>
              <Link
                href="/api/debug/build"
                className="px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 font-mono"
              >
                /api/debug/build
              </Link>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">1) Indexing basics</h2>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">host</span>: <span className="font-mono">{typeof window !== 'undefined' ? window.location.host : ''}</span>
                </div>
                <div>
                  <span className="font-semibold">origin</span>: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}</span>
                </div>
                <div>
                  <span className="font-semibold">path</span>: <span className="font-mono">{typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''}</span>
                </div>
                <div>
                  <span className="font-semibold">referrer</span>: <span className="font-mono break-all">{String(referrer)}</span>
                </div>
                <div>
                  <span className="font-semibold">utm</span>: <span className="font-mono">{Object.keys(utm).length ? JSON.stringify(utm) : '(none)'}</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold">robots ok</span>: <span className="font-mono">{String(health?.seo?.robots?.ok ?? '(loading)')}</span>
                </div>
                <div>
                  <span className="font-semibold">sitemap ok</span>: <span className="font-mono">{String(health?.seo?.sitemap?.ok ?? '(loading)')}</span>
                </div>
                <div>
                  <span className="font-semibold">robots status</span>: <span className="font-mono">{String(health?.seo?.robots?.status ?? '')}</span>
                </div>
                <div>
                  <span className="font-semibold">sitemap status</span>: <span className="font-mono">{String(health?.seo?.sitemap?.status ?? '')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">2) Analytics proof (this device)</h2>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">consent</span>: <span className="font-mono">{String(consent)}</span>
                </div>
                <div>
                  <span className="font-semibold">GA id</span>: <span className="font-mono">{gaId ? 'set' : 'missing'}</span>
                </div>
                <div>
                  <span className="font-semibold">GTM id</span>: <span className="font-mono">{gtmId ? 'set' : 'missing'}</span>
                </div>
                <div>
                  <span className="font-semibold">gtag type</span>: <span className="font-mono">{String(gtagType)}</span>
                </div>
                <div>
                  <span className="font-semibold">buffered events</span>: <span className="font-mono">{String(lastEvents?.length ?? 0)}</span>
                </div>
                <div className="pt-2 text-xs text-gray-500">
                  Tip: klik op email/telefoon/whatsapp links of start een booking; je ziet dan `lead_click` / `booking_*` events hieronder verschijnen.
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">3) Last tracked events (max 20)</h2>
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-3">tijd</th>
                    <th className="py-2 pr-3">event</th>
                    <th className="py-2 pr-3">params</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {(lastEvents ?? [])
                    .slice()
                    .reverse()
                    .map((e: any, idx: number) => (
                      <tr key={`${e?.ts ?? idx}-${idx}`} className="border-t border-gray-100 align-top">
                        <td className="py-2 pr-3 whitespace-nowrap font-mono">{fmtTs(Number(e?.ts ?? 0))}</td>
                        <td className="py-2 pr-3 whitespace-nowrap font-mono">{String(e?.event ?? '')}</td>
                        <td className="py-2 pr-3 font-mono text-xs break-all">{JSON.stringify(e?.params ?? {})}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!lastEvents?.length ? (
                <div className="text-sm text-gray-600 py-3">Nog geen events in deze tab. Navigeer rond en klik een CTA.</div>
              ) : null}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">4) Build / deployment</h2>
            <pre className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 overflow-auto">
              {JSON.stringify({ health, build, tick }, null, 2)}
            </pre>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

