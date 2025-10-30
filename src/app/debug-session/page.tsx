'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugSessionPage() {
  const { data: session } = useSession()
  const [caregiverProfile, setCaregiverProfile] = useState<any>(null)
  const [ownerData, setOwnerData] = useState<any>(null)

  useEffect(() => {
    // Fetch caregiver profile
    fetch('/api/profile/caregiver')
      .then(r => r.json())
      .then(data => setCaregiverProfile(data))
      .catch(err => console.error('Caregiver fetch error:', err))

    // Fetch owner profile
    fetch('/api/profile/owner')
      .then(r => r.json())
      .then(data => setOwnerData(data))
      .catch(err => console.error('Owner fetch error:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Session Info</h1>

        {/* Session Data */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Caregiver Profile */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Caregiver Profile Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(caregiverProfile, null, 2)}
          </pre>
        </div>

        {/* Owner Profile */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Owner Profile Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(ownerData, null, 2)}
          </pre>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Quick Debug</h2>
          <div className="space-y-2">
            <p><strong>User Role:</strong> {session?.user?.role || 'NOT SET'}</p>
            <p><strong>User Email:</strong> {session?.user?.email || 'NOT SET'}</p>
            <p><strong>Has Caregiver Profile:</strong> {caregiverProfile?.hasProfile ? '✅ YES' : '❌ NO'}</p>
            <p><strong>Has Owner Data:</strong> {ownerData?.email ? '✅ YES' : '❌ NO'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}















