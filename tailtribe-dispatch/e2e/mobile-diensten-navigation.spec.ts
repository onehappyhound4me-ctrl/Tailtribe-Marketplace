import { test, expect } from '@playwright/test'
import { acceptCookiesIfPresent, attachConsoleGuards, AUTH_SESSION_NOISE_GUARD, openMobileMenu, seedCookieConsentAccepted } from './utils'

test.describe('mobile diensten navigation', () => {
  test('mobile menu: "Diensten" navigates to /diensten (not home)', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, AUTH_SESSION_NOISE_GUARD)
    await seedCookieConsentAccepted(page)
    await page.goto('/over-ons')
    await acceptCookiesIfPresent(page)

    await openMobileMenu(page)
    const drawer = page.getByTestId('mobile-menu-drawer')
    await drawer.getByRole('link', { name: 'Diensten' }).click()

    await expect(page).toHaveURL(/\/diensten(?:\?|#|$)/, { timeout: 20_000 })
    await guard.expectNoIssues()
  })

  test('diensten page: each service card navigates to its detail page', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, AUTH_SESSION_NOISE_GUARD)
    await seedCookieConsentAccepted(page)
    await page.goto('/diensten')
    await acceptCookiesIfPresent(page)

    const serviceLinks = page.locator('main a[href^="/diensten/"]:not([href="/diensten"])')
    await expect(serviceLinks.first()).toBeVisible()

    const hrefs = (await serviceLinks.evaluateAll((anchors) =>
      anchors
        .map((a) => (a instanceof HTMLAnchorElement ? a.getAttribute('href') : null))
        .filter((h): h is string => Boolean(h))
    )) as string[]

    const uniqueHrefs = Array.from(new Set(hrefs))
    expect(uniqueHrefs.length).toBeGreaterThanOrEqual(6)

    for (const href of uniqueHrefs) {
      await page.goto('/diensten')
      await acceptCookiesIfPresent(page)

      const link = page.locator(`main a[href="${href}"]`).first()
      await expect(link).toBeVisible()
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}(?:\\?|#|$)`), { timeout: 20_000 })
    }

    await guard.expectNoIssues()
  })
})

