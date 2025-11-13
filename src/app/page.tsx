export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { Metadata } from 'next'
import HomePageClient from './HomePageClient'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'

export const metadata: Metadata = {
  title: 'TailTribe – Dierenoppas België & Nederland',
  description: 'Vind vertrouwde dierenoppassers voor wandelingen, opvang en verzorging in België en Nederland. Professionele dierenverzorging voor jouw huisdier.',
  openGraph: {
    title: 'TailTribe – Dierenoppas België & Nederland',
    description: 'Vind vertrouwde dierenoppassers voor wandelingen, opvang en verzorging in België en Nederland.',
    url: appUrl,
    siteName: 'TailTribe',
    images: [
      {
        url: `${appUrl}/assets/tailtribe-logo.png`,
        width: 1200,
        height: 630,
        alt: 'TailTribe – Dierenoppassers België & Nederland',
      },
    ],
    locale: 'nl_BE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailTribe – Dierenoppas België & Nederland',
    description: 'Vind vertrouwde dierenoppassers voor wandelingen, opvang en verzorging.',
    images: [`${appUrl}/assets/tailtribe-logo.png`],
  },
  alternates: {
    canonical: appUrl,
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'TailTribe',
            description: 'Dierenoppas en dierenverzorging platform voor België en Nederland',
            url: appUrl,
            logo: `${appUrl}/assets/tailtribe-logo.png`,
            address: {
              '@type': 'PostalAddress',
              addressCountry: ['BE', 'NL'],
            },
            areaServed: {
              '@type': 'Country',
              name: ['België', 'Nederland'],
            },
            serviceType: [
              'Hondenuitlaat',
              'Dierenoppas',
              'Dierenopvang',
              'Hondentraining',
              'Dierenverzorging',
            ],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '150',
            },
          }),
        }}
      />
      <HomePageClient />
    </>
  )
}


