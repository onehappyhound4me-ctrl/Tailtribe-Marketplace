'use client'

import { useState, useEffect, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ANIMAL_TYPES, getAnimalTypeLabel } from '@/lib/animal-types'

const SERVICES = [
  { id: 'DOG_WALKING', label: 'Hondenuitlaat' },
  { id: 'GROUP_DOG_WALKING', label: 'Groepsuitlaat' },
  { id: 'DOG_TRAINING', label: 'Hondentraining' },
  { id: 'PET_SITTING', label: 'Dierenoppas' },
  { id: 'PET_BOARDING', label: 'Dierenopvang' },
  { id: 'HOME_CARE', label: 'Verzorging aan huis' },
  { id: 'PET_TRANSPORT', label: 'Transport huisdieren' },
  { id: 'SMALL_ANIMAL_CARE', label: 'Verzorging kleinvee' },
  { id: 'EVENT_COMPANION', label: 'Begeleiding events' }
]

const ANIMAL_SIZES = [
  { id: 'XS', label: 'XS (< 5kg)' },
  { id: 'S', label: 'S (5-15kg)' },
  { id: 'M', label: 'M (15-25kg)' },
  { id: 'L', label: 'L (25-40kg)' },
  { id: 'XL', label: 'XL (> 40kg)' }
]

