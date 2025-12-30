import type { Metadata } from 'next'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'TailTribe – Professionele dierenverzorging in België',
    template: '%s | TailTribe',
  },
  description: 'Vraag betrouwbare dierenverzorging aan in België. Hondenuitlaat, dierenoppas, opvang en meer.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'TailTribe',
    title: 'TailTribe – Professionele dierenverzorging in België',
    description: 'Vraag betrouwbare dierenverzorging aan in België. Hondenuitlaat, dierenoppas, opvang en meer.',
    locale: 'nl_BE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailTribe – Professionele dierenverzorging in België',
    description: 'Vraag betrouwbare dierenverzorging aan in België. Hondenuitlaat, dierenoppas, opvang en meer.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full">
      <body className="h-full antialiased font-sans">{children}</body>
    </html>
  )
}
