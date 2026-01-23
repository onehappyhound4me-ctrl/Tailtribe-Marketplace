import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/verzorger-aanmelden/bedankt`

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


