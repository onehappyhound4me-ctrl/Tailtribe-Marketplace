'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PhotoUpload } from '@/components/profile/PhotoUpload'
import { toast } from 'sonner'

const SERVICES = [
  { value: 'DOG_WALKING', label: 'Hondenuitlaat' },
  { value: 'GROUP_DOG_WALKING', label: 'Groepsuitlaat' },
  { value: 'DOG_TRAINING', label: 'Hondentraining' },
  { value: 'PET_SITTING', label: 'Dierenoppas' },
  { value: 'PET_BOARDING', label: 'Dierenopvang' },
  { value: 'HOME_CARE', label: 'Verzorging aan huis' },
  { value: 'PET_TRANSPORT', label: 'Transport huisdieren' },
  { value: 'SMALL_ANIMAL_CARE', label: 'Verzorging kleinvee' },
  { value: 'EVENT_COMPANION', label: 'Begeleiding events' },
]

export default function ProfileEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    city: '',
    hourlyRate: 20,
    services: [] as string[]
  })

  const loadCaregiverProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/caregiver', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          console.log('📥 Loaded profile for edit:', data.profile)
          
          // Parse JSON fields
          let services: string[] = []
          try {
            services = data.profile.services ? data.profile.services.split(',') : []
          } catch (e) {
            console.error('Error parsing services:', e)
          }
          
          setFormData(prev => ({
            ...prev,
            bio: data.profile.bio || '',
            city: data.profile.city || '',
            hourlyRate: data.profile.hourlyRate || 20,
            services: services
          }))
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || ''
      }))
      if (session.user.role === 'CAREGIVER') {
        loadCaregiverProfile()
      }
    }
  }, [session, status, router, loadCaregiverProfile])

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      toast.success('Profiel bijgewerkt!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Fout bij bijwerken')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Bewerk profiel</h1>
          <Link href="/dashboard/caregiver" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
        </div>
      </div>
      
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-md p-8">

          {/* Photo Upload */}
          <PhotoUpload 
            currentImage={session?.user?.image}
            onUploadComplete={(url) => {
              toast.success('Profielfoto bijgewerkt!')
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Naam</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>

            {session?.user?.role === 'CAREGIVER' && (
              <>
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                    placeholder="Vertel over je ervaring met dieren..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-2">Stad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                    placeholder="Antwerpen"
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-medium mb-2">Uurtarief (€)</label>
                  <input
                    type="number"
                    min={5}
                    max={800}
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium mb-3">Diensten die je aanbiedt</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SERVICES.map((service) => (
                      <button
                        key={service.value}
                        type="button"
                        onClick={() => toggleService(service.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          formData.services.includes(service.value)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className="font-medium text-sm">{service.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4"
            >
              {loading ? 'Opslaan...' : 'Wijzigingen opslaan'}
            </Button>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}
