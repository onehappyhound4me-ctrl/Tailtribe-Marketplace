'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function DashboardNav() {
  const router = useRouter()
  const { data: session } = useSession()

  // Don't show if no session
  if (!session?.user) return null

  const handleBackToDashboard = () => {
    const role = session.user.role?.toUpperCase()
    
    console.log('DEBUG - Role:', role, 'Raw:', session.user.role)
    
    if (role === 'ADMIN') {
      console.log('Going to /admin')
      router.push('/admin')
    } else if (role === 'CAREGIVER') {
      console.log('Going to /dashboard/caregiver')
      router.push('/dashboard/caregiver')
    } else {
      console.log('Going to /dashboard/owner')
      router.push('/dashboard/owner')
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug naar Dashboard
          </button>

          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
