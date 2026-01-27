import { expect, type Page, type TestInfo } from '@playwright/test'

type CollectedIssue = { type: string; message: string }

type ConsoleGuardOptions = {
  ignoreConsoleErrors?: Array<string | RegExp>
}

function shouldIgnoreConsoleError(message: string, opts?: ConsoleGuardOptions) {
  const rules = opts?.ignoreConsoleErrors ?? []
  if (!rules.length) return false
  return rules.some((r) => (typeof r === 'string' ? message.includes(r) : r.test(message)))
}

export function attachConsoleGuards(page: Page, testInfo: TestInfo, opts?: ConsoleGuardOptions) {
  const issues: CollectedIssue[] = []

  page.on('pageerror', (err) => {
    issues.push({ type: 'pageerror', message: String(err?.stack ?? err?.message ?? err) })
  })

  page.on('console', (msg) => {
    // Keep this strict: console errors are almost always a bug (hydration, runtime, etc).
    if (msg.type() === 'error') {
      const text = msg.text()
      if (shouldIgnoreConsoleError(text, opts)) return
      issues.push({ type: 'console.error', message: text })
    }
  })

  page.on('requestfailed', (req) => {
    const failure = req.failure()
    // Ignore aborted navigations (common when we intentionally redirect during tests).
    if (failure?.errorText?.toLowerCase().includes('aborted')) return
    issues.push({ type: 'requestfailed', message: `${req.method()} ${req.url()} :: ${failure?.errorText ?? 'failed'}` })
  })

  return {
    async expectNoIssues() {
      if (issues.length) {
        testInfo.attach('console-issues', {
          body: issues.map((i) => `[${i.type}] ${i.message}`).join('\n'),
          contentType: 'text/plain',
        })
      }
      expect(issues, 'Console/page/network errors detected').toEqual([])
    },
  }
}

export async function acceptCookiesIfPresent(page: Page) {
  // Cookie banner blocks clicks & screenshots if not dismissed.
  const accept = page.getByRole('button', { name: 'Akkoord' })
  if (await accept.isVisible().catch(() => false)) {
    await accept.click()
  }
}

export async function seedCookieConsentAccepted(page: Page) {
  // Deterministic tests: avoid cookie banner affecting clicks/screenshots.
  await page.addInitScript(({ key }) => {
    try {
      window.localStorage.setItem(key, 'accepted')
    } catch {
      // ignore
    }
  }, { key: 'tailtribe_cookie_consent' })
}

export async function openMobileMenu(page: Page) {
  const toggle = page.getByTestId('mobile-menu-toggle')
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(page.getByTestId('mobile-menu-drawer')).toBeVisible()
}

export async function closeMobileMenu(page: Page) {
  const drawer = page.getByTestId('mobile-menu-drawer')
  if (await drawer.isVisible().catch(() => false)) {
    const close = page.getByTestId('mobile-menu-close')
    if (await close.isVisible().catch(() => false)) {
      await close.click()
    } else {
      await page.keyboard.press('Escape')
    }
  }
  await expect(page.getByTestId('mobile-menu-drawer')).toBeHidden()
}

export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    const viewport = window.innerWidth
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth)
    if (scrollWidth <= viewport + 1) return null

    // Best-effort offender scan for debugging (helps fix root cause fast).
    const offenders: Array<{ tag: string; id: string | null; className: string | null; right: number; width: number }> = []
    const elems = Array.from(document.querySelectorAll<HTMLElement>('body *'))
    for (const el of elems) {
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) continue
      if (r.right > viewport + 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: typeof el.className === 'string' ? el.className : null,
          right: Math.round(r.right),
          width: Math.round(r.width),
        })
      }
      if (offenders.length >= 12) break
    }
    return { viewport, scrollWidth, offenders }
  })

  expect(overflow, overflow ? `Horizontal overflow detected: ${JSON.stringify(overflow, null, 2)}` : undefined).toBeNull()
}

export async function assertSomeImagesHealthy(page: Page, minCount: number) {
  const healthy = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'))
    const visible = imgs.filter((img) => {
      const r = img.getBoundingClientRect()
      const style = window.getComputedStyle(img)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
      return r.width >= 24 && r.height >= 24 && r.bottom >= 0 && r.right >= 0 && r.top <= window.innerHeight && r.left <= window.innerWidth
    })
    const ok = visible.filter((img) => (img.complete ? img.naturalWidth > 0 : true))
    const broken = visible
      .filter((img) => img.complete && img.naturalWidth === 0)
      .slice(0, 10)
      .map((img) => img.currentSrc || img.src)

    return { visibleCount: visible.length, okCount: ok.length, broken }
  })

  expect(
    healthy.okCount,
    `Expected at least ${minCount} visible non-broken images; got ${healthy.okCount}. Broken: ${healthy.broken.join(', ')}`
  ).toBeGreaterThanOrEqual(minCount)
}

