'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutPage() {
  useEffect(() => {
    try {
      localStorage.removeItem('tt_last_activity_ms')
      localStorage.removeItem('tt_last_login_ms')
      document.cookie = `tt_last_activity_ms=; Max-Age=0; Path=/; SameSite=Lax`
      document.cookie = `tt_last_login_ms=; Max-Age=0; Path=/; SameSite=Lax`
    } catch {
      // ignore
    }
    // Always sign out and return to login (works on mobile + desktop).
    signOut({ callbackUrl: '/login' })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm text-center">
        <div className="text-lg font-semibold text-gray-900">Uitloggen…</div>
        <div className="mt-2 text-sm text-gray-600">
          Als je niet automatisch wordt doorgestuurd,{' '}
          <a className="text-emerald-700 font-semibold underline" href="/api/auth/signout">
            klik hier
          </a>
          .
        </div>
      </div>
    </div>
  )
}

