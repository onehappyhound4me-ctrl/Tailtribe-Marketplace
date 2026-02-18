import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/blog', appUrl).toString()

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
