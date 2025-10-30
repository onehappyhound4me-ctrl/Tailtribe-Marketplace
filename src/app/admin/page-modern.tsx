'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserManagement } from '@/components/admin/UserManagement'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type AdminView = 'dashboard' | 'users' | 'bookings' | 'settings'

export default function ModernAdminPage() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard')

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Gebruikers', icon: '👥' },
    { id: 'bookings', label: 'Boekingen', icon: '📅' },
    { id: 'settings', label: 'Instellingen', icon: '⚙️' }
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AnalyticsDashboard />
      case 'users':
        return <UserManagement />
      case 'bookings':
        return <BookingManagement />
      case 'settings':
        return <AdminSettings />
      default:
        return <AnalyticsDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-4 group"
            >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
              Terug naar site
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              🛡️ Admin Panel
            </h1>
            <p className="text-gray-600 mt-2">
              Beheer je TailTribe platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">Ingelogd als</div>
              <div className="font-semibold text-gray-900">Admin User</div>
            </div>
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              🚪 Uitloggen
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="gradient-card professional-shadow sticky top-8">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as AdminView)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeView === item.id
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Snelle acties
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      📧 Verstuur nieuwsbrief
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      📊 Exporteer data
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      🔧 Systeem onderhoud
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other admin sections
function BookingManagement() {
  return (
    <Card className="gradient-card professional-shadow">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Boekingsbeheer</h2>
        <p className="text-gray-600 mb-6">
          Beheer alle boekingen, betalingen en geschillen op het platform.
        </p>
        <Button className="gradient-button">
          Bekijk alle boekingen
        </Button>
      </CardContent>
    </Card>
  )
}

function AdminSettings() {
  return (
    <Card className="gradient-card professional-shadow">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Instellingen</h2>
        <p className="text-gray-600 mb-6">
          Configureer platform instellingen, commissies, en systeemparameters.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button variant="outline">
            💰 Commissie instellingen
          </Button>
          <Button variant="outline">
            📧 Email templates
          </Button>
          <Button variant="outline">
            🔐 Beveiligingsinstellingen
          </Button>
          <Button variant="outline">
            🌍 Locatie beheer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
