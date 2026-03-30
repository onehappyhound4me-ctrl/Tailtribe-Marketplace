import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/blog', appUrl).toString()

export const metadata: Metadata = {
  title: 'Veelgestelde vragen over dierenoppas en hondenuitlaat | TailTribe',
  description:
    'Antwoorden op veelgezochte vragen van huisdiereigenaars over dierenoppas, hondenuitlaatservice aan huis, prijzen, vertrouwen en hulp in Antwerpen en België.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Veelgestelde vragen over dierenoppas en hondenuitlaat | TailTribe',
    description:
      'Antwoorden op veelgezochte vragen van huisdiereigenaars over dierenoppas, hondenuitlaatservice aan huis, prijzen, vertrouwen en hulp in Antwerpen en België.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
