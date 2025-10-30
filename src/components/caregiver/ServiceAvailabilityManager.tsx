'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ServiceSlot {
  start: string
  end: string
  service: string
  maxBookings: number
  currentBookings: number
}

interface DayAvailability {
  available: boolean
  slots: ServiceSlot[]
}

interface WeeklyAvailability {
  maandag: DayAvailability
  dinsdag: DayAvailability
  woensdag: DayAvailability
  donderdag: DayAvailability
  vrijdag: DayAvailability
  zaterdag: DayAvailability
  zondag: DayAvailability
}

const SERVICES = [
  { id: 'DOG_WALKING', name: 'Hondenuitlaat', color: 'bg-blue-100 text-blue-800' },
  { id: 'GROUP_DOG_WALKING', name: 'Groepsuitlaat', color: 'bg-green-100 text-green-800' },
  { id: 'DOG_TRAINING', name: 'Hondentraining', color: 'bg-purple-100 text-purple-800' },
  { id: 'PET_SITTING', name: 'Dierenoppas', color: 'bg-orange-100 text-orange-800' },
  { id: 'PET_BOARDING', name: 'Dierenopvang', color: 'bg-pink-100 text-pink-800' },
  { id: 'HOME_CARE', name: 'Verzorging aan huis', color: 'bg-teal-100 text-teal-800' },
  { id: 'PET_TRANSPORT', name: 'Transport huisdieren', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'SMALL_ANIMAL_CARE', name: 'Verzorging kleinvee', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'EVENT_COMPANION', name: 'Begeleiding events', color: 'bg-red-100 text-red-800' }
]

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
]

interface ServiceAvailabilityManagerProps {
  onSave: (availability: WeeklyAvailability) => void
  initialAvailability?: WeeklyAvailability
}

export default function ServiceAvailabilityManager({ 
  onSave, 
  initialAvailability 
}: ServiceAvailabilityManagerProps) {
  const [availability, setAvailability] = useState<WeeklyAvailability>({
    maandag: { available: false, slots: [] },
    dinsdag: { available: false, slots: [] },
    woensdag: { available: false, slots: [] },
    donderdag: { available: false, slots: [] },
    vrijdag: { available: false, slots: [] },
    zaterdag: { available: false, slots: [] },
    zondag: { available: false, slots: [] }
  })

  const [selectedDay, setSelectedDay] = useState<string>('maandag')
  const [selectedService, setSelectedService] = useState<string>('DOG_WALKING')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00')
  const [selectedEndTime, setSelectedEndTime] = useState<string>('10:00')
  const [maxBookings, setMaxBookings] = useState<number>(1)

  useEffect(() => {
    if (initialAvailability) {
      setAvailability(initialAvailability)
    }
  }, [initialAvailability])

  const toggleDayAvailability = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof WeeklyAvailability],
        available: !prev[day as keyof WeeklyAvailability].available
      }
    }))
  }

  const addTimeSlot = () => {
    const newSlot: ServiceSlot = {
      start: selectedTimeSlot,
      end: selectedEndTime,
      service: selectedService,
      maxBookings,
      currentBookings: 0
    }

    setAvailability(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay as keyof WeeklyAvailability],
        slots: [...prev[selectedDay as keyof WeeklyAvailability].slots, newSlot]
      }
    }))
  }

  const removeTimeSlot = (day: string, slotIndex: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof WeeklyAvailability],
        slots: prev[day as keyof WeeklyAvailability].slots.filter((_, index) => index !== slotIndex)
      }
    }))
  }

  const getServiceName = (serviceId: string) => {
    return SERVICES.find(s => s.id === serviceId)?.name || serviceId
  }

  const getServiceColor = (serviceId: string) => {
    return SERVICES.find(s => s.id === serviceId)?.color || 'bg-gray-100 text-gray-800'
  }

  const handleSave = () => {
    onSave(availability)
  }

  const days = [
    { key: 'maandag', name: 'Maandag' },
    { key: 'dinsdag', name: 'Dinsdag' },
    { key: 'woensdag', name: 'Woensdag' },
    { key: 'donderdag', name: 'Donderdag' },
    { key: 'vrijdag', name: 'Vrijdag' },
    { key: 'zaterdag', name: 'Zaterdag' },
    { key: 'zondag', name: 'Zondag' }
  ]

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Dienstverlening instellen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVICES.map((service) => (
              <Button
                key={service.id}
                variant={selectedService === service.id ? 'default' : 'outline'}
                onClick={() => setSelectedService(service.id)}
                className="justify-start"
              >
                {service.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Tijdslot toevoegen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dag</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {days.map((day) => (
                  <option key={day.key} value={day.key}>{day.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starttijd</label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eindtijd</label>
              <select
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max boekingen</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxBookings}
                onChange={(e) => setMaxBookings(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={addTimeSlot} className="w-full">
              Tijdslot toevoegen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Wekelijkse overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => {
              const dayAvailability = availability[day.key as keyof WeeklyAvailability]
              return (
                <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{day.name}</h3>
                      <Button
                        variant={dayAvailability.available ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDayAvailability(day.key)}
                      >
                        {dayAvailability.available ? 'Beschikbaar' : 'Niet beschikbaar'}
                      </Button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {dayAvailability.slots.length} tijdslot{dayAvailability.slots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {dayAvailability.available && (
                    <div className="space-y-2">
                      {dayAvailability.slots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getServiceColor(slot.service)}>
                              {getServiceName(slot.service)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {slot.start} - {slot.end}
                            </span>
                            <span className="text-sm text-gray-500">
                              Max {slot.maxBookings} boekingen
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimeSlot(day.key, index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Verwijderen
                          </Button>
                        </div>
                      ))}
                      
                      {dayAvailability.slots.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Geen tijdslots ingesteld
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="px-8">
          Beschikbaarheid opslaan
        </Button>
      </div>
    </div>
  )
}


