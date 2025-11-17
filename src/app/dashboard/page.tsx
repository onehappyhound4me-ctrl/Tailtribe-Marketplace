'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    const enforceOnboarding = async () => {
      if (!session?.user) {
        router.replace('/auth/signin?callbackUrl=/dashboard')
        return
      }

      const role = session.user.role || 'OWNER'

      try {
        if (role === 'OWNER') {
          const res = await fetch('/api/profile/owner', { cache: 'no-store' })
          if (res.ok) {
            const profile = await res.json()
            if (!profile?.onboardingCompleted) {
              router.replace('/onboarding/owner')
              return
            }
          } else {
            console.warn('[DASHBOARD] Owner profile fetch failed:', res.status)
          }
        } else if (role === 'CAREGIVER') {
          const res = await fetch('/api/profile/caregiver', { cache: 'no-store' })
          if (res.ok) {
            const profile = await res.json()
            if (!profile?.hasProfile) {
              router.replace('/onboarding/caregiver-new')
              return
            }
          } else {
            console.warn('[DASHBOARD] Caregiver profile fetch failed:', res.status)
          }
        }
      } catch (error) {
        console.error('[DASHBOARD] Error checking onboarding status:', error)
      }

      if (role === 'CAREGIVER') {
        router.replace('/dashboard/caregiver')
      } else if (role === 'ADMIN') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard/owner')
      }
    }

    enforceOnboarding().finally(() => setChecking(false))
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">
          {checking ? 'Profiel wordt gecontroleerd...' : 'Even geduld...'}
        </p>
      </div>
    </div>
  )
}
