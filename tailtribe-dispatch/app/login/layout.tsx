import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/login`

export const metadata: Metadata = {
  title: 'Inloggen',
  description: 'Log in om je TailTribe dashboard te bekijken.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Inloggen',
    description: 'Log in om je TailTribe dashboard te bekijken.',
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

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
