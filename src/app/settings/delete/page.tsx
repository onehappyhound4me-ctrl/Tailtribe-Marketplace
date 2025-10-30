'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DeleteAccountPage() {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Account Verwijderen</h1>
              <p className="text-gray-600">Verwijder je account permanent</p>
            </div>
            <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors rounded-lg font-medium">
              Terug naar Instellingen
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold text-red-900 mb-2">⚠️ Waarschuwing</h3>
                <p className="text-sm text-red-800">
                  Het verwijderen van je account is permanent en kan niet ongedaan gemaakt worden. 
                  Al je gegevens, boekingen, berichten en reviews zullen definitief worden verwijderd.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Wat gebeurt er?</h2>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-gray-700">Je profiel wordt permanent verwijderd</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-gray-700">Alle boekingen worden geannuleerd</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-gray-700">Je berichten en reviews worden verwijderd</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-gray-700">Je kan niet meer inloggen met dit account</span>
            </li>
          </ul>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ "VERWIJDER" om te bevestigen
              </label>
              <input 
                type="text" 
                onChange={(e) => setConfirmed(e.target.value === 'VERWIJDER')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                placeholder="VERWIJDER"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bevestig je wachtwoord
              </label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>

            <div className="pt-4">
              <button 
                disabled={!confirmed}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  confirmed 
                    ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Account definitief verwijderen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
