'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on role
    const role = session.user.role
    if (role === 'ADMIN') {
      router.push('/admin')
    } else if (role === 'CAREGIVER') {
      router.push('/dashboard/caregiver')
    } else if (role === 'OWNER') {
      router.push('/dashboard/owner')
    } else {
      router.push('/login')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">Doorverwijzen...</div>
    </div>
  )
}
