import { expect, type Page, type TestInfo } from '@playwright/test'

type CollectedIssue = { type: string; message: string }

type ConsoleGuardOptions = {
  ignoreConsoleErrors?: Array<string | RegExp>
  ignorePageErrors?: Array<string | RegExp>
  ignoreRequestFailed?: Array<string | RegExp>
}

// Auth/session polling can produce harmless noise (aborted requests) during navigations,
// especially in WebKit. Keep E2E strict for real issues, but ignore this known, non-actionable noise.
export const AUTH_SESSION_NOISE_GUARD: ConsoleGuardOptions = {
  ignoreConsoleErrors: [
    // NextAuth/Auth.js noisy client-side session polling failures during navigation.
    /ClientFetchError: Failed to fetch/i,
    /CLIENT_FETCH_ERROR/i,
    /errors\.authjs\.dev#autherror/i,
    // Some environments only surface a generic fetch error (without the Auth.js wrapper).
    /TypeError: Failed to fetch/i,
    /\bFailed to fetch\b/i,
    /Load failed/i,
  ],
  ignoreRequestFailed: [/\/api\/auth\/session/i, /load request cancelled/i],
  ignorePageErrors: [
    /Fetch API cannot load .*\/api\/auth\/session.*access control checks/i,
    /TypeError: Failed to fetch/i,
    /\bFailed to fetch\b/i,
    /access control checks/i,
  ],
}

function matchesIgnoreRules(message: string, rules: Array<string | RegExp>) {
  if (!rules.length) return false
  return rules.some((r) => (typeof r === 'string' ? message.includes(r) : r.test(message)))
}

export function attachConsoleGuards(page: Page, testInfo: TestInfo, opts?: ConsoleGuardOptions) {
  const issues: CollectedIssue[] = []

  page.on('pageerror', (err) => {
    const text = String(err?.stack ?? err?.message ?? err)
    if (matchesIgnoreRules(text, opts?.ignorePageErrors ?? [])) return
    issues.push({ type: 'pageerror', message: text })
  })

  page.on('console', (msg) => {
    // Keep this strict: console errors are almost always a bug (hydration, runtime, etc).
    if (msg.type() === 'error') {
      const text = msg.text()
      if (matchesIgnoreRules(text, opts?.ignoreConsoleErrors ?? [])) return
      issues.push({ type: 'console.error', message: text })
    }
  })

  page.on('requestfailed', (req) => {
    const failure = req.failure()
    // Ignore aborted navigations (common when we intentionally redirect during tests).
    if (failure?.errorText?.toLowerCase().includes('aborted')) return
    const text = `${req.method()} ${req.url()} :: ${failure?.errorText ?? 'failed'}`
    if (matchesIgnoreRules(text, opts?.ignoreRequestFailed ?? [])) return
    issues.push({ type: 'requestfailed', message: text })
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
  const deadline = Date.now() + 8_000
  // Wait for images to either load or error. If we check too early, Playwright may pass even though images never load.
  while (true) {
    const healthy = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'))
      const visible = imgs.filter((img) => {
        const r = img.getBoundingClientRect()
        const style = window.getComputedStyle(img)
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
        return (
          r.width >= 24 &&
          r.height >= 24 &&
          r.bottom >= 0 &&
          r.right >= 0 &&
          r.top <= window.innerHeight &&
          r.left <= window.innerWidth
        )
      })

      const pending = visible.filter((img) => !img.complete).slice(0, 10).map((img) => img.currentSrc || img.src)
      const ok = visible.filter((img) => img.complete && img.naturalWidth > 0)
      const broken = visible
        .filter((img) => img.complete && img.naturalWidth === 0)
        .slice(0, 10)
        .map((img) => img.currentSrc || img.src)

      return { visibleCount: visible.length, okCount: ok.length, broken, pending }
    })

    if (healthy.okCount >= minCount) return
    if (Date.now() > deadline) {
      expect(
        healthy.okCount,
        `Expected at least ${minCount} visible loaded images; got ${healthy.okCount}.\nPending: ${healthy.pending.join(', ')}\nBroken: ${healthy.broken.join(', ')}`
      ).toBeGreaterThanOrEqual(minCount)
      return
    }

    await page.waitForTimeout(250)
  }
}

export async function assertImagesBySrcHealthy(page: Page, opts: { srcIncludes: string; minCount: number }) {
  const deadline = Date.now() + 8_000
  while (true) {
    const res = await page.evaluate(({ srcIncludes }) => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img')).filter((img) =>
        (img.currentSrc || img.src || '').includes(srcIncludes)
      )

      const ok = imgs.filter((img) => img.complete && img.naturalWidth > 0)
      const pending = imgs.filter((img) => !img.complete).slice(0, 10).map((img) => img.currentSrc || img.src)
      const broken = imgs
        .filter((img) => img.complete && img.naturalWidth === 0)
        .slice(0, 10)
        .map((img) => img.currentSrc || img.src)

      return { totalCount: imgs.length, okCount: ok.length, pending, broken }
    }, { srcIncludes: opts.srcIncludes })

    if (res.okCount >= opts.minCount) return
    if (Date.now() > deadline) {
      expect(
        res.okCount,
        `Expected at least ${opts.minCount} loaded images whose src includes "${opts.srcIncludes}". Got ${res.okCount}/${res.totalCount}.\nPending: ${res.pending.join(
          ', '
        )}\nBroken: ${res.broken.join(', ')}`
      ).toBeGreaterThanOrEqual(opts.minCount)
      return
    }

    await page.waitForTimeout(250)
  }
}

