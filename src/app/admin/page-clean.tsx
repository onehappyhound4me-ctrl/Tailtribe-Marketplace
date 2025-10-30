import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'

export default async function AdminPage() {
  // Get admin statistics
  let stats = {
    totalUsers: 0,
    totalCaregivers: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    totalRevenue: 0
  }

  try {
    const [
      totalUsers,
      totalCaregivers,
      pendingApprovals,
      totalBookings,
      paidBookings
    ] = await Promise.all([
      db.user.count(),
      db.caregiverProfile.count(),
      db.caregiverProfile.count({ where: { isApproved: false } }),
      db.booking.count(),
      db.booking.findMany({ 
        where: { status: 'PAID' },
        select: { amountCents: true }
      })
    ])

    const totalRevenue = paidBookings.reduce((sum, booking) => sum + booking.amountCents, 0) / 100

    stats = {
      totalUsers,
      totalCaregivers,
      pendingApprovals,
      totalBookings,
      totalRevenue
    }
  } catch (error) {
    console.error('Error loading admin stats:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Beheer het TailTribe platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  TOTAAL GEBRUIKERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  VERZORGERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalCaregivers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  WACHT OP GOEDKEURING
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.pendingApprovals}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  TOTAAL BOEKINGEN
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalBookings}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  OMZET
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  €{stats.totalRevenue.toFixed(0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Acties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center" asChild>
                  <Link href="/admin/users">
                    <span className="text-3xl mb-2">👥</span>
                    <span>Gebruikers Beheren</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center" asChild>
                  <Link href="/admin/bookings">
                    <span className="text-3xl mb-2">📅</span>
                    <span>Boekingen Bekijken</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center" asChild>
                  <Link href="/admin/reports">
                    <span className="text-3xl mb-2">📊</span>
                    <span>Rapportages</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

