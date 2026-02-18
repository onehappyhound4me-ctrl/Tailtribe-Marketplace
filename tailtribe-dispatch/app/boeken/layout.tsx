import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/boeken', appUrl).toString()

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
