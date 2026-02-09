import { test, expect } from '@playwright/test'
import { acceptCookiesIfPresent, attachConsoleGuards, seedCookieConsentAccepted } from './utils'

test.describe('desktop diensten navigation', () => {
  test('header: desktop "Diensten" menu navigates to /diensten (not home anchor)', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, {
      ignoreConsoleErrors: [/ClientFetchError:.*(?:Failed to fetch|Load failed)/i],
    })
    await seedCookieConsentAccepted(page)
    await page.goto('/over-ons')
    await acceptCookiesIfPresent(page)

    // Desktop header link is hidden on mobile via md:block, so this is a desktop-only regression test.
    const headerDiensten = page.locator('header nav a', { hasText: 'Diensten' }).first()
    await expect(headerDiensten).toBeVisible()

    const href = await headerDiensten.getAttribute('href')
    testInfo.attach('header-diensten-click-target', {
      body: JSON.stringify({ hrefAttr: href }, null, 2),
      contentType: 'application/json',
    })

    await headerDiensten.click()
    await expect(page).toHaveURL(/\/diensten(?:\?|#|$)/, { timeout: 20_000 })
    await guard.expectNoIssues()
  })

  test('diensten page: each service card navigates to its detail page (not home)', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, {
      // In local dev, NEXTAUTH_URL can point at a LAN host (e.g. 192.168.x.x) for mobile testing.
      // When Playwright runs against 127.0.0.1, next-auth/react may log a ClientFetchError due to cross-origin session fetch.
      // Navigation assertions are still valid; we keep other console errors strict.
      ignoreConsoleErrors: [/ClientFetchError:.*(?:Failed to fetch|Load failed)/i],
    })
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

    // Deduplicate while preserving order
    const uniqueHrefs = Array.from(new Set(hrefs))
    expect(uniqueHrefs.length).toBeGreaterThanOrEqual(6)

    for (const href of uniqueHrefs) {
      // Fresh page load each iteration keeps this deterministic (avoids stale locators).
      await page.goto('/diensten')
      await acceptCookiesIfPresent(page)

      const link = page.locator(`main a[href="${href}"]`).first()
      await expect(link).toBeVisible()

      // Capture click-time target for debugging if it ever regresses.
      const clickTarget = await link.evaluate((a) => ({
        hrefAttr: a.getAttribute('href'),
        hrefResolved: (a as HTMLAnchorElement).href,
        text: (a.textContent || '').trim().slice(0, 80),
      }))
      testInfo.attach(`click-target-${href.replace(/\W+/g, '_')}`, {
        body: JSON.stringify(clickTarget, null, 2),
        contentType: 'application/json',
      })

      await link.click()
      await expect(page, `Expected navigation to ${href}, got ${page.url()}`).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}(?:\\?|#|$)`), {
        timeout: 20_000,
      })
      await expect(page).not.toHaveURL(/\/(?:\?|#|$)/)
    }

    await guard.expectNoIssues()
  })

  test('home services grid: clicking a service card navigates to the detail page', async ({ page }, testInfo) => {
    const guard = attachConsoleGuards(page, testInfo, {
      ignoreConsoleErrors: [/ClientFetchError:.*(?:Failed to fetch|Load failed)/i],
    })
    await seedCookieConsentAccepted(page)
    await page.goto('/')
    await acceptCookiesIfPresent(page)

    // Scroll to services section, then click a service card.
    await page.locator('#services').scrollIntoViewIfNeeded()
    const firstServiceCard = page.locator('#services a[href^="/diensten/"]').first()
    await expect(firstServiceCard).toBeVisible()
    const href = await firstServiceCard.getAttribute('href')
    expect(href, 'Expected first service card to have a /diensten/... href').toMatch(/^\/diensten\/.+/)

    await firstServiceCard.click()
    await expect(page).toHaveURL(new RegExp(`${String(href).replace(/\//g, '\\/')}(?:\\?|#|$)`), { timeout: 20_000 })

    await guard.expectNoIssues()
  })
})

