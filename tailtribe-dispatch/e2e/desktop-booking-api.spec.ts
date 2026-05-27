import { test, expect } from '@playwright/test'

test.describe('desktop booking API smoke', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop-only (fast API checks)')
  })

  test('honeypot POST returns generic success (no DB rows required)', async ({ request }) => {
    const res = await request.post('/api/bookings', {
      data: { website: 'bot-trap' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.ok()).toBeTruthy()
    const body = (await res.json()) as { success?: boolean }
    expect(body.success).toBe(true)
  })
})
