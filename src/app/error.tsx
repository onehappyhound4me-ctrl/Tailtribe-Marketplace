'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Er ging iets mis
        </h2>
        <p className="text-gray-600 mb-6">
          We konden deze pagina niet laden. Probeer het opnieuw of ga terug naar de homepage.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-green-600 hover:bg-green-700"
          >
            Probeer opnieuw
          </Button>
          <Link href="/">
            <Button variant="outline">
              Naar homepage
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-xs text-red-800 font-mono">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}




