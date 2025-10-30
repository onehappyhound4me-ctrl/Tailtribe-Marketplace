export interface TimeSlot {
  start: string // HH:MM format
  end: string   // HH:MM format
}

export interface DayData {
  date: string // YYYY-MM-DD format
  available: TimeSlot[]
  booked: TimeSlot[]
  blocked: boolean
  isPast: boolean
  serviceId?: string // Optional for backward compatibility
}

export interface CalendarResponse {
  days: DayData[]
}

export interface AvailabilityRequest {
  caregiverId: string
  date: string // YYYY-MM-DD format
  slots: TimeSlot[]
  blocked: boolean
  serviceId: string // Required for service-aware availability
}
