'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || ''
      }))
    }
  }, [session, status])

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Bewerk profiel</h1>

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
  )
}
