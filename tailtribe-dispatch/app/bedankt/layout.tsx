import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/bedankt', appUrl).toString()

export const metadata: Metadata = {
  title: 'Aanvraag ontvangen',
  description: 'Je aanvraag is ontvangen. We nemen snel contact met je op.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Aanvraag ontvangen',
    description: 'Je aanvraag is ontvangen. We nemen snel contact met je op.',
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



