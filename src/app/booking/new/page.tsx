'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { serviceLabels } from '@/lib/types'

import { DateRangePicker } from '@/components/booking/DateRangePicker'

interface BookingData {
  dates: string[]
  dayTimes?: Record<string, { startTime: string; endTime: string }>
  startTime: string
  endTime: string
  service: string
  petName: string
  petType: string
  specialInstructions: string
  offLeashAllowed: boolean
  
  // Emergency Contacts
  emergencyContactName: string
  emergencyContactPhone: string
  veterinarianName: string
  veterinarianPhone: string
  veterinarianAddress: string
  
  // Recurring
  recurringBooking: boolean
  recurringDays: string[]
  recurringType: string
  recurringEndDate: string
}

const normalizeServices = (servicesInput: any) => {
  const formatService = (serviceName: string) => ({
    name: serviceName,
    label: serviceLabels[serviceName as keyof typeof serviceLabels] || serviceName,
    duration: 'Varieert'
  })

  if (!servicesInput) {
    return []
  }

  if (Array.isArray(servicesInput)) {
    return servicesInput
      .map((service: string) => service?.trim())
      .filter(Boolean)
      .map(service => formatService(service as string))
  }

  if (typeof servicesInput === 'string') {
    return servicesInput
      .split(',')
      .map(service => service.trim())
      .filter(Boolean)
      .map(service => formatService(service))
  }

  return []
}

