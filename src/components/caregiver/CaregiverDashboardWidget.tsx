'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CaregiverDashboardWidgetProps {
  className?: string
}

interface QuickStats {
  todayBookings: number
  pendingRequests: number
  weeklyEarnings: number
  nextBooking?: {
    id: string
    petName: string
    service: string
    startAt: string
  }
}

export default function CaregiverDashboardWidget({ className = '' }: CaregiverDashboardWidgetProps) {
  const [stats, setStats] = useState<QuickStats>({
    todayBookings: 0,
    pendingRequests: 0,
    weeklyEarnings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuickStats()
  }, [])

  const loadQuickStats = async () => {
    try {
      const res = await fetch('/api/caregiver/stats')
      if (res.ok) {
        const data = await res.json()
        const today = new Date()
        const todayBookings = data.stats.recentBookings?.filter((booking: any) => 
          new Date(booking.startAt).toDateString() === today.toDateString()
        ).length || 0

        setStats({
          todayBookings,
          pendingRequests: data.stats.pendingBookings,
          weeklyEarnings: data.stats.weeklyEarnings,
          nextBooking: data.stats.recentBookings?.find((booking: any) => 
            booking.status === 'CONFIRMED' && new Date(booking.startAt) > today
          )
        })
      }
    } catch (error) {
      console.error('Error loading quick stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mijn Agenda</h3>
        <Link href="/dashboard/caregiver/calendar">
          <Button variant="outline" size="sm">
            Bekijk agenda
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Today's Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.todayBookings}</p>
            <p className="text-xs text-blue-600">Vandaag</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
            <p className="text-xs text-yellow-600">In afwachting</p>
          </div>
        </div>

        {/* Weekly Earnings */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Deze week</span>
            <span className="font-bold text-green-600">€{stats.weeklyEarnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Next Booking */}
        {stats.nextBooking && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Volgende boeking:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{stats.nextBooking.petName}</p>
                <p className="text-sm text-gray-600">{stats.nextBooking.service}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {new Date(stats.nextBooking.startAt).toLocaleDateString('nl-NL', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link href="/dashboard/caregiver/calendar" className="block">
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Bekijk volledige agenda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


