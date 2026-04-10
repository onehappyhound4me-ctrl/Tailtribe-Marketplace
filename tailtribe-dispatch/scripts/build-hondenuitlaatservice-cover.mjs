/**
 * Bouwt public/marketing/service-hondenuitlaatservice.png vanuit de Charlotte/DSC-asset
 * (iets lichter en zuiverder voor de marketingcover).
 *
 *   node scripts/build-hondenuitlaatservice-cover.mjs
 *
 * Vereist: sharp (devDependency). Bron: Cursor assets-map of SRC env.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const defaultAssets = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-Users-steve-OneDrive-Desktop-marketplace-github-tailtribe-Tailtribe-Marketplace-tailtribe-dispatch',
  'assets'
)

const assetsDir = process.env.CURSOR_ASSETS_DIR || defaultAssets
const marketingDir = path.join(root, 'public', 'marketing')
const bundledSource = path.join(marketingDir, 'service-hondenuitlaatservice-source.png')
const outFile = path.join(marketingDir, 'service-hondenuitlaatservice.png')

async function main() {
  let input = process.env.SRC
  if (input && !fs.existsSync(input)) {
    console.warn('SRC bestaat niet, negeer:', input)
    input = undefined
  }
  if (!input && fs.existsSync(bundledSource)) {
    input = bundledSource
  }
  if (!input) {
    if (!fs.existsSync(assetsDir)) {
      console.error('Geen assets-map:', assetsDir)
      process.exit(1)
    }
    const needle = '_DSC_charlotte_2'
    const name = fs.readdirSync(assetsDir).find((f) => f.includes(needle))
    if (!name) {
      console.error('Bronbestand niet gevonden (substring:', needle + ')')
      process.exit(1)
    }
    input = path.join(assetsDir, name)
  }

  // Sharp leest soms geen paden onder .cursor; kopieer eerst naar het project.
  const tmp = path.join(root, '.tmp-hondenuitlaatservice-src.png')
  fs.copyFileSync(input, tmp)
  try {
    const info = await sharp(tmp)
      .rotate()
      .modulate({ brightness: 1.13, saturation: 1.05 })
      .gamma(1.07)
      .linear(1.025, 10)
      .sharpen({ sigma: 0.7, m1: 0.85, m2: 3, x1: 2, y2: 10, y3: 20 })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(outFile)

    console.log('OK', outFile, info.size, 'bytes')
  } finally {
    try {
      fs.unlinkSync(tmp)
    } catch {
      /* ignore */
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
