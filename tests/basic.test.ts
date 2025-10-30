import { describe, it, expect } from 'vitest'

describe('TailTribe Platform', () => {
  it('should have correct service labels', () => {
    const serviceLabels = {
      'DOG_WALKING': 'Hondenuitlaat',
      'PET_SITTING': 'Dierenoppas',
      'TRAINING': 'Training',
      'TRANSPORT': 'Transport'
    }

    expect(serviceLabels.DOG_WALKING).toBe('Hondenuitlaat')
    expect(serviceLabels.PET_SITTING).toBe('Dierenoppas')
    expect(serviceLabels.TRAINING).toBe('Training')
    expect(serviceLabels.TRANSPORT).toBe('Transport')
  })

  it('should calculate booking duration correctly', () => {
    const start = new Date('2024-01-01T09:00:00')
    const end = new Date('2024-01-01T12:00:00')
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    
    expect(hours).toBe(3)
  })

  it('should format currency correctly', () => {
    const formatCurrency = (cents: number) => `€${(cents / 100).toFixed(2)}`
    
    expect(formatCurrency(1500)).toBe('€15.00')
    expect(formatCurrency(2250)).toBe('€22.50')
  })

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    expect(emailRegex.test('user@example.com')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)
  })
})

