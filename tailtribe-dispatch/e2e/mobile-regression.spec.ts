import { test, expect } from '@playwright/test'
import {
  acceptCookiesIfPresent,
  AUTH_SESSION_NOISE_GUARD,
  assertNoHorizontalOverflow,
  assertImagesBySrcHealthy,
  assertSomeImagesHealthy,
  attachConsoleGuards,
  openMobileMenu,
  seedCookieConsentAccepted,
} from './utils'

const isExternalBaseUrl = Boolean(process.env.PW_BASE_URL)
const shouldAssertScreenshots = !isExternalBaseUrl && !process.env.CI

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
    const guard = attachConsoleGuards(page, testInfo, AUTH_SESSION_NOISE_GUARD)
    await seedCookieConsentAccepted(page)
    await page.goto('/')
    await acceptCookiesIfPresent(page)

    await expect(page.locator('body')).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await assertSomeImagesHealthy(page, 1)

    if (shouldAssertScreenshots) {
      await expect(page).toHaveScreenshot('home.png', { fullPage: true })
    }
    await guard.expectNoIssues()
  })

  test('diensten icons load on mobile (no green-dot placeholders)', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, AUTH_SESSION_NOISE_GUARD)
    await seedCookieConsentAccepted(page)
    await page.goto('/diensten')
    await acceptCookiesIfPresent(page)

    // Service cards use /assets/*.png icons; ensure several are actually loaded.
    await assertImagesBySrcHealthy(page, { srcIncludes: '/assets/', minCount: 6 })
    await guard.expectNoIssues()
  })

  test('hamburger menu opens, closes and navigates', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, AUTH_SESSION_NOISE_GUARD)
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
    const drawer = page.getByTestId('mobile-menu-drawer')
    await drawer.getByRole('link', { name: 'Over ons' }).click()
    await expect(page).toHaveURL(/\/over-ons/, { timeout: 20_000 })
    await expect(page.getByTestId('mobile-menu-drawer')).toBeHidden()

    await guard.expectNoIssues()
  })

  for (const p of PAGES) {
    test(`page: ${p.name}`, async ({ page }, testInfo) => {
      const ignoreConsoleErrors = [
        ...(AUTH_SESSION_NOISE_GUARD.ignoreConsoleErrors ?? []),
        // WebKit can inject inline styles into inputs before hydration, which shows up as a React hydration warning.
        // We keep this scoped to the login page to avoid masking real issues elsewhere.
        ...(p.name === 'login' ? [/Extra attributes from the server:.*style/i] : []),
      ]
      const guard = attachConsoleGuards(page, testInfo, {
        ignoreConsoleErrors,
        ignoreRequestFailed: [...(AUTH_SESSION_NOISE_GUARD.ignoreRequestFailed ?? [])],
        ignorePageErrors: [...(AUTH_SESSION_NOISE_GUARD.ignorePageErrors ?? [])],
      })
      await seedCookieConsentAccepted(page)
      await page.goto(p.path)
      await acceptCookiesIfPresent(page)

      await expect(page.locator('body')).toBeVisible()
      await assertNoHorizontalOverflow(page)
      if (p.minImages > 0) await assertSomeImagesHealthy(page, p.minImages)

      if (shouldAssertScreenshots) {
        await expect(page).toHaveScreenshot(`${p.name}.png`, { fullPage: true })
      }
      await guard.expectNoIssues()
    })
  }

  test('boeken requires auth (redirects to login)', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, AUTH_SESSION_NOISE_GUARD)
    await seedCookieConsentAccepted(page)
    await page.goto('/boeken')
    await acceptCookiesIfPresent(page)
    await expect(page).toHaveURL(/\/login/)
    await guard.expectNoIssues()
  })
})

