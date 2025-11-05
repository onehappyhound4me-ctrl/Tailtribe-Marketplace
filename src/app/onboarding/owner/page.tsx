'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { validatePostcode, validatePhone, validateCity, validateName } from '@/lib/validation'
import { validatePostcodeWithCity } from '@/lib/postcode-validator'
import { getCoordinates } from '@/lib/geocoding'

type Step = 1 | 2 | 3 | 4

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

export default function OwnerOnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [existingPets, setExistingPets] = useState<any[]>([])
  const [checkingPets, setCheckingPets] = useState(true)
  const [savedPetIds, setSavedPetIds] = useState<Set<number>>(new Set()) // Track which pet indices have been saved
  
  // Step 1: Basisgegevens
  const [basicData, setBasicData] = useState({
    phone: '',
    postalCode: '',
    city: '',
    country: 'BE' // Will be auto-detected from city
  })
  
  // Step 2: Huisdier informatie
  const [numPets, setNumPets] = useState(1)
  const [customNumPets, setCustomNumPets] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [currentPetIndex, setCurrentPetIndex] = useState(0)
  const [petsData, setPetsData] = useState<Array<{
    name: string
    type: string
    breed: string
    gender: string
    age: string
    weight: string
    spayedNeutered: boolean
    medicalInfo: string
    socialWithPets: boolean
    socialWithPeople: boolean
    character: string
  }>>([{
    name: '',
    type: 'DOG',
    breed: '',
    gender: 'MALE',
    age: '',
    weight: '',
    spayedNeutered: false,
    medicalInfo: '',
    socialWithPets: true,
    socialWithPeople: true,
    character: ''
  }])
  
  // Step 3: Dienstenbehoefte
  const [serviceNeeds, setServiceNeeds] = useState({
    services: [] as string[],
    frequency: '',
    timing: [] as string[],
    location: [] as string[],
    howHeard: '',
    perfectExperience: ''
  })

  // Function to load existing data from database
  const loadExistingData = useCallback(async () => {
    try {
      // Load user profile data
      const profileRes = await fetch('/api/profile/owner', { cache: 'no-store' })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        
        // Populate basic data if exists
        if (profileData.city || profileData.postalCode) {
          setBasicData({
            phone: profileData.phone || '',
            postalCode: profileData.postalCode || '',
            city: profileData.city || '',
            country: profileData.country || 'BE'
          })
        }
        
        // Populate service needs if exists
        if (profileData.howHeardAbout || profileData.perfectExperience) {
          setServiceNeeds(prev => ({
            ...prev,
            howHeard: profileData.howHeardAbout || '',
            perfectExperience: profileData.perfectExperience || ''
          }))
        }
      }
      
      // Load existing pets (just for showing count badge)
      const petsRes = await fetch('/api/pets/list', { cache: 'no-store' })
      if (petsRes.ok) {
        const petsData = await petsRes.json()
        setExistingPets(petsData.pets || [])
        // DO NOT fill forms here - let user fill them manually
      }
    } catch (error) {
      console.error('Error loading existing data:', error)
    }
  }, [])

  // Function to determine current step based on existing data
  const determineCurrentStep = useCallback(async () => {
    try {
      const profileRes = await fetch('/api/profile/owner', { cache: 'no-store' })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        
        // Check if onboarding is already completed
        if (profileData.onboardingCompleted) {
          router.push('/dashboard/owner')
          return
        }
        
        // Check what data exists to determine step
        if (profileData.city && profileData.postalCode) {
          // Basic data exists, check pets
          const petsRes = await fetch('/api/pets/list', { cache: 'no-store' })
          if (petsRes.ok) {
            const petsData = await petsRes.json()
            if (petsData.pets && petsData.pets.length > 0) {
              // Pets exist, check service needs
              if (profileData.preferences) {
                const preferences = JSON.parse(profileData.preferences)
                if (preferences.primaryServices && preferences.primaryServices.length > 0) {
                  // All data exists, go to completion step
                  setCurrentStep(4)
      } else {
                  // Service needs missing
                  setCurrentStep(3)
                }
              } else {
                // Service needs missing
                setCurrentStep(3)
              }
            } else {
              // Pets missing
              setCurrentStep(2)
            }
          } else {
            // Pets missing
            setCurrentStep(2)
          }
        } else {
          // Basic data missing
          setCurrentStep(1)
        }
      }
    } catch (error) {
      console.error('Error determining step:', error)
      setCurrentStep(1)
    }
  }, [router])

  // Load existing data on mount
  useEffect(() => {
    const init = async () => {
      await loadExistingData()
      await determineCurrentStep()
      setCheckingPets(false)
    }
    init()
  }, [loadExistingData, determineCurrentStep])

  // Step 1: Save basic data
  const handleStep1 = async () => {
    // Validate phone (optional but must be valid if provided)
    if (basicData.phone) {
      const phoneCheck = validatePhone(basicData.phone)
      if (!phoneCheck.valid) {
        toast.error(phoneCheck.error)
        return
      }
    }

    // Validate postcode
    const postcodeCheck = validatePostcode(basicData.postalCode, basicData.country)
    if (!postcodeCheck.valid) {
      toast.error(postcodeCheck.error)
      return
    }

    // Validate city
    const cityCheck = validateCity(basicData.city)
    if (!cityCheck.valid) {
      toast.error(cityCheck.error)
      return
    }

    setLoading(true)
    toast.info('Postcode en stad controleren...')
    
    // VALIDATE postcode + city match with REAL API
    let coords = { lat: null, lng: null }
    try {
      const validation = await validatePostcodeWithCity(basicData.postalCode, basicData.city, basicData.country)
      
      if (!validation.valid) {
        // BLOKKEER - verkeerde combinatie!
        toast.error(validation.error || 'Postcode en stad komen niet overeen')
        setLoading(false)
        return
      }

      // Valid! Use the coordinates
      if (validation.lat && validation.lng) {
        coords = { lat: validation.lat, lng: validation.lng }
      }
    } catch (validationError) {
      console.error('Validation API failed:', validationError)
      toast.error('Kon postcode niet controleren. Probeer opnieuw of kies een andere stad.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/profile/update-owner-basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: basicData.phone || null,
          postalCode: basicData.postalCode,
          city: basicData.city,
          country: basicData.country,
          lat: coords.lat,
          lng: coords.lng,
          notificationPreferences: JSON.stringify({
            email: true // Always email, no SMS
          })
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.details || errorData.error || 'Opslaan mislukt')
      }
      
      toast.success('Gegevens opgeslagen!')
      setCurrentStep(2) // Go to pets step
    } catch (error: any) {
      console.error('Stap 1 error:', error)
      const errorMsg = error.message || 'Er ging iets mis bij het opslaan'
      toast.error(errorMsg)
      console.log('Full error details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update number of pets
  const handleNumPetsChange = (num: number) => {
    setShowCustomInput(false)
    setCustomNumPets('')
    setNumPets(num)
    
    // Reset savedPetIds if number of pets decreased
    // Keep savedPetIds only for indices that still exist
    setSavedPetIds(prev => {
      const newSet = new Set<number>()
      prev.forEach(id => {
        if (id < num) {
          newSet.add(id)
        }
      })
      return newSet
    })
    
    // KEEP EXISTING DATA and add empty forms for new pets
    const newPets = Array(num).fill(null).map((_, i) => {
      // If we already have data for this pet, KEEP IT
      if (petsData[i] && petsData[i].name) {
        return petsData[i]
      }
      // Otherwise create empty form
      return {
        name: '',
        type: 'DOG',
        breed: '',
        gender: 'MALE',
        age: '',
        weight: '',
        spayedNeutered: false,
        medicalInfo: '',
        socialWithPets: true,
        socialWithPeople: true,
        character: ''
      }
    })
    
    setPetsData(newPets)
  }

  const handleCustomNumPets = (value: string) => {
    setCustomNumPets(value)
    const num = parseInt(value)
    if (num >= 6 && num <= 20) {
      setNumPets(num)
      
      // Reset savedPetIds if number of pets changed
      setSavedPetIds(prev => {
        const newSet = new Set<number>()
        prev.forEach(id => {
          if (id < num) {
            newSet.add(id)
          }
        })
        return newSet
      })
      
      // KEEP EXISTING DATA and add empty forms for new pets
      const newPets = Array(num).fill(null).map((_, i) => {
        // If we already have data for this pet, KEEP IT
        if (petsData[i] && petsData[i].name) {
          return petsData[i]
        }
        // Otherwise create empty form
        return {
          name: '',
          type: 'DOG',
          breed: '',
          gender: 'MALE',
          age: '',
          weight: '',
          spayedNeutered: false,
          medicalInfo: '',
          socialWithPets: true,
          socialWithPeople: true,
          character: ''
        }
      })
      
      setPetsData(newPets)
    }
  }

  // Update current pet data
  const updateCurrentPet = (updates: Partial<typeof petsData[0]>) => {
    const newPets = [...petsData]
    newPets[currentPetIndex] = { ...newPets[currentPetIndex], ...updates }
    setPetsData(newPets)
  }

  // Step 2: Add current pet and go to next
  const handleStep2 = async () => {
    const currentPet = petsData[currentPetIndex]
    
    // Validation for custom number of pets
    if (showCustomInput && (!customNumPets || parseInt(customNumPets) < 6 || parseInt(customNumPets) > 20)) {
      toast.error('Vul een geldig aantal huisdieren in (6-20)')
      return
    }
    
    // Validation
    if (!currentPet.name.trim()) {
      toast.error(`Naam voor huisdier ${currentPetIndex + 1} is verplicht`)
      return
    }
    
    if (currentPet.name.trim().length < 2) {
      toast.error('Naam moet minimaal 2 tekens zijn')
      return
    }

    if (!currentPet.type) {
      toast.error('Kies een diersoort')
      return
    }

    if (!currentPet.breed || !currentPet.breed.trim()) {
      toast.error('Diersoort/Ras is verplicht')
      return
    }

    if (currentPet.breed.trim().length < 2) {
      toast.error('Diersoort/Ras moet minimaal 2 tekens zijn')
      return
    }

    // Validate age if provided
    if (currentPet.age && (parseInt(currentPet.age) < 0 || parseInt(currentPet.age) > 30)) {
      toast.error('Leeftijd moet tussen 0 en 30 jaar zijn')
      return
    }

    // Validate weight if provided
    if (currentPet.weight && (parseFloat(currentPet.weight) <= 0 || parseFloat(currentPet.weight) > 1000)) {
      toast.error('Gewicht moet tussen 0 en 1000 kg zijn')
      return
    }

    // Check if this pet has already been saved
    if (savedPetIds.has(currentPetIndex)) {
      // Pet already saved, just navigate forward
      if (currentPetIndex < numPets - 1) {
        const nextPetIndex = currentPetIndex + 1
        setCurrentPetIndex(nextPetIndex)
      } else {
        setCurrentStep(3)
      }
      return
    }

    setLoading(true)
    try {
      // Save current pet
      const res = await fetch('/api/pets/create-detailed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPet,
          age: currentPet.age ? parseInt(currentPet.age) : null,
          weight: currentPet.weight ? parseFloat(currentPet.weight) : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Huisdier toevoegen mislukt')
      }
      
      // Mark this pet index as saved
      setSavedPetIds(prev => new Set([...prev, currentPetIndex]))
      
      // Reload existing pets list
      const petsRes = await fetch('/api/pets/list')
      if (petsRes.ok) {
        const loadedPetsData = await petsRes.json()
        setExistingPets(loadedPetsData.pets || [])
      }
      
      // Go to next pet or next step
      if (currentPetIndex < numPets - 1) {
        const nextPetIndex = currentPetIndex + 1
        toast.success(`${currentPet.name} toegevoegd! Vul nu huisdier ${nextPetIndex + 1} in`)
        setCurrentPetIndex(nextPetIndex)
      } else {
        toast.success(`Alle ${numPets} huisdieren toegevoegd!`)
        setCurrentStep(3)
      }
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Complete pets step (save last pet and go to next step)
  const handleStep2AllPets = async () => {
    const currentPet = petsData[currentPetIndex]
    
    // Validation for custom number of pets
    if (showCustomInput && (!customNumPets || parseInt(customNumPets) < 6 || parseInt(customNumPets) > 20)) {
      toast.error('Vul een geldig aantal huisdieren in (6-20)')
        return
      }

    // Validation for current pet
    if (!currentPet.name.trim()) {
      toast.error(`Naam voor huisdier ${currentPetIndex + 1} is verplicht`)
      return
    }
    
    if (currentPet.name.trim().length < 2) {
      toast.error('Naam moet minimaal 2 tekens zijn')
      return
    }

    if (!currentPet.type) {
      toast.error('Kies een diersoort')
      return
    }

    if (!currentPet.breed || !currentPet.breed.trim()) {
      toast.error('Diersoort/Ras is verplicht')
      return
    }

    if (currentPet.breed.trim().length < 2) {
      toast.error('Diersoort/Ras moet minimaal 2 tekens zijn')
      return
    }

    // Validate age if provided
    if (currentPet.age && (parseInt(currentPet.age) < 0 || parseInt(currentPet.age) > 30)) {
      toast.error('Leeftijd moet tussen 0 en 30 jaar zijn')
      return
    }

    // Validate weight if provided
    if (currentPet.weight && (parseFloat(currentPet.weight) <= 0 || parseFloat(currentPet.weight) > 1000)) {
      toast.error('Gewicht moet tussen 0 en 1000 kg zijn')
      return
    }

    // Check if this pet has already been saved
    if (savedPetIds.has(currentPetIndex)) {
      // Pet already saved, just go to next step
      toast.success(`Alle ${numPets} huisdieren succesvol toegevoegd!`)
      setCurrentStep(3)
      return
    }

    setLoading(true)
    try {
      // Save current pet
      const res = await fetch('/api/pets/create-detailed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPet,
          age: currentPet.age ? parseInt(currentPet.age) : null,
          weight: currentPet.weight ? parseFloat(currentPet.weight) : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Huisdier toevoegen mislukt')
      }
      
      // Mark this pet index as saved
      setSavedPetIds(prev => new Set([...prev, currentPetIndex]))
      
      // Reload existing pets list
      const petsRes = await fetch('/api/pets/list')
      if (petsRes.ok) {
        const loadedPetsData = await petsRes.json()
        setExistingPets(loadedPetsData.pets || [])
      }
      
      toast.success(`Alle ${numPets} huisdieren succesvol toegevoegd!`)
      setCurrentStep(3)
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Save service needs
  const handleStep3 = async () => {
    // Validate service needs
    if (serviceNeeds.services.length === 0) {
      toast.error('Selecteer minimaal 1 dienst die je nodig hebt')
      return
    }

    if (!serviceNeeds.frequency) {
      toast.error('Selecteer hoe vaak je de dienst nodig hebt')
      return
    }

    if (serviceNeeds.timing.length === 0) {
      toast.error('Selecteer minimaal 1 tijdstip')
      return
    }

    if (serviceNeeds.location.length === 0) {
      toast.error('Selecteer minimaal 1 locatie')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/profile/update-service-needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceNeeds)
      })

      if (!res.ok) throw new Error('Opslaan mislukt')
      
      toast.success('Voorkeuren opgeslagen')
      setCurrentStep(4)
    } catch (error) {
      toast.error('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Complete onboarding
  const handleComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!res.ok) throw new Error('Afronden mislukt')
      
      toast.success('🎉 Welkom bij TailTribe!')
      router.push('/dashboard/owner')
      router.refresh()
    } catch (error) {
      toast.error('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setServiceNeeds(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }))
  }

  const toggleTiming = (timing: string) => {
    setServiceNeeds(prev => ({
      ...prev,
      timing: prev.timing.includes(timing)
        ? prev.timing.filter(t => t !== timing)
        : [...prev.timing, timing]
    }))
  }

  const toggleLocation = (location: string) => {
    setServiceNeeds(prev => {
      let newLocation = [...prev.location]
      
      if (location === 'BEIDE') {
        // Als "Beide opties" wordt geselecteerd, selecteer alle opties
        if (prev.location.includes('BEIDE')) {
          // Als al geselecteerd, deselecteer alles
          newLocation = []
        } else {
          // Selecteer alle opties
          newLocation = ['THUIS', 'VERZORGER', 'BEIDE']
        }
      } else {
        // Voor individuele opties, toggle normaal
        if (prev.location.includes(location)) {
          newLocation = newLocation.filter(l => l !== location)
          // Als een individuele optie wordt gedeselecteerd, deselecteer ook "BEIDE"
          if (newLocation.includes('BEIDE')) {
            newLocation = newLocation.filter(l => l !== 'BEIDE')
          }
        } else {
          newLocation = [...newLocation, location]
          // Als beide individuele opties zijn geselecteerd, selecteer ook "BEIDE"
          if (newLocation.includes('THUIS') && newLocation.includes('VERZORGER') && !newLocation.includes('BEIDE')) {
            newLocation = [...newLocation, 'BEIDE']
          }
        }
      }
      
      return {
        ...prev,
        location: newLocation
      }
    })
  }

  // Show loading while checking for existing pets
  if (checkingPets) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profiel laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Progress Indicator */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Stap {currentStep} van 4</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}% compleet</span>
            </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
          </div>
        </div>

          {/* STEP 1: BASISGEGEVENS */}
        {currentStep === 1 && (
          <div className="space-y-6">
              <div className="mb-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Basisgegevens
                </h2>
                <p className="text-gray-600">
                  Jouw contactgegevens en locatie
                </p>
              </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postcode *
                  </label>
                <input
                  type="text"
                    value={basicData.postalCode}
                  onChange={(e) => {
                      const value = e.target.value
                      setBasicData({ ...basicData, postalCode: value })
                      // Auto-detect country: NL postcodes have letters, BE are only numbers
                      if (value.match(/[a-zA-Z]/)) {
                        setBasicData(prev => ({ ...prev, postalCode: value, country: 'NL' }))
                      } else if (value.length >= 4) {
                        setBasicData(prev => ({ ...prev, postalCode: value, country: 'BE' }))
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="1012AB of 1000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {basicData.country === 'NL' ? '🇳🇱 Nederland gedetecteerd' : '🇧🇪 België gedetecteerd'}
                  </p>
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Woonplaats *
                  </label>
                <input
                  type="text"
                    value={basicData.city}
                    onChange={(e) => setBasicData({ ...basicData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Amsterdam, Brussel, ..."
                    required
                />
              </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wat is je gsm-nummer? (optioneel)
                </label>
              <input
                type="tel"
                  value={basicData.phone}
                  onChange={(e) => setBasicData({ ...basicData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+32 123 45 67 89 of +31 6 12 34 56 78"
                />
                <p className="text-xs text-gray-500 mt-1">Voor noodgevallen en directe bereikbaarheid</p>
            </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <strong className="block mb-1">Meldingen via e-mail</strong>
                    <p>Updates over boekingen, bevestigingen en berichten worden naar je e-mailadres gestuurd.</p>
                  </div>
              </div>
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
                  disabled={loading || !basicData.city || !basicData.postalCode}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Opslaan...' : 'Volgende stap →'}
              </Button>
            </div>
          </div>
        )}

          {/* STEP 2: HUISDIER INFORMATIE */}
        {currentStep === 2 && (
          <div className="space-y-6">
              <div className="mb-8">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Huisdier Informatie
                </h2>
                <p className="text-gray-600">
                  Vertel ons over je {numPets > 1 ? 'huisdieren' : 'huisdier'} voor de beste matches
                </p>
                {numPets > 1 && (
                  <p className="text-sm text-emerald-600 mt-2 font-medium">
                    Huisdier {currentPetIndex + 1} van {numPets}
                  </p>
                )}
              </div>

              {/* Aantal huisdieren selector - altijd zichtbaar */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Hoeveel huisdieren heb je? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumPetsChange(num)}
                      className={`p-3 rounded-lg border-2 transition-all font-bold ${
                        numPets === num && !showCustomInput
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                    </div>
                
                {/* Meer dan 5 huisdieren optie */}
                <div className="mt-3 pt-3 border-t border-blue-300">
                    <button
                      type="button"
                    onClick={() => {
                      setShowCustomInput(!showCustomInput)
                      if (!showCustomInput) {
                        setCustomNumPets('')
                      }
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-sm font-semibold text-left flex items-center justify-between ${
                      showCustomInput
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                    }`}
                  >
                    <span>Meer dan 5 huisdieren?</span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${showCustomInput ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  
                  {showCustomInput && (
                    <div className="mt-3 space-y-2">
                      <input
                        type="number"
                        min="6"
                        max="20"
                        value={customNumPets}
                        onChange={(e) => handleCustomNumPets(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold"
                        placeholder="Vul het aantal in (6-20)"
                      />
                      <p className="text-xs text-gray-600">
                        Geef het exacte aantal huisdieren in (tussen 6 en 20)
                      </p>
                      {customNumPets && parseInt(customNumPets) >= 6 && parseInt(customNumPets) <= 20 && (
                        <p className="text-sm text-emerald-600 font-medium">
                          ✓ {customNumPets} huisdieren geselecteerd
                        </p>
                      )}
                      {customNumPets && (parseInt(customNumPets) < 6 || parseInt(customNumPets) > 20) && (
                        <p className="text-sm text-red-600 font-medium">
                          Aantal moet tussen 6 en 20 zijn
                        </p>
                      )}
                  </div>
                  )}
                </div>
                
                {numPets > 1 && (
                  <p className="mt-3 text-sm text-gray-600">
                    Je hebt {numPets} huisdieren geselecteerd. Vul elk huisdier hieronder in.
                  </p>
                )}
                {existingPets.length > 0 && (
                  <p className="mt-2 text-xs text-emerald-600 font-medium">
                    ✓ {existingPets.length} {existingPets.length === 1 ? 'huisdier' : 'huisdieren'} al opgeslagen
                  </p>
                )}
              </div>

              {/* Tabs voor switchen tussen huisdieren */}
              {numPets > 1 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {Array(numPets).fill(null).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPetIndex(i)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex-shrink-0 ${
                        currentPetIndex === i
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                ))}
              </div>
            )}

              {/* Huidige huisdier formulier */}
              <div className="bg-white border-2 border-emerald-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {numPets > 1 ? `Huisdier ${currentPetIndex + 1} van ${numPets}` : 'Jouw huisdier'}
                  </h3>
                  <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Nu aan het invullen: #{currentPetIndex + 1}
                  </div>
                </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Naam *
                </label>
              <input
                type="text"
                  value={petsData[currentPetIndex].name}
                  onChange={(e) => updateCurrentPet({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Rex, Luna, ..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dierensoort *
                  </label>
                <select
                    value={petsData[currentPetIndex].type}
                    onChange={(e) => updateCurrentPet({ type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="DOG">Hond</option>
                  <option value="CAT">Kat</option>
                    <option value="BIRD">Vogel/Papegaai</option>
                  <option value="SMALL_ANIMAL">Kleine huisdieren</option>
                  <option value="REPTILE">Reptielen</option>
                  <option value="FISH">Vissen</option>
                  <option value="SMALL_LIVESTOCK">Kleinvee</option>
                  <option value="OTHER">Anders</option>
                </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Geslacht *
                  </label>
                <select
                    value={petsData[currentPetIndex].gender}
                    onChange={(e) => updateCurrentPet({ gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="MALE">Mannelijk</option>
                  <option value="FEMALE">Vrouwelijk</option>
                </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diersoort/Ras *
                  </label>
              <input
                type="text"
                    value={petsData[currentPetIndex].breed}
                    onChange={(e) => updateCurrentPet({ breed: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Labrador, Persiaan, Goudvis, ..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Leeftijd (jaren)
                  </label>
                <input
                  type="number"
                    value={petsData[currentPetIndex].age}
                    onChange={(e) => updateCurrentPet({ age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="3"
                  min="0"
                  max="30"
                />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gewicht (kg, optioneel)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={petsData[currentPetIndex].weight}
                  onChange={(e) => updateCurrentPet({ weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="25.5"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                    checked={petsData[currentPetIndex].spayedNeutered}
                    onChange={(e) => updateCurrentPet({ spayedNeutered: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Is het dier gesteriliseerd/gecastreerd?</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heeft het dier speciale noden of medische aandacht nodig?
                </label>
              <textarea
                  value={petsData[currentPetIndex].medicalInfo}
                  onChange={(e) => updateCurrentPet({ medicalInfo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Allergieën, medicatie, speciale voeding..."
                rows={3}
              />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={petsData[currentPetIndex].socialWithPets}
                    onChange={(e) => updateCurrentPet({ socialWithPets: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Sociaal met andere dieren</span>
                  </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={petsData[currentPetIndex].socialWithPeople}
                    onChange={(e) => updateCurrentPet({ socialWithPeople: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Sociaal met mensen</span>
                  </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Beschrijf kort het karakter
                </label>
              <textarea
                  value={petsData[currentPetIndex].character}
                  onChange={(e) => updateCurrentPet({ character: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Energiek, rustig, speels, gevoelig, ..."
                rows={2}
              />
              </div>
              </div>

              <div className="flex gap-3 mt-6">
              <Button
                  onClick={() => {
                    // State blijft behouden, we switchen alleen de step
                    setCurrentPetIndex(0)
                    setCurrentStep(1)
                  }}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                  disabled={loading}
                >
                ← Terug
              </Button>
              <Button
                  onClick={currentPetIndex < numPets - 1 ? handleStep2 : handleStep2AllPets}
                  disabled={loading || !petsData[currentPetIndex].name || !petsData[currentPetIndex].type || !petsData[currentPetIndex].breed}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                  {loading ? 'Opslaan...' : currentPetIndex < numPets - 1 ? 'Volgende huisdier →' : 'Volgende stap →'}
              </Button>
            </div>
          </div>
        )}

          {/* STEP 3: DIENSTENBEHOEFTE */}
        {currentStep === 3 && (
          <div className="space-y-6">
              <div className="mb-8">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Dienstenbehoefte
                </h2>
                <p className="text-gray-600">
                  Wat zoek je precies en hoe vaak heb je hulp nodig?
                </p>
              </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Welke diensten zoek je? * <span className="text-xs text-gray-500">(meerdere mogelijk)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SERVICES.map((service) => (
                  <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${
                        serviceNeeds.services.includes(service.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      {service.label}
                  </button>
                ))}
              </div>
                {serviceNeeds.services.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">* Selecteer minimaal 1 dienst</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hoe vaak heb je verzorging nodig? *
                </label>
                <select
                  value={serviceNeeds.frequency}
                  onChange={(e) => setServiceNeeds({ ...serviceNeeds, frequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecteer...</option>
                <option value="EENMALIG">Eenmalig</option>
                <option value="WEKELIJKS">Wekelijks</option>
                <option value="DAGELIJKS">Dagelijks</option>
                <option value="ONREGELMATIG">Onregelmatig</option>
              </select>
            </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Wanneer heb je meestal verzorging nodig? * <span className="text-xs text-gray-500">(meerdere mogelijk)</span>
                </label>
              <div className="grid grid-cols-2 gap-2">
                  {['OVERDAG', 'AVONDS', 'WEEKEND', 'VAKANTIES'].map((time) => (
                  <button
                      key={time}
                      type="button"
                      onClick={() => toggleTiming(time)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        serviceNeeds.timing.includes(time)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      {time === 'OVERDAG' ? "Overdag" : time === 'AVONDS' ? "'s Avonds" : time === 'WEEKEND' ? 'Weekend' : 'Tijdens vakanties'}
                  </button>
                ))}
              </div>
                {serviceNeeds.timing.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">* Klik minimaal 1 tijdstip aan</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Waar moet de dienst plaatsvinden? * <span className="text-xs text-gray-500">(meerdere mogelijk)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { id: 'THUIS', label: 'Bij mij thuis' },
                    { id: 'VERZORGER', label: 'Bij de verzorger' },
                    { id: 'BEIDE', label: 'Beide opties zijn goed' }
                  ].map((location) => (
                  <button
                      key={location.id}
                      type="button"
                      onClick={() => toggleLocation(location.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${
                        serviceNeeds.location.includes(location.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 hover:border-emerald-300 text-gray-700'
                      }`}
                    >
                      {location.label}
                  </button>
                ))}
              </div>
                {serviceNeeds.location.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">* Selecteer minimaal 1 locatie</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hoe heb je over TailTribe gehoord?
                </label>
                <select
                  value={serviceNeeds.howHeard}
                  onChange={(e) => setServiceNeeds({ ...serviceNeeds, howHeard: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Selecteer...</option>
                  <option value="GOOGLE">Google</option>
                  <option value="INSTAGRAM">Instagram / Facebook</option>
                  <option value="MOND_TOT_MOND">Mond-tot-mond</option>
                  <option value="ANDERE">Andere</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wat zou jouw ervaring "perfect" maken met een verzorger? (optioneel)
                </label>
                <textarea
                  value={serviceNeeds.perfectExperience}
                  onChange={(e) => setServiceNeeds({ ...serviceNeeds, perfectExperience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Vertel ons wat belangrijk voor jou is..."
                  rows={3}
                />
            </div>

            <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCurrentPetIndex(0)
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
                  {loading ? 'Opslaan...' : 'Volgende stap →'}
              </Button>
            </div>
          </div>
        )}

          {/* STEP 4: AFSLUITER */}
        {currentStep === 4 && (
          <div className="space-y-6">
              <div className="mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Profiel Compleet
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Je account is klaar! We tonen je nu verzorgers in jouw buurt die het beste bij je passen.
                </p>
            </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                  <span>ℹ️</span>
                  Platform Annulatiebeleid
                </h4>
                <div className="text-sm text-blue-800 space-y-3">
                  <p className="text-base">Voor alle boekingen geldt het volgende annulatiebeleid:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-3">
                    <li>Tot 1 dag vóór aanvang EN vóór 12:00 uur: <strong>100% terugbetaling</strong></li>
                    <li>Later (maar vóór aanvang): <strong>50% terugbetaling</strong></li>
                    <li>Tijdens reservatieperiode: <strong>geen terugbetaling</strong></li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-4 italic">
                    Dit beleid geldt uniform voor alle verzorgers op het platform en zorgt voor eerlijke voorwaarden.
                  </p>
                </div>
            </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                <h3 className="font-semibold text-emerald-900 mb-3">Wat kun je nu doen?</h3>
                <ul className="space-y-2.5 text-sm text-emerald-800">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Bekijk verzorgers in jouw buurt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Ontvang e-mail updates over je boekingen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Maak direct je eerste boeking</span>
                  </li>
                </ul>
            </div>

            <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    await loadExistingData()
                    await determineCurrentStep()
                  }}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold border-2"
                  disabled={loading}
                >
                ← Terug
              </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                {loading ? 'Afronden...' : 'Naar Dashboard'}
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
