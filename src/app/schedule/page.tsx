'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SchedulePage() {
  const [currentMonth] = useState(new Date())
  
  const monthName = currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Planning & Agenda</h1>
              <p className="text-gray-600">Beheer je beschikbaarheid en afspraken</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agenda - {monthName}</h2>
            <p className="text-gray-600 mb-8">
              Hier kun je je beschikbaarheid en afspraken beheren. Voor geavanceerde kalender functionaliteit, gebruik de Beschikbaarheid pagina.
            </p>
            <Link 
              href="/schedule/availability"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Naar Beschikbaarheid
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Boekingen deze maand</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Beschikbare dagen</p>
                <p className="text-3xl font-bold text-gray-900">22</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Totale uren</p>
                <p className="text-3xl font-bold text-gray-900">45</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
