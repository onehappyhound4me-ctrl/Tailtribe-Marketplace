'use client'

import { useRouter } from 'next/navigation'

export default function BackToSearch() {
  const router = useRouter()

  const handleBack = () => {
    try {
      const ref = typeof document !== 'undefined' ? document.referrer : ''
      const sameOrigin = typeof window !== 'undefined' && ref && new URL(ref).origin === window.location.origin
      if (sameOrigin && ref.includes('/search')) {
        router.back()
        return
      }
    } catch {}
    window.location.href = '/search'
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      ← Terug naar zoeken
    </button>
  )
}


