import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/blog`

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Praktische tips, nieuws en inzichten over dierenverzorging in België.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Blog',
    description: 'Praktische tips, nieuws en inzichten over dierenverzorging in België.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
