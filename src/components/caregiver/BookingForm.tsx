'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BookingFormProps {
  caregiverId: string
  services: string[]
  hourlyRate: number
}

const serviceLabels: Record<string, string> = {
  'DOG_WALKING': 'Hondenuitlaat',
  'GROUP_DOG_WALKING': 'Groepsuitlaat',
  'DOG_TRAINING': 'Hondentraining',
  'PET_SITTING': 'Dierenoppas',
  'PET_BOARDING': 'Dierenopvang',
  'HOME_CARE': 'Verzorging aan huis',
  'PET_TRANSPORT': 'Transport huisdieren',
  'SMALL_ANIMAL_CARE': 'Verzorging kleinvee',
  'EVENT_COMPANION': 'Begeleiding events',
  'TRAINING': 'Training',
  'TRANSPORT': 'Transport'
}

export function BookingForm({ caregiverId, services, hourlyRate }: BookingFormProps) {
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  
  const getBookingUrl = () => {
    const params = new URLSearchParams({
      caregiver: caregiverId,
      from: 'profile'
    })
    
    if (selectedService) params.append('service', selectedService)
    if (selectedDate) params.append('date', selectedDate)
    if (selectedTime) params.append('time', selectedTime)
    
    return `/booking/new?${params.toString()}`
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Kies een service</option>
          {services.map((service: string) => (
            <option key={service} value={service}>
              {serviceLabels[service] || service} - €{hourlyRate}/uur
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Datum
        </label>
        <input
          type="date"
          className="w-full p-2 border border-gray-300 rounded-md"
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tijd
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          <option value="">Kies een tijd</option>
          <option value="08:00">08:00</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
        </select>
      </div>

      <Button className="w-full py-5 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all mb-3" asChild>
        <Link href={getBookingUrl()}>
          ✨ Boek Nu
        </Link>
      </Button>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>ℹ️ Na boeking krijg je toegang tot:</strong><br/>
          • Volledige contactgegevens<br/>
          • Telefoonnummer en adres<br/>
          • Directe communicatie
        </p>
      </div>

      <Button variant="outline" className="w-full py-5 text-base font-semibold border-2 hover:bg-emerald-50 hover:border-emerald-500 transition-all mb-6" asChild>
        <Link href={`/messages/new?caregiver=${caregiverId}&from=search`}>
          💬 Bericht Sturen
        </Link>
      </Button>
    </>
  )
}





































