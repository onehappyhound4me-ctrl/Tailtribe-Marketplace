/**
 * Schrijft `service-event.png` vanuit `service-event-source.png` (EXIF-rotatie + PNG-optimalisatie).
 * Geen kleurfilter meer: de beeldbankfoto is neutraal.
 *
 *   node scripts/build-service-event-cover.mjs
 *
 * Na sync: bron staat in `service-event-source.png` — dit script opnieuw draaien.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const marketingDir = path.join(root, 'public', 'marketing')
const outFile = path.join(marketingDir, 'service-event.png')

const defaultAssets = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-Users-steve-OneDrive-Desktop-marketplace-github-tailtribe-Tailtribe-Marketplace-tailtribe-dispatch',
  'assets'
)

async function main() {
  let input = process.env.SRC
  if (input && !fs.existsSync(input)) {
    console.warn('SRC ongeldig:', input)
    input = undefined
  }
  if (!input) {
    const bundled = path.join(marketingDir, 'service-event-source.png')
    if (fs.existsSync(bundled)) {
      input = bundled
    } else {
      const assetsDir = process.env.CURSOR_ASSETS_DIR || defaultAssets
      const name = fs.existsSync(assetsDir)
        ? fs.readdirSync(assetsDir).find((f) => f.includes('images_wedding-13cc4555'))
        : null
      if (!name) {
        console.error(
          'Geen bron: public/marketing/service-event-source.png, of wedding-asset in Cursor assets, of SRC='
        )
        process.exit(1)
      }
      input = path.join(assetsDir, name)
    }
  }

  const tmp = path.join(root, '.tmp-service-event-src.png')
  fs.copyFileSync(input, tmp)
  try {
    const buf = await sharp(tmp)
      .rotate()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer()

    fs.writeFileSync(outFile, buf)
    console.log('OK', outFile, buf.length, 'bytes')
  } finally {
    try {
      fs.unlinkSync(tmp)
    } catch {
      /* ignore */
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
