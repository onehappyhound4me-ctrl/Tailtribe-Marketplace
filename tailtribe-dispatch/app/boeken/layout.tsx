import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/boeken`

export const metadata: Metadata = {
  title: 'Aanvraag indienen',
  description: 'Dien je aanvraag in voor hondenuitlaat, dierenoppas, verzorging en meer bij TailTribe.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Aanvraag indienen',
    description: 'Dien je aanvraag in voor hondenuitlaat, dierenoppas, verzorging en meer bij TailTribe.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function BoekenLayout({ children }: { children: React.ReactNode }) {
  return children
}
