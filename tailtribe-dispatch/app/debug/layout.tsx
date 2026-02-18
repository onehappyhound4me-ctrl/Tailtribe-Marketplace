import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()

export const metadata: Metadata = {
  title: 'Debug',
  description: 'Debug pages (noindex).',
  alternates: { canonical: new URL('/debug', appUrl).toString() },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function DebugLayout({ children }: { children: React.ReactNode }) {
  return children
}

