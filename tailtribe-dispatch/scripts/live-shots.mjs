import fs from 'node:fs'
import path from 'node:path'
import { chromium, devices, webkit } from 'playwright'

process.env.PLAYWRIGHT_BROWSERS_PATH = '0'

const outDir = path.join(process.cwd(), '_live-shots')
fs.mkdirSync(outDir, { recursive: true })

const targets = [
  { base: 'https://www.tailtribe.be', slug: 'www' },
  { base: 'https://tailtribe.be', slug: 'apex' },
]

const pages = [
  { path: '/', slug: 'home' },
  { path: '/diensten', slug: 'diensten' },
  { path: '/be/antwerpen/turnhout', slug: 'be-antwerpen-turnhout' },
]

const runs = [
  { name: 'webkit-iphone', browserType: webkit, device: devices['iPhone 14'] },
  { name: 'chromium-pixel', browserType: chromium, device: devices['Pixel 7'] },
]

for (const t of targets) {
  for (const r of runs) {
    const browser = await r.browserType.launch()
    const context = await browser.newContext(r.device)
    const page = await context.newPage()

    for (const p of pages) {
      const url = `${t.base}${p.path}`
      await page.goto(url, { waitUntil: 'load', timeout: 45_000 })
      await page.waitForTimeout(1_500)
      await page.screenshot({ path: path.join(outDir, `${t.slug}-${p.slug}-${r.name}-top.png`), fullPage: false })

      // Scroll a bit to capture below-the-fold content (where many icons/images live).
      await page.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight, window.innerHeight * 1.5)))
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(outDir, `${t.slug}-${p.slug}-${r.name}-mid.png`), fullPage: false })
    }

    await browser.close()
  }
}

console.log(`Saved screenshots to: ${outDir}`)