export default function CaregiverSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  const [formData, setFormData] = useState({
    city: '',
    postalCode: '',
    country: 'BE',
    actionRadius: '10',
    bio: '',
    profilePhoto: '',
    services: [] as string[],
    animalTypes: [] as string[],
    customAnimalTypes: '',
    animalSizes: [] as string[],
    maxAnimalsAtOnce: '3',
    servicePrices: {} as Record<string, string>,
    iban: '',
    accountHolder: '',
    vatNumber: '',
    businessNumber: ''
  })
  
  useEffect(() => {
    loadProfile()
  }, [])
  
  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile/caregiver')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          
          // Parse JSON fields
          let services: string[] = []
          let animalTypes: string[] = []
          let animalSizes: string[] = []
          let servicePrices: Record<string, string> = {}
          
          try {
            // Handle services as either string (JSON) or array
            if (Array.isArray(p.services)) {
              services = p.services
            } else if (typeof p.services === 'string') {
              try {
                services = JSON.parse(p.services)
              } catch {
                // Fallback for old comma-separated format
                services = p.services.split(',')
              }
            }
            
            // Handle animalTypes as either JSON or comma-separated string
            if (p.animalTypes) {
              if (Array.isArray(p.animalTypes)) {
                animalTypes = p.animalTypes
              } else if (typeof p.animalTypes === 'string') {
                try {
                  animalTypes = JSON.parse(p.animalTypes)
                } catch {
                  animalTypes = p.animalTypes.split(',')
                }
              }
            }
            
            // Handle animalSizes as either JSON or comma-separated string
            if (p.animalSizes) {
              if (Array.isArray(p.animalSizes)) {
                animalSizes = p.animalSizes
              } else if (typeof p.animalSizes === 'string') {
                try {
                  animalSizes = JSON.parse(p.animalSizes)
                } catch {
                  animalSizes = p.animalSizes.split(',')
                }
              }
            }
            
            // Handle servicePrices as either JSON string or object
            if (p.servicePrices) {
              if (typeof p.servicePrices === 'object') {
                servicePrices = p.servicePrices
              } else if (typeof p.servicePrices === 'string') {
                try {
                  servicePrices = JSON.parse(p.servicePrices)
                } catch {
                  servicePrices = {}
                }
              }
            }
          } catch (e) {
            console.error('Parse error:', e)
          }
          
          setFormData({
            city: p.city || '',
            postalCode: p.postalCode || '',
            country: p.country || 'BE',
            actionRadius: p.actionRadius?.toString() || '10',
            bio: p.bio || '',
            profilePhoto: p.profilePhoto || '',
            services,
            animalTypes,
            customAnimalTypes: p.customAnimalTypes || '',
            animalSizes,
            maxAnimalsAtOnce: p.maxAnimalsAtOnce?.toString() || '3',
            servicePrices,
            iban: p.iban || '',
            accountHolder: p.accountHolder || '',
            vatNumber: p.vatNumber || '',
            businessNumber: p.businessNumber || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/caregiver', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: formData.city,
          postalCode: formData.postalCode,
          actionRadius: parseInt(formData.actionRadius),
          bio: formData.bio,
          profilePhoto: formData.profilePhoto,
          hourlyRate: 25, // Default value
          services: formData.services,
          animalTypes: formData.animalTypes,
          customAnimalTypes: formData.customAnimalTypes,
          animalSizes: formData.animalSizes,
          maxAnimalsAtOnce: parseInt(formData.maxAnimalsAtOnce),
          servicePrices: formData.servicePrices,
          iban: formData.iban,
          accountHolder: formData.accountHolder,
          vatNumber: formData.vatNumber,
          businessNumber: formData.businessNumber
        })
      })
      
      if (res.ok) {
        toast.success('Profiel bijgewerkt!')
        router.push('/dashboard/caregiver')
      } else {
        const errorData = await res.json()
        console.error('❌ Save failed:', errorData)
        toast.error(errorData.error || 'Er ging iets mis')
      }
    } catch (error) {
      toast.error('Er ging iets mis')
    } finally {
      setSaving(false)
    }
  }
  
  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }))
  }
  
  const toggleAnimalType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      animalTypes: prev.animalTypes.includes(typeId)
        ? prev.animalTypes.filter(t => t !== typeId)
        : [...prev.animalTypes, typeId]
    }))
  }
  
  const toggleAnimalSize = (sizeId: string) => {
    setFormData(prev => ({
      ...prev,
      animalSizes: prev.animalSizes.includes(sizeId)
        ? prev.animalSizes.filter(s => s !== sizeId)
        : [...prev.animalSizes, sizeId]
    }))
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profiel Instellingen</h1>
              <p className="text-gray-600">Beheer je verzorger profiel</p>
            </div>
            <Link href="/dashboard/caregiver" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg font-semibold shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-8 py-8 max-w-5xl">
        {/* Content - All sections on one page */}
        <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
          {/* Profiel & Locatie Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profiel & Locatie</h2>
              
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium mb-2">Profielfoto</label>
              <div className="flex items-center gap-4">
                {formData.profilePhoto ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.profilePhoto} 
                      alt="Profiel" 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, profilePhoto: '' }))
                        toast.info('Foto verwijderd uit het formulier. Klik op Opslaan om te bevestigen.')
                      }}
                    >
                      Verwijder foto
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        // Eerst verwijderen, dan nieuwe kiezen
                        setFormData(prev => ({ ...prev, profilePhoto: '' }))
                        // Kleine delay om state te laten toepassen, dan open file chooser
                        setTimeout(() => fileInputRef.current?.click(), 50)
                      }}
                    >
                      Nieuwe foto kiezen
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  {/* Direct upload */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (!file.type.startsWith('image/')) {
                        toast.error('Alleen afbeeldingen zijn toegestaan')
                        return
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Afbeelding mag maximaal 5MB zijn')
                        return
                      }
                      
                      toast.info('Foto wordt geüpload...')
                      const controller = new AbortController()
                      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 sec timeout
                      
                      try {
                        // 1) Client-side compressie
                        const compressed = await imageCompression(file, {
                          maxSizeMB: 0.4,
                          maxWidthOrHeight: 1024,
                          useWebWorker: true,
                          initialQuality: 0.8
                        })
                        
                        // 2) Directe Cloudinary upload (unsigned) indien public env vars aanwezig
                        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

                        let imageUrl: string | null = null

                        if (cloudName && uploadPreset) {
                          const fd = new FormData()
                          fd.append('file', compressed)
                          fd.append('upload_preset', uploadPreset)
                          fd.append('folder', 'tailtribe/profile-photos')

                          const doDirect = async () => fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                            method: 'POST',
                            body: fd,
                            signal: controller.signal
                          })

                          let res = await doDirect()
                          if (!res.ok) {
                            await new Promise(r => setTimeout(r, 600))
                            res = await doDirect()
                          }
                          clearTimeout(timeoutId)
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({ error: 'Upload mislukt' }))
                            throw new Error(data.error || 'Upload mislukt')
                          }
                          const data = await res.json()
                          imageUrl = data.secure_url as string
                        } else {
                          // Fallback naar eigen API route
                          const fd = new FormData()
                          fd.append('photo', compressed)
                          const doUpload = async () => fetch('/api/profile/upload-photo', { 
                            method: 'POST', 
                            body: fd,
                            signal: controller.signal
                          })
                          let res = await doUpload()
                          if (!res.ok) {
                            await new Promise(r => setTimeout(r, 600))
                            res = await doUpload()
                          }
                          clearTimeout(timeoutId)
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({ error: 'Upload mislukt' }))
                            throw new Error(data.error || 'Upload mislukt')
                          }
                          const data = await res.json()
                          imageUrl = data.url as string
                        }

                        setFormData(prev => ({ ...prev, profilePhoto: imageUrl || '' }))
                        toast.success('Foto succesvol geüpload!')
                        // Reset file input to allow re-uploading the same file name later
                        try { (e.target as HTMLInputElement).value = '' } catch {}
                      } catch (err: any) {
                        if (err.name === 'AbortError') {
                          toast.error('Upload timeout - probeer een kleinere foto')
                        } else {
                          toast.error(err.message || 'Fout bij uploaden')
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500">Max 5MB. Ondersteund: JPG, PNG, WebP.</p>
                  {/* URL fallback */}
                  <input
                    type="text"
                    value={formData.profilePhoto}
                    onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Of plak een foto-URL"
                  />
                  <p className="text-xs text-gray-500">Je kunt een bestand kiezen of een URL plakken.</p>
                </div>
              </div>
            </div>
              
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Postcode *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stad *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
              
            <div>
              <label className="block text-sm font-medium mb-2">Actieradius (km) *</label>
              <input
                type="number"
                value={formData.actionRadius}
                onChange={(e) => setFormData({ ...formData, actionRadius: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="100"
              />
            </div>
              
            <div>
              <label className="block text-sm font-medium mb-2">Bio *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Vertel over je ervaring met dieren..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
            </div>
          </div>
          
          {/* Diensten & Dieren Section */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Diensten & Dieren</h2>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Diensten *</h3>
              <div className="grid grid-cols-2 gap-4">
                {SERVICES.map(service => (
                  <label key={service.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.services.includes(service.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-medium">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>
              
            {/* Prijzen */}
            {formData.services.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Prijzen per dienst (€/uur) *</h3>
                <div className="grid grid-cols-2 gap-4">
                  {formData.services.map(serviceId => {
                    const service = SERVICES.find(s => s.id === serviceId)
                    return (
                      <div key={serviceId}>
                        <label className="block text-sm font-medium mb-2">{service?.label}</label>
                        <input
                          type="number"
                          value={formData.servicePrices[serviceId] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            servicePrices: { ...formData.servicePrices, [serviceId]: e.target.value }
                          })}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                          min="1"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
              
            {/* Diersoorten */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Diersoorten *</h3>
              <div className="grid grid-cols-3 gap-4">
                {ANIMAL_TYPES.map(type => (
                  <label key={type.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.animalTypes.includes(type.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.animalTypes.includes(type.id)}
                      onChange={() => toggleAnimalType(type.id)}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-medium text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
                
              {formData.animalTypes.includes('OTHER') && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Andere dieren (specificeer)</label>
                  <input
                    type="text"
                    value={formData.customAnimalTypes}
                    onChange={(e) => setFormData({ ...formData, customAnimalTypes: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Bijv: Herten, Ezels, Geiten"
                  />
                </div>
              )}
            </div>
              
            {/* Diermaten */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Diermaten *</h3>
              <div className="grid grid-cols-3 gap-4">
                {ANIMAL_SIZES.map(size => (
                  <label key={size.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.animalSizes.includes(size.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.animalSizes.includes(size.id)}
                      onChange={() => toggleAnimalSize(size.id)}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-medium text-sm">{size.label}</span>
                  </label>
                ))}
              </div>
            </div>
              
            {/* Capaciteit */}
            <div>
              <label className="block text-sm font-medium mb-2">Max aantal dieren tegelijk *</label>
              <input
                type="number"
                value={formData.maxAnimalsAtOnce}
                onChange={(e) => setFormData({ ...formData, maxAnimalsAtOnce: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="20"
              />
            </div>
          </div>
          
          {/* Financiële Gegevens Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Financiële Gegevens</h2>
              
            <div>
              <label className="block text-sm font-medium mb-2">IBAN *</label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="BE00 0000 0000 0000"
              />
            </div>
              
            <div>
              <label className="block text-sm font-medium mb-2">Rekeninghouder *</label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
              
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">BTW nummer (optioneel)</label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="BE 0000.000.000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">KVK nummer (optioneel)</label>
                <input
                  type="text"
                  value={formData.businessNumber}
                  onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Beveiliging Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Beveiliging</h2>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">Wachtwoord wijzigen</h3>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Veilig</span>
              </div>
              <div className="space-y-2">
                <input 
                  type="password" 
                  placeholder="Huidig wachtwoord" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                />
                <input 
                  type="password" 
                  placeholder="Nieuw wachtwoord (min. 8 karakters)" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                />
                <input 
                  type="password" 
                  placeholder="Bevestig nieuw wachtwoord" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                />
              </div>
              <button 
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 rounded-lg py-2 text-sm font-medium transition-colors mt-3"
              >
                Wachtwoord wijzigen
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Twee-factor authenticatie</h3>
                <p className="text-sm text-gray-600">Extra beveiliging voor je account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Notificaties Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notificaties</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Email notificaties</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Nieuwe berichten</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Boekingen updates</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-red-800 mb-6">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">Deze actie kan niet ongedaan gemaakt worden. Al je gegevens worden permanent verwijderd.</p>
            
            <button 
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Account permanent verwijderen
            </button>
          </div>
          
          {/* Save button */}
          <div className="mt-8 pt-6 border-t flex gap-4">
            <Button
              onClick={() => router.push('/dashboard/caregiver')}
              variant="outline"
              className="flex-1"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}








