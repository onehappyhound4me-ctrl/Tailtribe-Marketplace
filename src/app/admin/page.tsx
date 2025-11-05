'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PLATFORM_CONFIG } from '@/lib/constants'
import { InactiveCaregiversWidget } from '@/components/admin/InactiveCaregiversWidget'

interface Stats {
  totalUsers: number
  totalCaregivers: number
  totalBookings: number
  totalRevenue: number
  pendingBookings: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  caregiverProfile?: {
    city: string
    isApproved: boolean
    hourlyRate: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' })
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      }
    } catch (error) {
      toast.error('Fout bij laden data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN')) {
      router.push('/')
      return
    }
    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session, status, router, fetchData])

  const approveCaregiver = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'approve_caregiver'
        })
      })

      if (!res.ok) throw new Error()

      toast.success('Verzorger goedgekeurd!')
      fetchData()
    } catch (error) {
      toast.error('Fout bij goedkeuren')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Totaal users</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">🐾</div>
              <div className="text-3xl font-bold">{stats.totalCaregivers}</div>
              <div className="text-sm text-gray-600">Verzorgers</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Boekingen</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-3xl font-bold text-green-600">€{stats.totalRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Revenue ({PLATFORM_CONFIG.COMMISSION_PERCENTAGE}%)</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        )}

        {/* Inactive Caregivers Alert */}
        <div className="mb-8">
          <InactiveCaregiversWidget />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Gebruikers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Naam</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Stad</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Acties</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'CAREGIVER' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{user.caregiverProfile?.city || '-'}</td>
                    <td className="py-3 px-4">
                      {user.caregiverProfile && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.caregiverProfile.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.caregiverProfile.isApproved ? 'Goedgekeurd' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.caregiverProfile && !user.caregiverProfile.isApproved && (
                        <button
                          onClick={() => approveCaregiver(user.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                        >
                          Goedkeuren
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
