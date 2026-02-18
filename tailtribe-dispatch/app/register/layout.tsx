import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/register', appUrl).toString()

export const metadata: Metadata = {
  title: 'Account aanmaken',
  description: 'Maak een account aan als eigenaar of verzorger bij TailTribe.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Account aanmaken',
    description: 'Maak een account aan als eigenaar of verzorger bij TailTribe.',
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

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
