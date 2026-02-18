import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Debug',
  description: 'Debug pages (noindex).',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function DebugLayout({ children }: { children: React.ReactNode }) {
  return children
}

