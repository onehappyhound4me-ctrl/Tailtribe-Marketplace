'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  avgRating: number
  growthRate: number
  bookingsToday: number
  newUsersToday: number
  revenueToday: number
}

const mockAnalytics: AnalyticsData = {
  totalUsers: 89,
  totalBookings: 234,
  totalRevenue: 12450,
  avgRating: 4.8,
  growthRate: 15.3,
  bookingsToday: 8,
  newUsersToday: 3,
  revenueToday: 420
}

const recentActivity = [
  { id: 1, type: 'booking', message: 'Nieuwe boeking van Jan Vermeersch', time: '5 min geleden', icon: '📅' },
  { id: 2, type: 'user', message: 'Nieuwe verzorger aangemeld: Lisa Peeters', time: '12 min geleden', icon: '👋' },
  { id: 3, type: 'payment', message: 'Betaling ontvangen: €45', time: '18 min geleden', icon: '💰' },
  { id: 4, type: 'review', message: 'Nieuwe 5-sterren review van Marie Dubois', time: '25 min geleden', icon: '⭐' },
  { id: 5, type: 'booking', message: 'Boeking geannuleerd door Tom Janssen', time: '32 min geleden', icon: '❌' }
]

const monthlyStats = [
  { month: 'Jan', bookings: 45, revenue: 2340, users: 12 },
  { month: 'Feb', bookings: 62, revenue: 3120, users: 18 },
  { month: 'Mar', bookings: 78, revenue: 4200, users: 25 },
  { month: 'Apr', bookings: 89, revenue: 4890, users: 31 },
  { month: 'Mei', bookings: 95, revenue: 5250, users: 28 }
]

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Platform prestaties en statistieken</p>
        </div>
        
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'gradient-button' : ''}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card professional-shadow hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Gebruikers</p>
                <p className="text-3xl font-bold text-gray-900">{mockAnalytics.totalUsers}</p>
                <p className="text-sm text-green-600 mt-1">+{mockAnalytics.newUsersToday} vandaag</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card professional-shadow hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Boekingen</p>
                <p className="text-3xl font-bold text-gray-900">{mockAnalytics.totalBookings}</p>
                <p className="text-sm text-green-600 mt-1">+{mockAnalytics.bookingsToday} vandaag</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card professional-shadow hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Omzet</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(mockAnalytics.totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">+{formatCurrency(mockAnalytics.revenueToday)} vandaag</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card professional-shadow hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gem. Beoordeling</p>
                <p className="text-3xl font-bold text-gray-900">{mockAnalytics.avgRating}</p>
                <p className="text-sm text-green-600 mt-1">+{mockAnalytics.growthRate}% groei</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Growth Chart */}
        <Card className="lg:col-span-2 gradient-card professional-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Maandelijkse Groei
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => (
                <div key={stat.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{stat.month}</div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">{stat.bookings}</div>
                      <div className="text-gray-500">Boekingen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-semibold">{formatCurrency(stat.revenue)}</div>
                      <div className="text-gray-500">Omzet</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-600 font-semibold">{stat.users}</div>
                      <div className="text-gray-500">Gebruikers</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gradient-card professional-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔔 Recente Activiteit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              Alle activiteit bekijken
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Service Prestaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { service: 'Hondenuitlaat', bookings: 89, rating: 4.9, revenue: 4450, icon: '🚶' },
              { service: 'Dierenoppas', bookings: 67, rating: 4.8, revenue: 3920, icon: '🏠' },
              { service: 'Training', bookings: 45, rating: 4.7, revenue: 2250, icon: '🎓' },
              { service: 'Transport', bookings: 33, rating: 4.6, revenue: 1830, icon: '🚗' }
            ].map((service) => (
              <div key={service.service} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{service.icon}</span>
                  <h3 className="font-semibold text-gray-900">{service.service}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Boekingen:</span>
                    <span className="font-medium">{service.bookings}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Beoordeling:</span>
                    <span className="font-medium">{service.rating} ⭐</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Omzet:</span>
                    <span className="font-medium text-green-600">{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
