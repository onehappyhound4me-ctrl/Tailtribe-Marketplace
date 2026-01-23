import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/verzorger-aanmelden`

export const metadata: Metadata = {
  title: 'Aanmelden als dierenverzorger',
  description: 'Meld je aan als dierenverzorger bij TailTribe en word onderdeel van ons netwerk.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Aanmelden als dierenverzorger',
    description: 'Meld je aan als dierenverzorger bij TailTribe en word onderdeel van ons netwerk.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function VerzorgerAanmeldenLayout({ children }: { children: React.ReactNode }) {
  return children
}
