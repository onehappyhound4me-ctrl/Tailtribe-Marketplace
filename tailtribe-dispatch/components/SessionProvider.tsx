'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { IdleLogout } from '@/components/IdleLogout'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <IdleLogout />
      {children}
    </NextAuthSessionProvider>
  )
}
