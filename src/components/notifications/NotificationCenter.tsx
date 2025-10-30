'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  type: 'booking' | 'message' | 'review' | 'system' | 'reminder' | 'promotion'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  metadata?: Record<string, any>
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Nieuwe boekingsaanvraag',
    message: 'Sarah Janssens heeft een aanvraag gedaan voor hondenuitlaat op 25 januari om 14:00',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    actionUrl: '/bookings/1',
    actionLabel: 'Bekijk aanvraag',
    priority: 'high',
    category: 'Boekingen'
  },
  {
    id: '2',
    type: 'message',
    title: 'Nieuw bericht ontvangen',
    message: 'Tom Vermeulen: "Hallo! Ik heb een vraag over de medicatie van Max..."',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: false,
    actionUrl: '/messages/2',
    actionLabel: 'Lees bericht',
    priority: 'medium',
    category: 'Berichten'
  },
  {
    id: '3',
    type: 'review',
    title: 'Nieuwe 5-sterren review!',
    message: 'Marie Dubois heeft een geweldige review achtergelaten voor je service',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: true,
    actionUrl: '/reviews/3',
    actionLabel: 'Bekijk review',
    priority: 'medium',
    category: 'Reviews'
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Aankomende afspraak',
    message: 'Je hebt over 1 uur een hondenuitlaat afspraak met Luna in Gent',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    isRead: true,
    actionUrl: '/bookings/4',
    actionLabel: 'Bekijk details',
    priority: 'high',
    category: 'Herinneringen'
  },
  {
    id: '5',
    type: 'promotion',
    title: 'Nieuwe loyaliteitsbeloningen beschikbaar!',
    message: 'Je hebt genoeg punten verzameld voor een gratis hondenuitlaat. Wissel nu in!',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
    actionUrl: '/rewards',
    actionLabel: 'Bekijk beloningen',
    priority: 'low',
    category: 'Promoties'
  },
  {
    id: '6',
    type: 'system',
    title: 'Account beveiligingsupdate',
    message: 'We hebben de beveiliging van je account verbeterd. Geen actie vereist.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    actionUrl: '/settings/security',
    actionLabel: 'Bekijk instellingen',
    priority: 'low',
    category: 'Systeem'
  }
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const notificationIcons = {
    booking: '📅',
    message: '💬',
    review: '⭐',
    system: '🔧',
    reminder: '⏰',
    promotion: '🎁'
  }

  const priorityColors = {
    low: 'border-gray-200 bg-gray-50',
    medium: 'border-blue-200 bg-blue-50',
    high: 'border-orange-200 bg-orange-50',
    urgent: 'border-red-200 bg-red-50'
  }

  const categories = [
    { id: 'all', label: 'Alle meldingen', count: notifications.length },
    { id: 'Boekingen', label: 'Boekingen', count: notifications.filter(n => n.category === 'Boekingen').length },
    { id: 'Berichten', label: 'Berichten', count: notifications.filter(n => n.category === 'Berichten').length },
    { id: 'Reviews', label: 'Reviews', count: notifications.filter(n => n.category === 'Reviews').length },
    { id: 'Herinneringen', label: 'Herinneringen', count: notifications.filter(n => n.category === 'Herinneringen').length },
    { id: 'Promoties', label: 'Promoties', count: notifications.filter(n => n.category === 'Promoties').length }
  ]

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || notification.category === selectedFilter
    const matchesReadStatus = !showUnreadOnly || !notification.isRead
    return matchesFilter && matchesReadStatus
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Nu'
    if (minutes < 60) return `${minutes}m geleden`
    if (hours < 24) return `${hours}u geleden`
    if (days === 1) return 'Gisteren'
    if (days < 7) return `${days}d geleden`
    return timestamp.toLocaleDateString('nl-NL')
  }

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'message',
        title: 'Nieuw bericht',
        message: 'Je hebt een nieuw bericht ontvangen van een klant',
        timestamp: new Date(),
        isRead: false,
        actionUrl: '/messages',
        actionLabel: 'Lees bericht',
        priority: 'medium',
        category: 'Berichten'
      }

      // Randomly add new notifications (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        setNotifications(prev => [newNotification, ...prev])
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meldingen</h2>
                <p className="text-gray-600 font-normal">
                  {unreadCount > 0 ? `${unreadCount} ongelezen meldingen` : 'Alle meldingen gelezen'}
                </p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={showUnreadOnly ? 'bg-green-50 border-green-200 text-green-700' : ''}
              >
                {showUnreadOnly ? '📖 Toon alle' : '🔍 Alleen ongelezen'}
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  ✓ Alles gelezen
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card className="gradient-card professional-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Categorieën</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedFilter(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedFilter === category.id
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <span className="font-medium">{category.label}</span>
                  {category.count > 0 && (
                    <Badge 
                      className={`${
                        selectedFilter === category.id
                          ? 'bg-green-500 text-green-100'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category.count}
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="gradient-card professional-shadow">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Geen meldingen
                </h3>
                <p className="text-gray-600">
                  {showUnreadOnly 
                    ? 'Alle meldingen zijn gelezen!' 
                    : 'Je hebt momenteel geen meldingen.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`professional-shadow hover:shadow-lg transition-all duration-300 border-l-4 ${
                  !notification.isRead 
                    ? 'bg-blue-50 border-l-blue-500' 
                    : 'bg-white border-l-gray-200'
                } ${priorityColors[notification.priority]}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                        {notificationIcons[notification.type]}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }
                          >
                            {notification.priority === 'urgent' ? '🚨 Urgent' :
                             notification.priority === 'high' ? '⚠️ Hoog' :
                             notification.priority === 'medium' ? '📋 Normaal' : '📝 Laag'}
                          </Badge>
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Verwijderen"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              ✓ Gelezen
                            </Button>
                          )}
                          
                          {notification.actionUrl && (
                            <Button
                              size="sm"
                              className="gradient-button"
                              onClick={() => {
                                markAsRead(notification.id)
                                // In real app: router.push(notification.actionUrl)
                              }}
                            >
                              {notification.actionLabel || 'Bekijk'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Meldingsinstellingen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Push Meldingen</h4>
              <div className="space-y-3">
                {[
                  { id: 'bookings', label: 'Nieuwe boekingen', enabled: true },
                  { id: 'messages', label: 'Berichten', enabled: true },
                  { id: 'reviews', label: 'Reviews', enabled: true },
                  { id: 'reminders', label: 'Herinneringen', enabled: true },
                  { id: 'promotions', label: 'Promoties', enabled: false }
                ].map(setting => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{setting.label}</span>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        setting.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Email Meldingen</h4>
              <div className="space-y-3">
                {[
                  { id: 'daily_summary', label: 'Dagelijkse samenvatting', enabled: true },
                  { id: 'weekly_report', label: 'Wekelijks rapport', enabled: true },
                  { id: 'marketing', label: 'Marketing emails', enabled: false }
                ].map(setting => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{setting.label}</span>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        setting.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button className="gradient-button">
              💾 Instellingen opslaan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
