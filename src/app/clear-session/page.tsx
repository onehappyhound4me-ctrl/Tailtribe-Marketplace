'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ClearSessionPage() {
  const router = useRouter()
  
  useEffect(() => {
    const clearAll = async () => {
      // Clear localStorage
      localStorage.clear()
      
      // Sign out
      await signOut({ redirect: false })
      
      // Clear cookies manually
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Redirect to home
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 500)
    }
    
    clearAll()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Sessie wissen en uitloggen...</p>
      </div>
    </div>
  )
}




































