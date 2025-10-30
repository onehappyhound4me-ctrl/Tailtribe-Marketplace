'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  onSave: (data: any) => void
}

const SERVICES = [
  { id: 'DOG_WALKING', name: 'Hondenuitlaat', icon: '🐕' },
  { id: 'GROUP_DOG_WALKING', name: 'Groepsuitlaat', icon: '🐕‍🦺' },
  { id: 'DOG_TRAINING', name: 'Hondentraining', icon: '🎓' },
  { id: 'PET_SITTING', name: 'Dierenoppas', icon: '🏠' },
  { id: 'PET_BOARDING', name: 'Dierenopvang', icon: '🏡' },
  { id: 'HOME_CARE', name: 'Verzorging aan huis', icon: '🏥' },
  { id: 'PET_TRANSPORT', name: 'Transport huisdieren', icon: '🚗' },
  { id: 'SMALL_ANIMAL_CARE', name: 'Verzorging kleinvee', icon: '🐰' },
  { id: 'EVENT_COMPANION', name: 'Begeleiding events', icon: '🎪' }
]

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
]

export default function AvailabilityModal({ isOpen, onClose, date, onSave }: AvailabilityModalProps) {
  const [available, setAvailable] = useState(true)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setAvailable(true)
      setSelectedServices([])
      setSelectedTimeSlots([])
    }
  }, [isOpen])

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(time => time !== timeSlot)
        : [...prev, timeSlot]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave({
        date,
        available,
        services: selectedServices,
        timeSlots: selectedTimeSlots
      })
      onClose()
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Beschikbaarheid instellen</h2>
              <p className="text-gray-600">
                {new Date(date).toLocaleDateString('nl-NL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Beschikbaarheid</h3>
              <p className="text-sm text-gray-600">Ben je beschikbaar op deze dag?</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={available ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvailable(true)}
                className={available ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Beschikbaar
              </Button>
              <Button
                variant={!available ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvailable(false)}
                className={!available ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Niet beschikbaar
              </Button>
            </div>
          </div>

          {available && (
            <>
              {/* Services Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Beschikbare diensten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SERVICES.map((service) => (
                    <Button
                      key={service.id}
                      variant={selectedServices.includes(service.id) ? 'default' : 'outline'}
                      className={`justify-start h-auto p-4 ${
                        selectedServices.includes(service.id) 
                          ? 'bg-emerald-600 hover:bg-emerald-700' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{service.icon}</span>
                        <span className="font-medium">{service.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Slots Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Beschikbare tijdslots</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((timeSlot) => (
                    <Button
                      key={timeSlot}
                      variant={selectedTimeSlots.includes(timeSlot) ? 'default' : 'outline'}
                      size="sm"
                      className={`${
                        selectedTimeSlots.includes(timeSlot) 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleTimeSlotToggle(timeSlot)}
                    >
                      {timeSlot}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Summary */}
              {(selectedServices.length > 0 || selectedTimeSlots.length > 0) && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Samenvatting</h4>
                  <div className="space-y-2">
                    {selectedServices.length > 0 && (
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Diensten:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedServices.map(serviceId => {
                            const service = SERVICES.find(s => s.id === serviceId)
                            return (
                              <Badge key={serviceId} className="bg-blue-100 text-blue-800">
                                {service?.icon} {service?.name}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {selectedTimeSlots.length > 0 && (
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Tijdslots:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTimeSlots.map(timeSlot => (
                            <Badge key={timeSlot} className="bg-blue-100 text-blue-800">
                              {timeSlot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </div>
  )
}


