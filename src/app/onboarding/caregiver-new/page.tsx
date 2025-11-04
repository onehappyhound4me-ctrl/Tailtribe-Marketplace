'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { PLATFORM_CONFIG } from '@/lib/constants'
import { validatePostcode, validateIBAN, validateName, validateBio, validateActionRadius, validateCity, validatePrice } from '@/lib/validation'
import { validatePostcodeWithCity } from '@/lib/postcode-validator'
import { getCoordinates } from '@/lib/geocoding'
import { ANIMAL_TYPES } from '@/lib/animal-types'
import { BadgeUploadField } from '@/components/onboarding/BadgeUploadField'

type Step = 1 | 2 | 3 | 4 | 5

const SERVICES = [
  { id: 'DOG_WALKING', label: 'Hondenuitlaat', icon: '●' },
  { id: 'GROUP_DOG_WALKING', label: 'Groepsuitlaat', icon: '●' },
  { id: 'DOG_TRAINING', label: 'Hondentraining', icon: '●' },
  { id: 'PET_SITTING', label: 'Dierenoppas', icon: '●' },
  { id: 'PET_BOARDING', label: 'Dierenopvang', icon: '●' },
  { id: 'HOME_CARE', label: 'Verzorging aan huis', icon: '●' },
  { id: 'EVENT_COMPANION', label: 'Begeleiding events', icon: '●' },
  { id: 'PET_TRANSPORT', label: 'Transport huisdieren', icon: '●' },
  { id: 'SMALL_ANIMAL_CARE', label: 'Verzorging kleinvee', icon: '●' }
]

const ANIMAL_SIZES = [
  { id: 'XS', label: 'XS (< 5kg)', icon: '◦' },
  { id: 'S', label: 'S (5-10kg)', icon: '◦' },
  { id: 'M', label: 'M (10-25kg)', icon: '◦' },
  { id: 'L', label: 'L (25-40kg)', icon: '◦' },
  { id: 'XL', label: 'XL (> 40kg)', icon: '◦' }
]

