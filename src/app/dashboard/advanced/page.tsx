'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RewardsProgram } from '@/components/loyalty/RewardsProgram'
import { AIMatchingEngine } from '@/components/matching/AIMatchingEngine'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

type DashboardView = 'overview' | 'rewards' | 'matching' | 'notifications' | 'analytics'

export default function AdvancedDashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>('overview')

  const navigationItems = [
    { id: 'overview', label: 'Overzicht', icon: '📊', description: 'Dashboard overzicht' },
    { id: 'rewards', label: 'Beloningen', icon: '🏆', description: 'Loyalty programma' },
    { id: 'matching', label: 'AI Matching', icon: '🤖', description: 'Slimme matches' },
    { id: 'notifications', label: 'Meldingen', icon: '🔔', description: 'Notificatie centrum' },
    { id: 'analytics', label: 'Analytics', icon: '📈', description: 'Prestatie inzichten' }
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview />
      case 'rewards':
        return <RewardsProgram />
      case 'matching':
        return <AIMatchingEngine />
      case 'notifications':
        return <NotificationCenter />
      case 'analytics':
        return <AnalyticsView />
      default:
        return <DashboardOverview />
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
              Terug naar home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              🚀 Advanced Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Toegang tot alle geavanceerde functies van TailTribe
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">Welkom terug</div>
              <div className="font-semibold text-gray-900">Sarah Janssens</div>
            </div>
            <div className="relative">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                🔔 Meldingen
              </Button>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="gradient-card professional-shadow sticky top-8">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as DashboardView)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 group ${
                        activeView === item.id
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <p className={`text-sm ${
                        activeView === item.id ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </button>
                  ))}
                </nav>

                {/* Quick Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Snelle statistieken
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Loyalty punten</span>
                      <Badge className="bg-yellow-100 text-yellow-800">1,250</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Match score</span>
                      <Badge className="bg-blue-100 text-blue-800">98%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ongelezen</span>
                      <Badge className="bg-red-100 text-red-800">3</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="gradient-card professional-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">🎉 Welkom bij TailTribe Advanced!</h2>
              <p className="text-green-100 text-lg">
                Ontdek alle geavanceerde functies om je ervaring te maximaliseren
              </p>
            </div>
            <div className="text-6xl opacity-20">🚀</div>
          </div>
        </div>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="gradient-card professional-shadow hover:scale-105 transition-all duration-300 group cursor-pointer">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Loyalty Programma</h3>
            <p className="text-gray-600 mb-4">
              Verdien punten met elke boeking en wissel in voor geweldige beloningen
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">1,250</div>
                <div className="text-gray-500">Punten</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">Silver</div>
                <div className="text-gray-500">Status</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">5</div>
                <div className="text-gray-500">Beloningen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card professional-shadow hover:scale-105 transition-all duration-300 group cursor-pointer">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Matching</h3>
            <p className="text-gray-600 mb-4">
              Slimme algoritmes vinden de perfecte verzorger voor jouw huisdier
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">98%</div>
                <div className="text-gray-500">Match Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">3</div>
                <div className="text-gray-500">Top Matches</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">24/7</div>
                <div className="text-gray-500">Actief</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card professional-shadow hover:scale-105 transition-all duration-300 group cursor-pointer">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Notifications</h3>
            <p className="text-gray-600 mb-4">
              Real-time meldingen voor boekingen, berichten en belangrijke updates
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">3</div>
                <div className="text-gray-500">Ongelezen</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">Push</div>
                <div className="text-gray-500">Real-time</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">Smart</div>
                <div className="text-gray-500">Filters</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card professional-shadow hover:scale-105 transition-all duration-300 group cursor-pointer">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
            <p className="text-gray-600 mb-4">
              Diepgaande inzichten in je boekingen, uitgaven en tevredenheid
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">€450</div>
                <div className="text-gray-500">Deze maand</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">15</div>
                <div className="text-gray-500">Boekingen</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">4.9</div>
                <div className="text-gray-500">Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Recente Activiteit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: '🏆', title: 'Beloning ingewisseld', desc: 'Je hebt 10% korting ingewisseld', time: '2u geleden' },
              { icon: '🤖', title: 'Nieuwe match gevonden', desc: 'AI heeft een 98% match gevonden voor je', time: '4u geleden' },
              { icon: '⭐', title: 'Review ontvangen', desc: 'Nieuwe 5-sterren review van Marie', time: '6u geleden' },
              { icon: '📅', title: 'Boeking bevestigd', desc: 'Hondenuitlaat met Tom bevestigd', time: '8u geleden' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  <p className="text-gray-600 text-sm">{activity.desc}</p>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsView() {
  return (
    <Card className="gradient-card professional-shadow">
      <CardContent className="p-12 text-center">
        <div className="text-6xl mb-6">📊</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Geavanceerde Analytics</h2>
        <p className="text-gray-600 text-lg mb-8">
          Krijg diepgaande inzichten in je gebruik, uitgaven en tevredenheid met onze geavanceerde analytics dashboard.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">€1,250</div>
            <div className="text-green-700 font-medium">Totaal uitgegeven</div>
            <div className="text-green-600 text-sm">+15% deze maand</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">47</div>
            <div className="text-blue-700 font-medium">Totaal boekingen</div>
            <div className="text-blue-600 text-sm">+8 deze maand</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9</div>
            <div className="text-purple-700 font-medium">Gemiddelde rating</div>
            <div className="text-purple-600 text-sm">Van 23 reviews</div>
          </div>
        </div>
        
        <Button className="gradient-button text-lg px-8 py-3">
          📈 Bekijk Volledige Analytics
        </Button>
      </CardContent>
    </Card>
  )
}
