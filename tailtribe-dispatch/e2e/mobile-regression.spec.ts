import { test, expect } from '@playwright/test'
import {
  acceptCookiesIfPresent,
  assertNoHorizontalOverflow,
  assertSomeImagesHealthy,
  attachConsoleGuards,
  openMobileMenu,
  seedCookieConsentAccepted,
} from './utils'

const PAGES = [
  // Home hero uses a CSS background image, so we only require the logo (and/or service icons) to be present.
  { path: '/', name: 'home', minImages: 1 },
  { path: '/diensten', name: 'diensten', minImages: 1 },
  { path: '/over-ons', name: 'over-ons', minImages: 1 },
  { path: '/contact', name: 'contact', minImages: 0 },
  { path: '/login', name: 'login', minImages: 0 },
] as const

test.describe('mobile regression', () => {
  test('home loads, no console errors, no overflow, screenshots', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo)
    await seedCookieConsentAccepted(page)
    await page.goto('/')
    await acceptCookiesIfPresent(page)

    await expect(page.locator('body')).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await assertSomeImagesHealthy(page, 1)

    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
    await guard.expectNoIssues()
  })

  test('hamburger menu opens/closes and navigates', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo)
    await seedCookieConsentAccepted(page)
    await page.goto('/')
    await acceptCookiesIfPresent(page)

    await openMobileMenu(page)
    await expect(page.getByTestId('mobile-menu-backdrop')).toBeVisible()
    await expect(page.getByTestId('mobile-menu-drawer')).toBeVisible()

    // iOS scroll-lock regressions: ensure we lock background scroll.
    const overflow = await page.evaluate(() => document.body.style.overflow)
    expect(overflow).toBe('hidden')

    // Close via backdrop
    await page.getByTestId('mobile-menu-backdrop').click({ position: { x: 10, y: 10 } })
    await expect(page.getByTestId('mobile-menu-drawer')).toBeHidden()

    // Close via Escape
    await openMobileMenu(page)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('mobile-menu-drawer')).toBeHidden()

    // Navigate via menu link
    await openMobileMenu(page)
    await page.getByRole('link', { name: 'Over ons' }).click()
    await expect(page).toHaveURL(/\/over-ons/)
    await expect(page.getByTestId('mobile-menu-drawer')).toBeHidden()

    await guard.expectNoIssues()
  })

  for (const p of PAGES) {
    test(`page: ${p.name}`, async ({ page }, testInfo) => {
      const guard = attachConsoleGuards(page, testInfo)
      await seedCookieConsentAccepted(page)
      await page.goto(p.path)
      await acceptCookiesIfPresent(page)

      await expect(page.locator('body')).toBeVisible()
      await assertNoHorizontalOverflow(page)
      if (p.minImages > 0) await assertSomeImagesHealthy(page, p.minImages)

      await expect(page).toHaveScreenshot(`${p.name}.png`, { fullPage: true })
      await guard.expectNoIssues()
    })
  }

  test('boeken requires auth (redirects to login)', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo)
    await seedCookieConsentAccepted(page)
    await page.goto('/boeken')
    await acceptCookiesIfPresent(page)
    await expect(page).toHaveURL(/\/login/)
    await guard.expectNoIssues()
  })
})

