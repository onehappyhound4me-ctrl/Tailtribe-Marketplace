'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
  }

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">🍪 We gebruiken cookies</h3>
            <p className="text-sm text-gray-600">
              We gebruiken essentiële cookies om de website te laten werken en analytische cookies om onze diensten te verbeteren. 
              {' '}
              <Link href="/cookies" className="text-green-600 hover:underline">
                Meer informatie
              </Link>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={rejectCookies}
              variant="outline"
              className="border-gray-300"
            >
              Alleen essentieel
            </Button>
            <Button
              onClick={acceptCookies}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Accepteer alles
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}




