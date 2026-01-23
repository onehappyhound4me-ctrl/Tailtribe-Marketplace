import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Community voor verzorgers om ervaringen te delen.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}
