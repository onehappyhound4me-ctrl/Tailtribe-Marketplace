import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'
import HomePageClient from './home-client'

const appUrl = getPublicAppUrl()
const ogImageUrl = `${appUrl}/assets/hero-marketplace.jpg`

export const metadata: Metadata = {
  title: 'TailTribe – Professionele dierenverzorging in België',
  description:
    'Vraag betrouwbare dierenverzorging aan in België: hondenuitlaat, dierenoppas, opvang en verzorging aan huis. Wij matchen je met gescreende verzorgers.',
  alternates: {
    canonical: '/',
    languages: { 'nl-BE': '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'TailTribe',
    title: 'TailTribe – Professionele dierenverzorging in België',
    description:
      'Vraag betrouwbare dierenverzorging aan in België: hondenuitlaat, dierenoppas, opvang en verzorging aan huis.',
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
    title: 'TailTribe – Professionele dierenverzorging in België',
    description:
      'Vraag betrouwbare dierenverzorging aan in België: hondenuitlaat, dierenoppas, opvang en verzorging aan huis.',
    images: [ogImageUrl],
  },
}

export default function HomePage() {
  return <HomePageClient />
}