function BookingContent() {
  const searchParams = useSearchParams()
  const caregiverId = searchParams.get('caregiver')
  const from = searchParams.get('from')
  const defaultDate = searchParams.get('date')
  const defaultService = searchParams.get('service')
  const defaultStart = searchParams.get('start')
  const defaultEnd = searchParams.get('end')
  
  // Determine back link
  const getBackInfo = () => {
    if (from === 'search') return { href: '/search', label: 'Zoek Verzorgers', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }
    if (from === 'profile') return { href: caregiverId ? `/caregivers/${caregiverId}` : '/search', label: 'Terug naar profiel', icon: 'M10 19l-7-7m0 0l7-7m-7 7h18' }
    if (from === 'messages') return { href: '/messages', label: 'Berichten', icon: 'M7 8h10M7 12h6m5 2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h6l4 4v-4h2z' }
    return { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }
  }
  
  const backInfo = getBackInfo()
  const backHref = backInfo.href
  const backLabel = backInfo.label
  const backIcon = backInfo.icon
  
  const [step, setStep] = useState(1) // 1: Details, 2: Payment, 3: Confirmation
  const [bookingData, setBookingData] = useState<BookingData>({
    dates: [],
    startTime: '',
    endTime: '',
    service: '',
    petName: '',
    petType: '',
    specialInstructions: '',
    offLeashAllowed: false,
    
    // Emergency Contacts
    emergencyContactName: '',
    emergencyContactPhone: '',
    veterinarianName: '',
    veterinarianPhone: '',
    veterinarianAddress: '',
    
    // Recurring
    recurringBooking: false,
    recurringDays: [],
    recurringType: '',
    recurringEndDate: ''
  })

  const [caregiverData, setCaregiverData] = useState<any>(null)
  const [availability, setAvailability] = useState<any>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    setBookingData((prev) => {
      let next = { ...prev }

      if (defaultService && !next.service) {
        next = { ...next, service: defaultService }
      }

      if (!next.startTime) {
        next = { ...next, startTime: defaultStart || '09:00' }
      }

      if (!next.endTime) {
        next = { ...next, endTime: defaultEnd || '10:00' }
      }

      if (defaultDate && next.dates.length === 0) {
        next = {
          ...next,
          dates: [defaultDate],
          dayTimes: {
            ...(next.dayTimes || {}),
            [defaultDate]: {
              startTime: defaultStart || next.startTime,
              endTime: defaultEnd || next.endTime
            }
          }
        }
      }

      return next
    })
  }, [defaultDate, defaultService, defaultStart, defaultEnd])

  // Helper function to convert weeklyJson to exactDailySlots
  const weeklyJsonToExactDailySlots = (weeklyJson: string | null) => {
    if (!weeklyJson) {
  
      return {}
    }
    
    try {
      const weekly = typeof weeklyJson === 'string' ? JSON.parse(weeklyJson) : weeklyJson

      const exactDailySlots: Record<string, { start: string; end: string }[]> = {}
      
      // Day mapping
      const dayMapping: Record<number, string> = {
        0: 'sunday',
        1: 'monday', 
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
      }
      
      // Generate slots for next 90 days
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < 90; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        const dayOfWeekIndex = date.getDay()
        const dayName = dayMapping[dayOfWeekIndex]
        
        if (weekly[dayName] && Array.isArray(weekly[dayName]) && weekly[dayName].length > 0) {
          exactDailySlots[date.toISOString().split('T')[0]] = weekly[dayName]
        }
      }
      

      return exactDailySlots
    } catch (error) {
      console.error('Error parsing weeklyJson:', error)
      return {}
    }
  }

  // Fetch caregiver data and availability
  useEffect(() => {
    if (!caregiverId) return
    
    const fetchCaregiverData = async () => {
      try {
        const response = await fetch(`/api/caregivers/${caregiverId}`)
        
        if (response.ok) {
          const data = await response.json()
          setCaregiverData(data)
          
          // Check multiple possible fields for availability
          const weeklyData = data.availabilityWeekly || data.availabilityData?.weeklyJson || data.availability?.weeklyJson || data.weeklyJson
          
          // Convert weeklyJson to exactDailySlots format
          if (weeklyData) {
            const exactDailySlots = weeklyJsonToExactDailySlots(weeklyData)
            setAvailability({ exactDailySlots })
          }
        }
      } catch (error) {
        console.error('Error fetching caregiver data:', error)
      }
    }

    fetchCaregiverData()
  }, [caregiverId])

  const normalizedServices = caregiverData ? normalizeServices(caregiverData.services) : []

  // Use caregiverData from API if available, otherwise use placeholder
  const caregiver = caregiverData ? {
    id: caregiverData.id || caregiverId || '1',
    name: caregiverData.name || caregiverData.user?.name || 'Onbekend',
    city: caregiverData.city || 'Onbekend',
    hourlyRate: caregiverData.hourlyRate || 0,
    photo: caregiverData.photo || '',
    services: normalizedServices
  } : {
    id: caregiverId || '1',
    name: 'Laden...',
    city: 'Laden...',
    hourlyRate: 0,
    photo: '',
    services: []
  }

  useEffect(() => {
    if (!caregiverData) return
    setBookingData((prev) => {
      if (prev.service && prev.startTime && prev.endTime) {
        return prev
      }

      return {
        ...prev,
        service: prev.service || (normalizedServices[0]?.name || ''),
        startTime: prev.startTime || '09:00',
        endTime: prev.endTime || '10:00'
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caregiverData])

  const calculateTotal = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0
    
    const start = new Date(`2000-01-01 ${bookingData.startTime}`)
    const end = new Date(`2000-01-01 ${bookingData.endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    
    const selectedService = caregiver.services.find(s => s.name === bookingData.service)
    const hourlyRate = caregiver.hourlyRate
    
    return Math.max(hours * hourlyRate, hourlyRate) // Minimum 1 hour
  }

  // Real-time validation function
  const validateTimeSlot = (startTime: string, endTime: string, dateStr: string): string | null => {
    if (!startTime || !endTime) {
      return 'Selecteer beide start- en eindtijd'
    }

    // Check if end time is after start time
    const start = new Date(`2000-01-01 ${startTime}`)
    const end = new Date(`2000-01-01 ${endTime}`)
    if (end <= start) {
      return 'Eindtijd moet na starttijd zijn'
    }

    // Check availability if we have data
    if (availability?.exactDailySlots) {
      const daySlots = availability.exactDailySlots[dateStr] || []
      
      if (daySlots.length === 0) {
        return 'Geen beschikbaarheid op deze dag'
      }

      // Convert booking times to minutes
      const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
      }
      
      const bookingStart = timeToMinutes(startTime)
      const bookingEnd = timeToMinutes(endTime)
      
      // Check if booking time falls within any availability slot
      const isWithinAvailability = daySlots.some(slot => {
        const slotStart = timeToMinutes(slot.start)
        const slotEnd = timeToMinutes(slot.end)
        return bookingStart >= slotStart && bookingEnd <= slotEnd
      })
      
      if (!isWithinAvailability) {
        const availableTimes = daySlots.map(s => `${s.start}–${s.end}`).join(', ')
        return `Niet beschikbaar. Beschikbaar tussen: ${availableTimes}`
      }
    }

    return null // No error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Step 1: Validate service and times
    if (step === 1) {
      const newErrors: {[key: string]: string} = {}
      
      // Validate service is selected
      if (!bookingData.service) {
        newErrors.service = 'Selecteer een dienst om door te gaan'
      }
      
      // Validate dates are selected
      if (bookingData.dates.length === 0) {
        newErrors.dates = 'Selecteer minimaal één datum'
      }
      
      // Validate times for each selected date
      bookingData.dates.forEach(dateStr => {
        const startTime = bookingData.dayTimes?.[dateStr]?.startTime || bookingData.startTime
        const endTime = bookingData.dayTimes?.[dateStr]?.endTime || bookingData.endTime
        const timeError = validateTimeSlot(startTime, endTime, dateStr)
        if (timeError) {
          newErrors[`time_${dateStr}`] = timeError
        }
      })
      
      // Set errors if any found
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      
      // Clear errors
      setErrors({})
      
      // All validations passed, go to next step
      setStep(step + 1)
      return
    }
    
    if (step === 2) {
      // Submit booking to API
      try {
        // Create bookings for each selected date
        for (const dateStr of bookingData.dates) {
          const startDateTime = new Date(`${dateStr}T${bookingData.startTime}`)
          const endDateTime = new Date(`${dateStr}T${bookingData.endTime}`)
          
          const response = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caregiverId: caregiverId,
              startAt: startDateTime.toISOString(),
              endAt: endDateTime.toISOString(),
              service: bookingData.service,
              notes: bookingData.specialInstructions
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            alert(error.error || 'Er is een fout opgetreden bij het aanmaken van de boeking.')
            return
          }
        }
        
        // All bookings created successfully
        setStep(3)
      } catch (error) {
        console.error('Booking creation error:', error)
        alert('Er is een netwerkfout opgetreden. Probeer het opnieuw.')
      }
      return
    }
    
    // Step 3: Already completed
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step >= stepNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step > stepNum ? 'bg-green-600' : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <Card className="gradient-card professional-shadow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 text-center">
          Boekingsdetails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Caregiver Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border-2 border-emerald-200">
          <h3 className="font-semibold text-gray-900 mb-3">Gekozen verzorger:</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
              {caregiver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-lg">{caregiver.name}</div>
              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <span>📍 {caregiver.city}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">€{caregiver.hourlyRate}/uur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Dienst *
          </label>
          <select
            value={bookingData.service}
            onChange={(e) => {
              setBookingData({...bookingData, service: e.target.value})
              // Clear service error when user selects a service
              if (errors.service) {
                setErrors({...errors, service: ''})
              }
            }}
            className={`w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium ${
              errors.service ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Kies een dienst</option>
            {caregiver.services.map(service => (
              <option key={service.name} value={service.name}>
                {service.label} ({service.duration})
              </option>
            ))}
          </select>
          {errors.service && (
            <p className="mt-1 text-sm text-red-600">⚠️ {errors.service}</p>
          )}
        </div>

        {/* Date Selection with Calendar */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Selecteer datum(s) *
          </label>
          <DateRangePicker
            selectedDates={bookingData.dates}
            onDatesChange={(dates) => setBookingData({...bookingData, dates})}
            availability={availability ? {
              days: [],
              times: [],
              exactDailySlots: availability.exactDailySlots || {}
            } : undefined}
            minDate={new Date()}
          />
        </div>

        {/* Time Selection for selected dates */}
        {bookingData.dates.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              ⏰ Tijden voor geselecteerde dagen *
            </label>
            <div className="space-y-3">
              {bookingData.dates.map((dateStr) => {
                const startTime = bookingData.dayTimes?.[dateStr]?.startTime || bookingData.startTime
                const endTime = bookingData.dayTimes?.[dateStr]?.endTime || bookingData.endTime
                const timeError = validateTimeSlot(startTime, endTime, dateStr)
                
                return (
                  <div key={dateStr}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Starttijd • {new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            setBookingData({
                              ...bookingData,
                              dayTimes: { ...(bookingData.dayTimes || {}), [dateStr]: { startTime: e.target.value, endTime: endTime } }
                            })
                            // Clear error when user changes time
                            if (errors[`time_${dateStr}`]) {
                              setErrors({...errors, [`time_${dateStr}`]: ''})
                            }
                          }}
                          className={`w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium ${
                            timeError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Eindtijd • {new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            setBookingData({
                              ...bookingData,
                              dayTimes: { ...(bookingData.dayTimes || {}), [dateStr]: { startTime: startTime, endTime: e.target.value } }
                            })
                            // Clear error when user changes time
                            if (errors[`time_${dateStr}`]) {
                              setErrors({...errors, [`time_${dateStr}`]: ''})
                            }
                          }}
                          className={`w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium ${
                            timeError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                    </div>
                    {timeError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">⚠️ {timeError}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pet Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Naam van je huisdier *
            </label>
            <input
              type="text"
              value={bookingData.petName}
              onChange={(e) => setBookingData({...bookingData, petName: e.target.value})}
              className="w-full p-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              placeholder="Bijv. Max, Luna, Bella"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Type huisdier *
            </label>
            <select
              value={bookingData.petType}
              onChange={(e) => setBookingData({...bookingData, petType: e.target.value})}
              className="w-full p-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              required
            >
              <option value="">Selecteer type</option>
              <option value="dog">Hond</option>
              <option value="cat">Kat</option>
              <option value="rabbit">Konijn</option>
              <option value="bird">Vogel</option>
              <option value="other">Anders</option>
            </select>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Speciale instructies
          </label>
          <textarea
            value={bookingData.specialInstructions}
            onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
            className="w-full p-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium resize-none"
            rows={4}
            placeholder="Vertel de verzorger wat hij/zij moet weten over je huisdier..."
          />
        </div>

        {/* Off-Leash Option (for dogs) */}
        {bookingData.petType === 'dog' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bookingData.offLeashAllowed}
                onChange={(e) => setBookingData({...bookingData, offLeashAllowed: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded"
              />
              <div>
                <span className="font-semibold text-gray-900">Mag loslopen (waar wettelijk toegestaan)</span>
                <p className="text-xs text-gray-600 mt-1">
                  Alleen als verzorger het veilig acht en lokale regels dit toestaan
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Emergency Contacts Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🚨</span>
            Noodcontacten
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Noodcontact naam *
                </label>
                <input
                  type="text"
                  value={bookingData.emergencyContactName}
                  onChange={(e) => setBookingData({...bookingData, emergencyContactName: e.target.value})}
                  placeholder="Bijv. Jan Janssen"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Noodcontact telefoon *
                </label>
                <input
                  type="tel"
                  value={bookingData.emergencyContactPhone}
                  onChange={(e) => setBookingData({...bookingData, emergencyContactPhone: e.target.value})}
                  placeholder="+32 123 45 67 89"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="border-t border-red-200 pt-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">Dierenarts (optioneel maar aanbevolen)</p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dierenarts naam
                    </label>
                    <input
                      type="text"
                      value={bookingData.veterinarianName}
                      onChange={(e) => setBookingData({...bookingData, veterinarianName: e.target.value})}
                      placeholder="Dr. Pietersen"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dierenarts telefoon
                    </label>
                    <input
                      type="tel"
                      value={bookingData.veterinarianPhone}
                      onChange={(e) => setBookingData({...bookingData, veterinarianPhone: e.target.value})}
                      placeholder="+32 123 45 67 89"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dierenarts adres
                  </label>
                  <input
                    type="text"
                    value={bookingData.veterinarianAddress}
                    onChange={(e) => setBookingData({...bookingData, veterinarianAddress: e.target.value})}
                    placeholder="Hoofdstraat 123, 1000 Brussel"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Booking Option */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={bookingData.recurringBooking}
              onChange={(e) => setBookingData({...bookingData, recurringBooking: e.target.checked})}
              className="w-5 h-5 text-purple-600 rounded mt-1"
            />
            <div>
              <span className="font-bold text-gray-900 text-lg">🔄 Terugkerende boeking</span>
              <p className="text-sm text-gray-600 mt-1">
                Plan automatisch meerdere afspraken in (bijvoorbeeld elke week)
              </p>
            </div>
          </label>

          {bookingData.recurringBooking && (
            <div className="space-y-4 pl-8 border-l-4 border-purple-300">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Herhaling type *
                </label>
                <select
                  value={bookingData.recurringType}
                  onChange={(e) => setBookingData({...bookingData, recurringType: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required={bookingData.recurringBooking}
                >
                  <option value="">Kies frequentie</option>
                  <option value="WEEKLY">Wekelijks</option>
                  <option value="BIWEEKLY">Om de 2 weken</option>
                  <option value="MONTHLY">Maandelijks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Herhalen tot *
                </label>
                <input
                  type="date"
                  value={bookingData.recurringEndDate}
                  onChange={(e) => setBookingData({...bookingData, recurringEndDate: e.target.value})}
                  min={bookingData.dates.length > 0 ? bookingData.dates[0] : new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required={bookingData.recurringBooking}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Automatische boekingen stoppen na deze datum
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Cost */}
        {bookingData.startTime && bookingData.endTime && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border-2 border-emerald-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Totale kosten:</span>
              <span className="text-3xl font-bold text-emerald-600">
                €{calculateTotal().toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Inclusief btw</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card className="gradient-card professional-shadow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 text-center">
          Betaling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Boeking overzicht:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Verzorger:</span>
              <span className="font-medium">{caregiver.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Service:</span>
              <span className="font-medium">
                {caregiver.services.find(s => s.name === bookingData.service)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Datum:</span>
              <span className="font-medium">{bookingData.dates.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tijd:</span>
              <span className="font-medium">{bookingData.startTime} - {bookingData.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Huisdier:</span>
              <span className="font-medium">{bookingData.petName}</span>
            </div>
            <hr className="my-3 border-gray-300" />
            <div className="flex justify-between text-xl font-bold">
              <span>Totaal:</span>
              <span className="text-emerald-600">€{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Betaalmethode:</h3>
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-all">
              <input type="radio" name="payment" value="card" className="mr-3 w-5 h-5 text-emerald-600" defaultChecked />
              <span className="font-medium">💳 Creditcard / Debitcard</span>
            </label>
            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-all">
              <input type="radio" name="payment" value="paypal" className="mr-3 w-5 h-5 text-emerald-600" />
              <span className="font-medium">🅿️ PayPal</span>
            </label>
            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-all">
              <input type="radio" name="payment" value="bancontact" className="mr-3 w-5 h-5 text-emerald-600" />
              <span className="font-medium">🏦 Bancontact</span>
            </label>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 text-blue-900">
            <span className="text-2xl">🔒</span>
            <span className="font-bold">Veilige betaling</span>
          </div>
          <p className="text-sm text-blue-800 mt-2">
            Je betaalgegevens worden veilig verwerkt door onze gecertificeerde betalingspartner.
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card className="gradient-card professional-shadow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 text-center">
          Bevestiging
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6 py-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Boeking succesvol aangemaakt!
        </h3>
        <p className="text-gray-600 text-lg max-w-lg mx-auto">
          Je boeking is bevestigd. Je ontvangt binnen enkele minuten een bevestigingsmail.
          De verzorger wordt op de hoogte gebracht en zal contact met je opnemen.
        </p>
        
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200 text-left max-w-lg mx-auto">
          <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <span className="text-xl">📋</span>
            Volgende stappen:
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Controleer je e-mail voor de bevestiging</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>De verzorger neemt binnen 24 uur contact met je op</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Je kunt berichten uitwisselen via je dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Betaling wordt pas verwerkt na goedkeuring van de verzorger</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button variant="outline" asChild className="px-8 py-3 font-semibold text-base">
            <Link href="/dashboard">
              Naar Dashboard
            </Link>
          </Button>
          <Link href="/search" className="gradient-button px-8 py-3 font-semibold text-base shadow-lg hover:shadow-xl inline-block text-center">
            Zoek Verzorgers
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nieuwe Boeking</h1>
              <p className="text-gray-600">
                {step === 1 && 'Vul je boekingsdetails in'}
                {step === 2 && 'Controleer en betaal'}
                {step === 3 && 'Bevestigd!'}
              </p>
            </div>
            <Link href={backHref} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={backIcon} />
              </svg>
              {backLabel}
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            {step < 3 && (
              <div className="flex justify-between mt-8 pb-12">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="px-10 py-3 font-semibold"
                  >
                    Terug
                  </Button>
                ) : (
                  <Button variant="outline" className="px-10 py-3 font-semibold" asChild>
                    <Link href={backHref}>Annuleren</Link>
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className="gradient-button px-10 py-3 font-semibold shadow-lg hover:shadow-xl"
                  disabled={
                    (step === 1 && (!bookingData.service || bookingData.dates.length === 0 || !bookingData.startTime || !bookingData.endTime || !bookingData.petName || !bookingData.petType))
                  }
                >
                  {step === 1 && 'Naar Betaling'}
                  {step === 2 && 'Bevestigen & Betalen'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Boeking wordt geladen...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
