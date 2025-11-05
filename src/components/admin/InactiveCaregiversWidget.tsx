'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface InactiveCaregiver {
  id: string
  userId: string
  name: string
  email: string
  city: string
  lastActivity: string | null
  daysSinceActivity: number
  status: 'inactive_30' | 'inactive_60' | 'inactive_90'
}

export function InactiveCaregiversWidget() {
  const [stats, setStats] = useState<any>(null)
  const [caregivers, setCaregivers] = useState<InactiveCaregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState(30)
  const [showDetails, setShowDetails] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inactive-caregivers?stats=true', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const fetchCaregivers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/inactive-caregivers?threshold=${threshold}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCaregivers(data.caregivers || [])
      }
    } catch (error) {
      console.error('Error fetching caregivers:', error)
    } finally {
      setLoading(false)
    }
  }, [threshold])

  useEffect(() => {
    if (showDetails) {
      fetchCaregivers()
    }
  }, [threshold, showDetails, fetchCaregivers])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inactive_30':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive_60':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'inactive_90':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'inactive_30':
        return '⚠️ 30+ dagen'
      case 'inactive_60':
        return '⚠️⚠️ 60+ dagen'
      case 'inactive_90':
        return '🚨 90+ dagen'
      default:
        return 'Inactief'
    }
  }

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!stats || stats.inactive30Days === 0) {
    return (
      <div className="bg-green-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">Alle verzorgers actief!</h3>
            <p className="text-sm text-green-700">Geen inactieve verzorgers gevonden</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Inactieve Verzorgers</h3>
              <p className="text-sm text-gray-600">Verzorgers zonder activiteit</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
          >
            {showDetails ? 'Verberg details' : 'Toon details'}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.inactive30Days}</div>
            <div className="text-xs text-gray-600 mt-1">30+ dagen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.inactive60Days}</div>
            <div className="text-xs text-gray-600 mt-1">60+ dagen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.inactive90Days}</div>
            <div className="text-xs text-gray-600 mt-1">90+ dagen</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      {showDetails && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Filter:</label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="30">30+ dagen inactief</option>
              <option value="60">60+ dagen inactief</option>
              <option value="90">90+ dagen inactief</option>
            </select>
          </div>
        </div>
      )}

      {/* Detailed List */}
      {showDetails && (
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Laden...</p>
            </div>
          ) : caregivers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>Geen inactieve verzorgers voor deze periode</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {caregivers.map((caregiver) => (
                <div
                  key={caregiver.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{caregiver.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(caregiver.status)}`}>
                        {getStatusLabel(caregiver.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{caregiver.email}</p>
                    <p className="text-xs text-gray-500">📍 {caregiver.city}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {caregiver.lastActivity 
                        ? `Laatste activiteit: ${new Date(caregiver.lastActivity).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : 'Geen activiteit gevonden'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {caregiver.daysSinceActivity}
                      <span className="text-xs text-gray-600 block text-center">dagen</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      {showDetails && caregivers.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            💡 Tip: Stuur deze verzorgers een herinnering om weer actief te worden op het platform
          </p>
        </div>
      )}
    </div>
  )
}






