export default function CaregiverNewOnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: Profiel
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    profilePhoto: '',
    postalCode: '',
    city: '',
    country: 'BE', // Will be auto-detected from postcode
    actionRadius: '10',
    bio: ''
  })
  
  // Step 2: Diensten & Prijzen
  const [servicesData, setServicesData] = useState({
    services: [] as string[],
    animalTypes: [] as string[],
    customAnimalTypes: '' as string, // For when OTHER is selected
    animalSizes: [] as string[],
    maxAnimalsAtOnce: '3',
    servicePrices: {} as Record<string, string>
  })
  
  // Step 4: Optionele Badges
  const [badgesData, setBadgesData] = useState({
    hasInsurance: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    insuranceFile: '',
    hasFirstAid: false,
    firstAidCertificate: '',
    businessNumber: '',
    vatNumber: '',
    
    // Nieuwe badges
    animalCareDiploma: '',
    dogTrainerCertificate: '',
    behaviorSpecialistCertificate: '',
    animalFirstAidCertificate: '',
    horseExperienceProof: '',
    hygieneCertificate: '',
    transportProof: '',
    groomingCertificate: '',
    physiotherapyCertificate: '',
    nutritionCertificate: '',
    noseworkCertificate: '',
    puppySocializationPlan: '',
    sportEnrichmentProof: '',
    eventCompanionReferences: ''
  })
  
  // Step 5: Uitbetaling
  const [payoutData, setPayoutData] = useState({
    iban: '',
    accountHolder: '',
    platformRulesAgreed: false
  })

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Alleen afbeeldingen zijn toegestaan')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Afbeelding mag maximaal 5MB zijn')
      return
    }

    // Upload to server with compression + timeout + retry
    try {
      toast.info('Foto wordt geüpload...')
      
      // 1) Client-side compressie
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.8
      })
      
      // Directe Cloudinary upload (unsigned) indien public env vars aanwezig
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

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
        // Fallback: via eigen API
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

      setProfileData(prev => ({ ...prev, profilePhoto: imageUrl || '' }))
      toast.success('Profielfoto geüpload!')
    } catch (error: any) {
      console.error('Upload error:', error)
      if (error.name === 'AbortError') {
        toast.error('Upload timeout - probeer opnieuw of gebruik een kleinere foto')
      } else {
        toast.error(error.message || 'Fout bij uploaden van foto')
      }
    }
  }

  // Function to load existing data from database
  const loadExistingData = async () => {
    try {
      console.log('🔄 Loading existing caregiver data...')
      const res = await fetch('/api/profile/caregiver')
      console.log('📥 Response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('📊 Loaded data:', data)
        
        if (data.hasProfile && data.profile) {
          const profile = data.profile
          console.log('✅ Profile found, populating fields...')
          
          // Populate profile data
          if (profile.city || profile.postalCode) {
            setProfileData(prev => ({
              ...prev,
              profilePhoto: profile.profilePhoto || '',
              postalCode: profile.postalCode || '',
              city: profile.city || '',
              country: profile.country || 'BE',
              actionRadius: profile.actionRadius?.toString() || '10',
              bio: profile.bio || ''
            }))
          }
          
          // Populate services data
          if (profile.services || profile.servicePrices) {
            // Parse JSON strings
            let services = []
            let animalTypes = []
            let animalSizes = []
            let servicePrices = {}
            
            try {
              services = profile.services ? (typeof profile.services === 'string' ? profile.services.split(',') : profile.services) : []
            } catch (e) { console.error('Parse services error:', e) }
            
            try {
              animalTypes = profile.animalTypes ? (typeof profile.animalTypes === 'string' ? JSON.parse(profile.animalTypes) : profile.animalTypes) : []
            } catch (e) { console.error('Parse animalTypes error:', e) }
            
            try {
              animalSizes = profile.animalSizes ? (typeof profile.animalSizes === 'string' ? JSON.parse(profile.animalSizes) : profile.animalSizes) : []
            } catch (e) { console.error('Parse animalSizes error:', e) }
            
            try {
              servicePrices = profile.servicePrices ? (typeof profile.servicePrices === 'string' ? JSON.parse(profile.servicePrices) : profile.servicePrices) : {}
            } catch (e) { console.error('Parse servicePrices error:', e) }
            
            setServicesData({
              services,
              animalTypes,
              customAnimalTypes: profile.customAnimalTypes || '',
              animalSizes,
              maxAnimalsAtOnce: profile.maxAnimalsAtOnce?.toString() || '3',
              servicePrices
            })
          }
          
          // Populate badges data
          setBadgesData(prev => ({
            ...prev,
            hasInsurance: !!profile.insurance,
            insuranceProvider: profile.insurance?.provider || '',
            insurancePolicyNumber: profile.insurance?.policyNumber || '',
            insuranceExpiryDate: profile.insurance?.expiryDate || '',
            insuranceFile: profile.insurance?.file || '',
            hasFirstAid: !!profile.firstAid,
            firstAidCertificate: profile.firstAidCertificate || '',
            businessNumber: profile.businessNumber || ''
          }))
          
          // Populate payout data
          if (profile.iban) {
            setPayoutData({
              iban: profile.iban || '',
              accountHolder: profile.accountHolder || '',
              platformRulesAgreed: !!profile.platformRulesAgreed
            })
          }
        }
      }
    } catch (error) {
      console.error('Error loading caregiver data:', error)
    }
  }

  // Load existing data on mount
  useEffect(() => {
    if (session?.user) {
      // Load name from session if available
      if (session.user.name) {
        const parts = session.user.name.split(' ')
        setProfileData(prev => ({
          ...prev,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || ''
        }))
      }
      
      // Check if user already has a profile and redirect
      checkExistingProfile()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const checkExistingProfile = async () => {
    try {
      const res = await fetch('/api/profile/caregiver')
      if (res.ok) {
        const data = await res.json()
        if (data.hasProfile && data.profile) {
          console.log('✅ Profile exists, redirecting to dashboard')
          toast.info('Je hebt al een profiel! Je wordt doorgestuurd naar je dashboard.')
          router.push('/dashboard/caregiver')
          return
        }
      }
      // No profile exists, load onboarding data
      loadExistingData()
    } catch (error) {
      console.error('Error checking profile:', error)
      loadExistingData()
    }
  }

  // Toggle functions
  const toggleService = (serviceId: string) => {
    setServicesData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }))
  }

  const toggleAnimalType = (typeId: string) => {
    setServicesData(prev => ({
      ...prev,
      animalTypes: prev.animalTypes.includes(typeId)
        ? prev.animalTypes.filter(t => t !== typeId)
        : [...prev.animalTypes, typeId]
    }))
  }

  const toggleAnimalSize = (sizeId: string) => {
    setServicesData(prev => ({
      ...prev,
      animalSizes: prev.animalSizes.includes(sizeId)
        ? prev.animalSizes.filter(s => s !== sizeId)
        : [...prev.animalSizes, sizeId]
    }))
  }

  // Availability functions removed - caregivers set availability in dashboard

  // Step handlers
  const handleStep1 = async () => {
    // Validate first name
    if (!profileData.firstName || profileData.firstName.trim().length < 2) {
      toast.error('Voornaam moet minimaal 2 karakters zijn')
      return
    }
    
    // Validate last name
    if (!profileData.lastName || profileData.lastName.trim().length < 2) {
      toast.error('Achternaam moet minimaal 2 karakters zijn')
      return
    }
    
    // Validate postcode format
    const postcodeCheck = validatePostcode(profileData.postalCode, profileData.country)
    if (!postcodeCheck.valid) {
      toast.error(postcodeCheck.error)
      return
    }

    // Validate city
    const cityCheck = validateCity(profileData.city)
    if (!cityCheck.valid) {
      toast.error(cityCheck.error)
      return
    }

    // Validate action radius
    const radiusCheck = validateActionRadius(profileData.actionRadius)
    if (!radiusCheck.valid) {
      toast.error(radiusCheck.error)
      return
    }

    // Validate bio
    const bioCheck = validateBio(profileData.bio, 50)
    if (!bioCheck.valid) {
      toast.error(bioCheck.error)
      return
    }

    if (profileData.bio.length > 140) {
      toast.error('Bio mag max 140 karakters zijn')
      return
    }

    // Validate profile photo URL if provided (optional)
    if (profileData.profilePhoto && profileData.profilePhoto.trim().length > 0) {
      // Basic URL validation for profile photo
      try {
        new URL(profileData.profilePhoto)
      } catch {
        toast.error('Profielfoto URL is ongeldig')
        return
      }
    }

    // VALIDATE postcode + city match with REAL API
    toast.info('Postcode en stad controleren...')
    try {
      const validation = await validatePostcodeWithCity(profileData.postalCode, profileData.city, profileData.country)
      
      if (!validation.valid) {
        // BLOKKEER - verkeerde combinatie!
        toast.error(validation.error || 'Postcode en stad komen niet overeen')
        return
      }
      
      // Valid! Continue
      toast.success('Basisprofiel opgeslagen!')
      setCurrentStep(2)
    } catch (validationError) {
      console.error('Validation API failed:', validationError)
      toast.error('Kon postcode niet controleren. Probeer opnieuw.')
      return
    }
  }

  const handleStep2 = async () => {
    if (servicesData.services.length === 0) {
      toast.error('Selecteer minimaal 1 dienst')
      return
    }
    if (servicesData.animalTypes.length === 0) {
      toast.error('Selecteer minimaal 1 diersoort')
      return
    }
    if (servicesData.animalTypes.includes('OTHER') && !servicesData.customAnimalTypes.trim()) {
      toast.error('Specificeer welke andere dieren bij "Anders"')
      return
    }
    if (servicesData.animalSizes.length === 0) {
      toast.error('Selecteer minimaal 1 grootte')
      return
    }
    // Check if all selected services have prices
    const missingPrices = servicesData.services.filter(s => !servicesData.servicePrices[s])
    if (missingPrices.length > 0) {
      toast.error('Vul een vanaf-prijs in voor alle geselecteerde diensten')
      return
    }
    setCurrentStep(3)
  }

  const handleStep3 = async () => {
    // No validation needed for platform policy step
    setCurrentStep(4)
  }

  const handleStep4 = async () => {
    // Validate insurance if provided
    if (badgesData.hasInsurance) {
      if (!badgesData.insuranceProvider || badgesData.insuranceProvider.trim().length < 2) {
        toast.error('Vul de naam van de verzekeraar in')
        return
      }
      if (!badgesData.insurancePolicyNumber || badgesData.insurancePolicyNumber.trim().length < 3) {
        toast.error('Vul een geldig polisnummer in')
        return
      }
      if (!badgesData.insuranceExpiryDate) {
        toast.error('Vul de vervaldatum van de verzekering in')
        return
      }
      // Check if expiry date is not in the past
      const expiryDate = new Date(badgesData.insuranceExpiryDate)
      if (expiryDate < new Date()) {
        toast.error('Verzekering is verlopen, vul een geldige verzekering in')
        return
      }
    }

    // Validate business number if provided
    if (badgesData.businessNumber) {
      if (badgesData.businessNumber.trim().length < 5) {
        toast.error('BTW/KVK nummer moet minimaal 5 tekens zijn')
        return
      }
    }

    toast.success('Badges opgeslagen!')
    setCurrentStep(5)
  }

  const handleComplete = async () => {
    // Validate IBAN
    const ibanCheck = validateIBAN(payoutData.iban)
    if (!ibanCheck.valid) {
      toast.error(ibanCheck.error)
      return
    }

    // Validate account holder
    const holderCheck = validateName(payoutData.accountHolder, 'Rekeninghouder')
    if (!holderCheck.valid) {
      toast.error(holderCheck.error)
      return
    }

    // Check agreements
    if (!payoutData.platformRulesAgreed) {
      toast.error('Je moet akkoord gaan met de Algemene Voorwaarden')
      return
    }

    setLoading(true)
    
    // Try to get coordinates (optional - don't block if it fails)
    let coords = { lat: null, lng: null }
    try {
      const geoResult = await getCoordinates(profileData.postalCode, profileData.city, profileData.country)
      if (geoResult.success && geoResult.lat && geoResult.lng) {
        coords = { lat: geoResult.lat, lng: geoResult.lng }
      }
    } catch (geoError) {
      console.log('Geocoding failed, continuing without coordinates:', geoError)
      // Continue without coords - not critical
    }
    
    try {
      const payload = {
          profile: {
            ...profileData,
            lat: coords.lat,
            lng: coords.lng
          },
          services: servicesData,
          badges: badgesData,
          payout: payoutData
      }
      
      console.log('📤 Sending onboarding data:', payload)
      console.log('🔍 Profile data:', profileData)
      console.log('🔍 Services data:', servicesData)
      console.log('🔍 Badges data:', badgesData)
      console.log('🔍 Payout data:', payoutData)
      
      const res = await fetch('/api/caregiver/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📥 Response status:', res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.details || errorData.error || 'Onboarding mislukt')
      }
      
      toast.success('🎉 Profiel aangemaakt!')
      router.push('/dashboard/caregiver')
      router.refresh()
    } catch (error: any) {
      console.error('Complete onboarding error:', error)
      toast.error(error.message || 'Er ging iets mis bij het voltooien')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Stap {currentStep} van 5</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% compleet</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: PROFIEL */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Account & Profiel
                </h2>
                <p className="text-gray-600">
                  Maak je basisprofiel aan (~60 seconden)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Voornaam *
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Jan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Achternaam *
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Janssen"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={profileData.postalCode}
                    onChange={(e) => {
                      const value = e.target.value
                      setProfileData({ ...profileData, postalCode: value })
                      // Auto-detect country: NL postcodes have letters, BE are only numbers
                      if (value.match(/[a-zA-Z]/)) {
                        setProfileData(prev => ({ ...prev, postalCode: value, country: 'NL' }))
                      } else if (value.length >= 4) {
                        setProfileData(prev => ({ ...prev, postalCode: value, country: 'BE' }))
                      }
                    }}
                    onBlur={() => {
                      if (profileData.postalCode) {
                        const check = validatePostcode(profileData.postalCode, profileData.country)
                        if (!check.valid) {
                          toast.error(check.error)
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="1012AB of 1000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.country === 'NL' ? '🇳🇱 Nederland gedetecteerd' : '🇧🇪 België gedetecteerd'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gemeente *
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    onBlur={() => {
                      if (profileData.city) {
                        const check = validateCity(profileData.city)
                        if (!check.valid) {
                          toast.error(check.error)
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Amsterdam, Brussel, ..."
                    required
                  />
                </div>
              </div>


              <div>
                <input
                  type="number"
                  value={profileData.actionRadius}
                  onChange={(e) => setProfileData({ ...profileData, actionRadius: e.target.value })}
                  onBlur={() => {
                    if (profileData.actionRadius) {
                      const check = validateActionRadius(profileData.actionRadius)
                      if (!check.valid) {
                        toast.error(check.error)
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="10"
                  min="1"
                  max="100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Binnen welke radius wil je werken?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Korte bio (max 140 karakters) *
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  onBlur={() => {
                    if (profileData.bio) {
                      const check = validateBio(profileData.bio, 80)
                      if (!check.valid) {
                        toast.error(check.error)
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Dierenvriend met 5 jaar ervaring..."
                  rows={3}
                  maxLength={140}
                  required
                />
                <p className={`text-xs mt-1 ${profileData.bio.length < 80 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {profileData.bio.length}/140 karakters {profileData.bio.length < 80 && `(nog ${80 - profileData.bio.length} nodig)`}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/auth/signout')}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleStep1}
                  disabled={loading}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Volgende stap →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DIENSTEN & PRIJZEN */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Diensten & Prijzen
                </h2>
                <p className="text-gray-600">
                  Welke diensten bied je aan en wat zijn je prijzen?
                </p>
              </div>

              {/* Profielfoto */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profielfoto (optioneel)</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload een profielfoto (liefst met een dier)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload een foto van jezelf (liefst met een dier). Maximaal 5MB. JPG, PNG of WebP. Je kunt dit later ook toevoegen.
                  </p>
                  {profileData.profilePhoto && (
                    <div className="mt-3">
                      <img 
                        src={profileData.profilePhoto} 
                        alt="Profielfoto preview" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Welke diensten bied je aan? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SERVICES.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        servicesData.services.includes(service.id)
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{service.icon}</span>
                        <span className={`font-semibold text-sm ${
                          servicesData.services.includes(service.id) ? 'text-emerald-700' : 'text-gray-700'
                        }`}>
                          {service.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vanaf-prijzen per geselecteerde dienst */}
              {servicesData.services.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Uurtarief per dienst</h3>
                  <div className="space-y-3">
                    {servicesData.services.map((serviceId) => {
                      const service = SERVICES.find(s => s.id === serviceId)
                      return (
                        <div key={serviceId} className="flex items-center gap-3">
                          <span className="text-lg">{service?.icon}</span>
                          <span className="flex-1 text-sm font-medium text-gray-700">{service?.label}</span>
                          <div className="relative flex items-center gap-1">
                            <div className="relative w-24">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">€</span>
                            <input
                              type="number"
                              value={servicesData.servicePrices[serviceId] || ''}
                              onChange={(e) => setServicesData({
                                ...servicesData,
                                servicePrices: { ...servicesData.servicePrices, [serviceId]: e.target.value }
                              })}
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="25"
                              min="5"
                                max="800"
                              required
                            />
                            </div>
                            <span className="text-sm text-gray-600 font-medium">/uur</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    💡 Dit is de prijs die klanten betalen. Platform behoudt {PLATFORM_CONFIG.COMMISSION_PERCENTAGE}% commissie.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Welke diersoorten kun je verzorgen? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ANIMAL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleAnimalType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        servicesData.animalTypes.includes(type.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {servicesData.animalTypes.includes('OTHER') && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Welke andere dieren? *
                    </label>
                    <input
                      type="text"
                      value={servicesData.customAnimalTypes}
                      onChange={(e) => setServicesData({ ...servicesData, customAnimalTypes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="bijv. Alpaca's, Fretten, Geiten"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Welke groottes kun je aan? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ANIMAL_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => toggleAnimalSize(size.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        servicesData.animalSizes.includes(size.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xl mb-1">{size.icon}</span>
                        <span className="text-xs font-medium">{size.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max. aantal dieren tegelijk *
                </label>
                <input
                  type="number"
                  value={servicesData.maxAnimalsAtOnce}
                  onChange={(e) => setServicesData({ ...servicesData, maxAnimalsAtOnce: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="3"
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    await loadExistingData()
                    setCurrentStep(1)
                  }}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                >
                  ← Terug
                </Button>
                <Button
                  onClick={handleStep2}
                  disabled={loading}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Volgende stap →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PLATFORM ANNULATIEBELEID */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Platform Annulatiebeleid
                </h2>
                <p className="text-gray-600">
                  Belangrijke informatie over ons annulatiebeleid
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                  <span>ℹ️</span>
                  Platform Annulatiebeleid voor Huisdiereigenaren
                </h4>
                <div className="text-sm text-blue-800 space-y-3">
                  <p className="text-base">Voor alle boekingen geldt het volgende annulatiebeleid voor huisdiereigenaren:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-3">
                    <li>Tot 1 dag vóór aanvang EN vóór 12:00 uur: <strong>100% terugbetaling</strong></li>
                    <li>Later (maar vóór aanvang): <strong>50% terugbetaling</strong></li>
                    <li>Tijdens reservatieperiode: <strong>geen terugbetaling</strong></li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-4 italic">
                    Dit beleid geldt uniform voor alle verzorgers op het platform en beschermt jouw inkomsten.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  Beschikbaarheid instellen
                </h4>
                <p className="text-sm text-emerald-800">
                  Je kunt je beschikbaarheid instellen in je dashboard na registratie. Daar kun je per dag en per uur aangeven wanneer je beschikbaar bent.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    await loadExistingData()
                    setCurrentStep(2)
                  }}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                >
                  ← Terug
                </Button>
                <Button
                  onClick={handleStep3}
                  disabled={loading}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Volgende stap →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: OPTIONELE BADGES */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Optionele Badges
                </h2>
                <p className="text-gray-600">
                  Verhoog je vertrouwen met badges (kan je overslaan)
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-emerald-800">
                  <strong>Badges zijn optioneel</strong> maar verhogen je vertrouwen en zichtbaarheid bij klanten. Upload certificaten om professionele badges te verdienen.
                </p>
              </div>

              <div className="space-y-3">
                {/* Meest belangrijke badge eerst */}
                <BadgeUploadField
                  label="Diergerelateerde diploma"
                  description="Diploma (secundair, hogeschool, universiteit, MBO/HBO)"
                  value={badgesData.animalCareDiploma}
                  onChange={(val) => setBadgesData({ ...badgesData, animalCareDiploma: val })}
                  icon="◆"
                />

                {/* Bestaande badges */}
                <BadgeUploadField
                  label="BA / Beroepsaansprakelijkheid verzekering"
                  description="Upload je verzekeringspolis"
                  value={badgesData.insuranceFile}
                  onChange={(val) => setBadgesData({ ...badgesData, insuranceFile: val, hasInsurance: !!val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="EHBO bij dieren"
                  description="EHBO-certificaat voor dieren (Rode Kruis of online training)"
                  value={badgesData.animalFirstAidCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, animalFirstAidCertificate: val })}
                  icon="◆"
                />

                {/* Nieuwe professionele badges */}

                <BadgeUploadField
                  label="Gecertificeerd hondentrainer"
                  description="Certificaat (Syntra, DogVision, Martin Gaus, Hondencentrum De Laar)"
                  value={badgesData.dogTrainerCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, dogTrainerCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Hondengedragsbegeleider"
                  description="Erkend certificaat of bewijs van stage/opleiding"
                  value={badgesData.behaviorSpecialistCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, behaviorSpecialistCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Ervaring met paarden/kleinvee"
                  description="Bewijs van opleiding of referentie (stal, boerderij)"
                  value={badgesData.horseExperienceProof}
                  onChange={(val) => setBadgesData({ ...badgesData, horseExperienceProof: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Hygiëne- en verzorgingstraining"
                  description="Certificaat (Dier & Welzijn Vlaanderen cursus)"
                  value={badgesData.hygieneCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, hygieneCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Veilig transport dieren"
                  description="Foto voertuig + FAVV-registratie (indien van toepassing)"
                  value={badgesData.transportProof}
                  onChange={(val) => setBadgesData({ ...badgesData, transportProof: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Trimmen / Basic Grooming"
                  description="Trimmersattest of certificaat"
                  value={badgesData.groomingCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, groomingCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Hydro-/Fysiotherapie assist"
                  description="Opleidingsattest (indien van toepassing)"
                  value={badgesData.physiotherapyCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, physiotherapyCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Voedingsconsulent (niet-klinisch)"
                  description="Module voedingsleer (geen dierenartsvervanging)"
                  value={badgesData.nutritionCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, nutritionCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Sniff-/Nosework activiteiten"
                  description="Opleiding/workshops certificaat"
                  value={badgesData.noseworkCertificate}
                  onChange={(val) => setBadgesData({ ...badgesData, noseworkCertificate: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Puppy socialisatie pakket"
                  description="Geformatteerd plan + eigenaarfeedback"
                  value={badgesData.puppySocializationPlan}
                  onChange={(val) => setBadgesData({ ...badgesData, puppySocializationPlan: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Sport & Mentale verrijking"
                  description="Trailruns, zoekspelletjes, balance-werk bewijs"
                  value={badgesData.sportEnrichmentProof}
                  onChange={(val) => setBadgesData({ ...badgesData, sportEnrichmentProof: val })}
                  icon="◆"
                />

                <BadgeUploadField
                  label="Event-begeleiding"
                  description="Referenties eventorganisator of bewijs"
                  value={badgesData.eventCompanionReferences}
                  onChange={(val) => setBadgesData({ ...badgesData, eventCompanionReferences: val })}
                  icon="◆"
                />
              </div>

              {/* KBO/KVK & BTW - Voor zelfstandigen */}
              <div className="border-2 border-gray-200 rounded-xl p-4 mt-6 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-4">Voor zelfstandigen (optioneel)</h3>
                
                <div className="space-y-4">
                  <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                      KBO (BE) / KVK (NL) ondernemingsnummer
                </label>
                <input
                  type="text"
                  value={badgesData.businessNumber}
                  onChange={(e) => setBadgesData({ ...badgesData, businessNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="12345678 (NL) of 0123.456.789 (BE)"
                />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      BTW nummer
                    </label>
                    <input
                      type="text"
                      value={badgesData.vatNumber}
                      onChange={(e) => setBadgesData({ ...badgesData, vatNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      placeholder="BE0123456789 (BE) of NL123456789B01 (NL)"
                    />
                  </div>

                  <p className="text-xs text-gray-600 mt-2">
                    Alleen invullen als je als zelfstandige werkt. Dit toont een "Zelfstandige" badge op je profiel.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    await loadExistingData()
                    setCurrentStep(3)
                  }}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                >
                  ← Terug
                </Button>
                <Button
                  onClick={handleStep4}
                  disabled={loading}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {(() => {
                    const hasBadges = 
                      badgesData.insuranceFile ||
                      badgesData.animalFirstAidCertificate ||
                      badgesData.animalCareDiploma ||
                      badgesData.dogTrainerCertificate ||
                      badgesData.behaviorSpecialistCertificate ||
                      badgesData.horseExperienceProof ||
                      badgesData.hygieneCertificate ||
                      badgesData.transportProof ||
                      badgesData.groomingCertificate ||
                      badgesData.physiotherapyCertificate ||
                      badgesData.nutritionCertificate ||
                      badgesData.noseworkCertificate ||
                      badgesData.puppySocializationPlan ||
                      badgesData.sportEnrichmentProof ||
                      badgesData.eventCompanionReferences ||
                      badgesData.businessNumber ||
                      badgesData.vatNumber
                    
                    return hasBadges ? 'Volgende stap →' : 'Overslaan →'
                  })()}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: UITBETALING */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Uitbetaling & Akkoord
                </h2>
                <p className="text-lg text-gray-600">
                  Laatste stap - je bent er bijna!
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                <h3 className="font-bold text-emerald-900 mb-3 text-lg">Hoe het werkt:</h3>
                <ul className="space-y-2 text-emerald-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">1.</span>
                    <span>Klant boekt bij jou en betaalt online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">2.</span>
                    <span>Uitbetaling via Stripe binnen <strong>7 werkdagen</strong> na voltooiing van de service</span>
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IBAN *
                </label>
                <input
                  type="text"
                  value={payoutData.iban}
                  onChange={(e) => setPayoutData({ ...payoutData, iban: e.target.value.toUpperCase() })}
                  onBlur={() => {
                    if (payoutData.iban) {
                      const check = validateIBAN(payoutData.iban)
                      if (!check.valid) {
                        toast.error(check.error)
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                  placeholder="BE68 5390 0754 7034"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Naam rekeninghouder *
                </label>
                <input
                  type="text"
                  value={payoutData.accountHolder}
                  onChange={(e) => setPayoutData({ ...payoutData, accountHolder: e.target.value })}
                  onBlur={() => {
                    if (payoutData.accountHolder) {
                      const check = validateName(payoutData.accountHolder, 'Rekeninghouder')
                      if (!check.valid) {
                        toast.error(check.error)
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Jan Janssen"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-emerald-300 rounded-xl hover:bg-emerald-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payoutData.platformRulesAgreed}
                    onChange={(e) => setPayoutData({ ...payoutData, platformRulesAgreed: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
                    required
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Ik ga akkoord met de <a href="/terms" target="_blank" className="text-emerald-600 underline">Algemene Voorwaarden</a> en het <a href="/privacy" target="_blank" className="text-emerald-600 underline">Privacybeleid</a>
                  </span>
                </label>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Let op:</strong> Je profiel wordt na aanmelding beoordeeld door onze admin. Je kunt pas boekingen ontvangen na goedkeuring.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    await loadExistingData()
                    setCurrentStep(4)
                  }}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                >
                  ← Terug
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading || !payoutData.platformRulesAgreed}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Profiel aanmaken...' : 'Profiel aanmaken'}
                </Button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}

