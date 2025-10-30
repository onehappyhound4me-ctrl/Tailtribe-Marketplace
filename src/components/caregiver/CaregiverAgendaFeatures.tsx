'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CaregiverAgendaFeaturesProps {
  onQuickAction: (action: string, data?: any) => void
}

export default function CaregiverAgendaFeatures({ onQuickAction }: CaregiverAgendaFeaturesProps) {
  const [quickActions] = useState([
    {
      id: 'mark-unavailable',
      title: 'Niet beschikbaar',
      description: 'Markeer jezelf als niet beschikbaar voor vandaag',
      icon: '🚫',
      color: 'bg-red-50 border-red-200 text-red-700'
    },
    {
      id: 'emergency-contact',
      title: 'Noodcontact',
      description: 'Voeg een noodcontact toe voor noodgevallen',
      icon: '🚨',
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      id: 'service-notes',
      title: 'Dienstnotities',
      description: 'Voeg notities toe aan je dienstverlening',
      icon: '📝',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      id: 'availability-bulk',
      title: 'Bulk beschikbaarheid',
      description: 'Stel beschikbaarheid in voor meerdere dagen',
      icon: '📅',
      color: 'bg-green-50 border-green-200 text-green-700'
    }
  ])

  const [recentActivities] = useState([
    { type: 'booking', message: 'Nieuwe boeking ontvangen voor Max (Hond)', time: '2 min geleden' },
    { type: 'reminder', message: 'Herinnering: Boeking met Luna om 14:00', time: '15 min geleden' },
    { type: 'rating', message: 'Nieuwe 5-sterren beoordeling ontvangen', time: '1 uur geleden' },
    { type: 'payment', message: 'Betaling ontvangen: €45.00', time: '2 uur geleden' }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📋'
      case 'reminder': return '⏰'
      case 'rating': return '⭐'
      case 'payment': return '💰'
      default: return '📄'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600'
      case 'reminder': return 'text-yellow-600'
      case 'rating': return 'text-green-600'
      case 'payment': return 'text-emerald-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚡</span>
            Snelle acties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto p-4 text-left ${action.color} hover:shadow-md transition-all`}
                onClick={() => onQuickAction(action.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-sm opacity-80">{action.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Recente activiteiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className={`font-medium ${getActivityColor(activity.type)}`}>
                    {activity.message}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📈</span>
            Prestatie overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">98%</p>
              <p className="text-sm text-gray-600">Tevredenheidspercentage</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">4.8/5</p>
              <p className="text-sm text-gray-600">Gemiddelde beoordeling</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">24</p>
              <p className="text-sm text-gray-600">Diensten deze maand</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">€1,240</p>
              <p className="text-sm text-gray-600">Maandelijkse inkomsten</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span>
            Professionele tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="font-medium text-blue-800">Tip van de dag</p>
              <p className="text-sm text-blue-700">
                Stel je beschikbaarheid minstens 2 weken van tevoren in voor betere boekingen.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <p className="font-medium text-green-800">Succesvolle strategie</p>
              <p className="text-sm text-green-700">
                Reageer binnen 2 uur op nieuwe boekingsaanvragen voor hogere acceptatie.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <p className="font-medium text-purple-800">Klanttevredenheid</p>
              <p className="text-sm text-purple-700">
                Stuur na elke dienst een korte update naar de eigenaar voor betere beoordelingen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


