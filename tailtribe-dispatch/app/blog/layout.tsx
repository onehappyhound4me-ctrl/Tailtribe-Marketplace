import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Veelgestelde vragen over dierenoppas en hondenuitlaat | TailTribe',
  description:
    'Antwoorden op veelgezochte vragen van huisdiereigenaars over dierenoppas, hondenuitlaatservice aan huis, prijzen, vertrouwen en hulp in Antwerpen en heel België.',
  path: '/blog',
  ogImageAlt: 'TailTribe blog – tips voor huisdiereigenaars',
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
