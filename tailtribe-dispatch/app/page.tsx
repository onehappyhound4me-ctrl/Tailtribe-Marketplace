import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'
import HomePageClient from './home-client'

const appUrl = getPublicAppUrl()
const ogImageUrl = `${appUrl}/assets/hero-marketplace.jpg`

export const metadata: Metadata = {
  title: 'Hondenuitlaat, hondenoppas en kattenoppas in België | TailTribe',
  description:
    'Vraag hondenuitlaat, hondenoppas, kattenoppas, hondenopvang en dierenverzorging aan in België. TailTribe matcht je met gescreende verzorgers en volgt je aanvraag persoonlijk op.',
  alternates: {
    canonical: '/',
    languages: { 'nl-BE': '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'TailTribe',
    title: 'Hondenuitlaat, hondenoppas en kattenoppas in België | TailTribe',
    description:
      'Vraag hondenuitlaat, hondenoppas, kattenoppas, hondenopvang en dierenverzorging aan in België.',
    locale: 'nl_BE',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'TailTribe — dierenverzorging in België',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hondenuitlaat, hondenoppas en kattenoppas in België | TailTribe',
    description:
      'Vraag hondenuitlaat, hondenoppas, kattenoppas, hondenopvang en dierenverzorging aan in België.',
    images: [ogImageUrl],
  },
}

export default function HomePage() {
  return <HomePageClient />
}
