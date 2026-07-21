// One-off image optimizer: resizes/compresses the oversized public images
// that Lighthouse flagged (8+ MB on the homepage alone). Overwrites in place;
// originals stay recoverable via git history.
//
// Usage: node scripts/optimize-images.mjs

import sharp from 'sharp'
import { stat, rename } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'public')

// [relative path, max width in px]
// Widths are ~2x the largest rendered size for retina sharpness.
const JOBS = [
  // Homepage hero + banners
  ['marketing/hero.jpg', 1920],
  ['marketing/mid-banner.jpg', 1600],
  ['marketing/how-it-works.jpg', 1200],
  // Service marketing covers (detail pages, og:image)
  ['marketing/service-hondenuitlaat-wandeling.jpg', 1600],
  ['marketing/service-hondenuitlaatservice.png', 1600],
  ['marketing/service-event.png', 1200],
  ['marketing/service-training.png', 1200],
  ['marketing/featured-beweging-rust.png', 1000],
  ['marketing/featured-zorg-op-maat.png', 1000],
  ['marketing/featured-3.jpg', 1000],
  // Service icons: rendered at max 160px
  ['assets/Hondenuitlaat.png', 480],
  ['assets/groepsuitlaat.png', 480],
  ['assets/hondentraining.png', 480],
  ['assets/hondenoppas.png', 480],
  ['assets/hondenopvang.png', 480],
  ['assets/home-visit.png', 480],
  ['assets/transport van huisdieren.png', 480],
  ['assets/verzorging kleinvee.png', 480],
  ['assets/Begleider Bruiloft.png', 480],
  ['assets/fallback.png', 480],
  // OG image (1200x630 is the spec)
  ['assets/hero-marketplace.jpg', 1200],
  // Logo: rendered at max 260px
  ['assets/tailtribe_logo_masked_1751977129022.png', 640],
  ['assets/tailtribe-logo.png', 640],
]

const kb = (n) => `${Math.round(n / 1024)} KB`

let savedTotal = 0
for (const [rel, maxWidth] of JOBS) {
  const file = path.join(ROOT, rel)
  let before
  try {
    before = (await stat(file)).size
  } catch {
    console.log(`SKIP (niet gevonden): ${rel}`)
    continue
  }

  const ext = path.extname(file).toLowerCase()
  const tmp = `${file}.tmp${ext}`

  let pipeline = sharp(file).resize({ width: maxWidth, withoutEnlargement: true })
  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 90 })
  } else {
    pipeline = pipeline.jpeg({ quality: 74, mozjpeg: true })
  }

  await pipeline.toFile(tmp)
  const after = (await stat(tmp)).size

  if (after < before) {
    await rename(tmp, file)
    savedTotal += before - after
    console.log(`OK  ${rel}: ${kb(before)} -> ${kb(after)}`)
  } else {
    const { rm } = await import('node:fs/promises')
    await rm(tmp)
    console.log(`KEEP ${rel}: al klein genoeg (${kb(before)})`)
  }
}

console.log(`\nTotaal bespaard: ${kb(savedTotal)}`)
