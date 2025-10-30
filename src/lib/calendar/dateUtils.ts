/**
 * Generate a 6x7 grid of dates for the calendar display
 * Includes leading/trailing days from adjacent months
 */
export function getMonthGrid(currentMonth: Date): Date[][] {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  const grid: Date[][] = []
  let currentRow: Date[] = []
  
  // Add leading days from previous month
  const previousMonth = new Date(year, month - 1, 0)
  const daysInPreviousMonth = previousMonth.getDate()
  
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    currentRow.push(new Date(year, month - 1, daysInPreviousMonth - i))
  }
  
  // Add all days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    currentRow.push(new Date(year, month, day))
    
    // Start new row every 7 days
    if (currentRow.length === 7) {
      grid.push(currentRow)
      currentRow = []
    }
  }
  
  // Add trailing days from next month to complete the grid
  const daysAdded = firstDay.getDay() - 1 + daysInMonth
  const remainingDays = 42 - daysAdded // 42 = 6 weeks * 7 days
  
  for (let day = 1; day <= remainingDays; day++) {
    currentRow.push(new Date(year, month + 1, day))
    
    if (currentRow.length === 7) {
      grid.push(currentRow)
      currentRow = []
    }
  }
  
  return grid
}

/**
 * Check if a date is within the 90-day range (today to today + 90 days)
 */
export function isIn90DayRange(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 90)
  maxDate.setHours(0, 0, 0, 0)
  
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  
  return checkDate >= today && checkDate <= maxDate
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Check if a date is in the past (not today)
 */
export function isPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  
  return checkDate < today
}

/**
 * Format date for aria-label (Dutch format)
 */
export function formatDateForAriaLabel(date: Date, available: number = 0, booked: number = 0): string {
  const dateStr = date.toLocaleDateString('nl-NL', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
  return `${dateStr} — Beschikbaar: ${available}, Geboekt: ${booked}`
}

/**
 * Get ISO date string (YYYY-MM-DD)
 */
export function toISOString(date: Date): string {
  return date.toISOString().split('T')[0]
}







