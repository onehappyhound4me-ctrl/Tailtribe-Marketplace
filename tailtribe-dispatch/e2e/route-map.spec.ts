import { test, expect } from '@playwright/test'
import { DISPATCH_SERVICES } from '../lib/services'
import { routes } from '../lib/routes'

test.describe('route map', () => {
  test('each service slug produces a non-empty /diensten/<slug> href (never "/")', () => {
    const hrefs: string[] = []

    for (const s of DISPATCH_SERVICES) {
      const href = routes.dienst(s.slug)
      hrefs.push(href)

      expect(href).toMatch(/^\/diensten\/[^/]+/)
      expect(href).not.toBe('/')
      expect(href).not.toBe(routes.diensten)
    }

    // Prevent duplicates (can cause "wrong service" clicks).
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

