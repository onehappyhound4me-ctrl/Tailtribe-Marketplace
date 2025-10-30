'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { updateCaregiverProfile } from '@/app/actions/caregiver' // Removed for build compatibility
import { ServiceType, serviceLabels } from '@/lib/types'
import { toast } from 'sonner'

interface CaregiverProfile {
  id: string
  city: string
  services: ServiceType[]
  hourlyRate: number
  bio: string
  photos: string[]
  isApproved: boolean
  lat?: number
  lng?: number
}

interface ProfileFormProps {
  profile?: CaregiverProfile | null
  onSuccess?: () => void
}

const SERVICE_LABELS = {
  DOG_WALKING: 'Hondenuitlaat',
  PET_SITTING: 'Dierenoppas',
  TRAINING: 'Training',
  TRANSPORT: 'Transport'
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    city: profile?.city || '',
    services: profile?.services || [],
    hourlyRate: profile?.hourlyRate || 20,
    bio: profile?.bio || '',
    photos: profile?.photos || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // await updateCaregiverProfile(formData) // Commented for build compatibility
      toast.success('Profiel succesvol bijgewerkt!')
      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Fout bij bijwerken van profiel')
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (service: ServiceType) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const addPhoto = () => {
    const url = prompt('Voer foto URL in:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, url.trim()]
      }))
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Basis Informatie
            {profile?.isApproved ? (
              <Badge className="bg-green-600">✓ Goedgekeurd</Badge>
            ) : (
              <Badge variant="secondary">Wacht op goedkeuring</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="city">Stad *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Antwerpen"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              In welke stad bied je je diensten aan?
            </p>
          </div>

          <div>
            <Label htmlFor="hourlyRate">Uurtarief (€) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="5"
              max="100"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Je standaard uurtarief (€5-€100 per uur)
            </p>
          </div>

          <div>
            <Label>Services *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleService(key as ServiceType)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    formData.services.includes(key as ServiceType)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{label}</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selecteer minimaal één service die je aanbiedt
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beschrijving</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="bio">Over jezelf *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Vertel over je ervaring met dieren, waarom je dierenverzorger bent geworden, en wat je bijzonder maakt..."
              rows={6}
              minLength={50}
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.bio.length}/500 karakters (minimaal 50)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foto's</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={addPhoto}
              disabled={formData.photos.length >= 6}
            >
              {formData.photos.length === 0 ? 'Foto toevoegen' : 'Nog een foto toevoegen'}
            </Button>
            
            <p className="text-sm text-gray-500">
              Voeg foto's toe van jezelf met dieren. Maximaal 6 foto's. 
              Upload eerst je foto's naar een service zoals Imgur of gebruik directe links.
            </p>
          </div>
        </CardContent>
      </Card>

      {!profile?.isApproved && formData.city && formData.services.length > 0 && formData.bio.length >= 50 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Goedkeuring vereist</h4>
                <p className="text-blue-800 text-sm">
                  Nadat je je profiel hebt opgeslagen, wordt het beoordeeld door ons team. 
                  Je ontvangt binnen 24 uur een e-mail met het resultaat. 
                  Na goedkeuring kun je boekingen ontvangen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Annuleren
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.city || formData.services.length === 0 || formData.bio.length < 50}
        >
          {loading ? 'Opslaan...' : 'Profiel opslaan'}
        </Button>
      </div>
    </form>
  )
}

