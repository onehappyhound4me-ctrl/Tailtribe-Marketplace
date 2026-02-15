'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type ConsentValue = 'accepted' | 'declined'

export function AnalyticsLoader() {
  const gaId = (process.env.NEXT_PUBLIC_GA_ID ?? '').trim()
  const gtmId = (process.env.NEXT_PUBLIC_GTM_ID ?? '').trim()
  const [consent, setConsent] = useState<ConsentValue | null>(null)

  useEffect(() => {
    const readConsent = () => {
      const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
      if (stored === 'accepted' || stored === 'declined') {
        setConsent(stored)
        return
      }
      setConsent(null)
    }

    // Initial read.
    readConsent()

    // React immediately when the user accepts/declines (CookieConsent dispatches this).
    const onConsent = () => readConsent()
    window.addEventListener('tailtribe:cookie-consent', onConsent)

    // Also listen to cross-tab updates and rare cases where storage changes outside our components.
    window.addEventListener('storage', onConsent)

    return () => {
      window.removeEventListener('tailtribe:cookie-consent', onConsent)
      window.removeEventListener('storage', onConsent)
    }
  }, [])

  if ((!gaId && !gtmId) || consent !== 'accepted') return null

  return (
    <>
      {gtmId ? (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      ) : null}
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              // We send page_view manually on App Router navigations.
              gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
    </>
  )
}
