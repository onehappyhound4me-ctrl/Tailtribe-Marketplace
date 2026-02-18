import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/verzorger-aanmelden/bedankt', appUrl).toString()

export const metadata: Metadata = {
  title: 'Aanmelding ontvangen',
  description: 'Je aanmelding als dierenverzorger is ontvangen. We nemen contact met je op.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Aanmelding ontvangen',
    description: 'Je aanmelding als dierenverzorger is ontvangen. We nemen contact met je op.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function BedanktLayout({ children }: { children: React.ReactNode }) {
  return children
}


