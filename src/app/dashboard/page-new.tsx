'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard')
      return
    }

    if (session?.user) {
      // Redirect based on role
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (session.user.role === 'CAREGIVER') {
        router.push('/dashboard/caregiver')
      } else {
        router.push('/dashboard/owner')
      }
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Dashboard laden...</p>
      </div>
    </div>
  )
}




