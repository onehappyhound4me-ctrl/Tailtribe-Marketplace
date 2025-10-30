'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'CAREGIVER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  createdAt: Date
  lastLogin?: Date
  totalBookings: number
  averageRating?: number
  isVerified: boolean
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Janssens',
    email: 'sarah.janssens@email.com',
    role: 'CAREGIVER',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-20'),
    totalBookings: 45,
    averageRating: 4.9,
    isVerified: true
  },
  {
    id: '2',
    name: 'Tom Vermeulen',
    email: 'tom.vermeulen@email.com',
    role: 'CAREGIVER',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-12'),
    lastLogin: new Date('2024-01-19'),
    totalBookings: 32,
    averageRating: 4.8,
    isVerified: true
  },
  {
    id: '3',
    name: 'Jan Vermeersch',
    email: 'jan.vermeersch@email.com',
    role: 'OWNER',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-20'),
    totalBookings: 8,
    isVerified: true
  },
  {
    id: '4',
    name: 'Lisa De Vries',
    email: 'lisa.devries@email.com',
    role: 'CAREGIVER',
    status: 'PENDING',
    createdAt: new Date('2024-01-18'),
    totalBookings: 0,
    isVerified: false
  }
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedRole, setSelectedRole] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesRole && matchesStatus && matchesSearch
  })

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ))
  }

  const handleVerification = (userId: string, verified: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isVerified: verified } : user
    ))
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      case 'CAREGIVER': return 'bg-green-100 text-green-800'
      case 'OWNER': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="gradient-card professional-shadow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          👥 Gebruikersbeheer
        </CardTitle>
        <p className="text-gray-600">
          Beheer gebruikersaccounts, verificaties en status
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoeken
            </label>
            <input
              type="text"
              placeholder="Naam of email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="ALL">Alle rollen</option>
              <option value="OWNER">Eigenaren</option>
              <option value="CAREGIVER">Verzorgers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="ALL">Alle statussen</option>
              <option value="ACTIVE">Actief</option>
              <option value="PENDING">In behandeling</option>
              <option value="SUSPENDED">Geschorst</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button className="w-full gradient-button">
              📊 Exporteer Data
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'OWNER').length}
            </div>
            <div className="text-sm text-blue-700">Eigenaren</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'CAREGIVER').length}
            </div>
            <div className="text-sm text-green-700">Verzorgers</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'PENDING').length}
            </div>
            <div className="text-sm text-yellow-700">In behandeling</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.isVerified).length}
            </div>
            <div className="text-sm text-purple-700">Geverifieerd</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Gebruiker</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Rol</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Boekingen</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Beoordeling</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Laatste login</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {user.name}
                          {user.isVerified && (
                            <span className="text-green-500" title="Geverifieerd">✓</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === 'CAREGIVER' ? 'Verzorger' : 
                       user.role === 'OWNER' ? 'Eigenaar' : 'Admin'}
                    </Badge>
                  </td>
                  <td className="py-4 px-2">
                    <Badge className={getStatusColor(user.status)}>
                      {user.status === 'ACTIVE' ? 'Actief' :
                       user.status === 'PENDING' ? 'In behandeling' : 'Geschorst'}
                    </Badge>
                  </td>
                  <td className="py-4 px-2">
                    <span className="font-medium">{user.totalBookings}</span>
                  </td>
                  <td className="py-4 px-2">
                    {user.averageRating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">{user.averageRating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    {user.lastLogin ? (
                      <span className="text-sm text-gray-600">
                        {user.lastLogin.toLocaleDateString('nl-NL')}
                      </span>
                    ) : (
                      <span className="text-gray-400">Nooit</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      {user.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            ✓ Goedkeuren
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                            className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
                          >
                            ✗ Afwijzen
                          </Button>
                        </>
                      )}
                      
                      {user.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                          className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 text-xs"
                        >
                          ⏸️ Schorsen
                        </Button>
                      )}
                      
                      {user.status === 'SUSPENDED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          🔓 Heractiveren
                        </Button>
                      )}
                      
                      {!user.isVerified && user.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerification(user.id, true)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs"
                        >
                          ✓ Verifiëren
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Geen gebruikers gevonden
            </h3>
            <p className="text-gray-600">
              Pas je filters aan om gebruikers te bekijken.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
