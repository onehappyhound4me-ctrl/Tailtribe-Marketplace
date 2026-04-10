/**
 * Maakt `service-event.png` geschikt voor de site: achtergrondloof wordt sterk gedempt (groen mag niet domineren).
 * Werkt met RGB: groen-kanaal omlaag + lagere verzadiging + koelere hue — geen groene “glow” meer.
 * Bron: public/marketing/service-event.png (of RAW na sync, zie hieronder).
 *
 *   node scripts/build-service-event-cover.mjs
 *
 * Na `npm run sync:service-photos` opnieuw draaien als je een nieuwe wedding-bron hebt geüpload.
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
        ? fs.readdirSync(assetsDir).find((f) => f.includes('images_wedding-7dfe4108'))
        : null
      if (!name) {
        console.error(
          'Geen bron: commit/public marketing/service-event-source.png, of sync wedding-asset, of SRC='
        )
        process.exit(1)
      }
      input = path.join(assetsDir, name)
    }
  }

  const tmp = path.join(root, '.tmp-service-event-src.png')
  fs.copyFileSync(input, tmp)
  try {
    // Geen zware G-matrix (geeft snel magenta op huid/wit). Wel: loof dempen via
    // lagere verzadiging + hue naar koeler grijs-groen i.p.v. fel limoengroen.
    const buf = await sharp(tmp)
      .rotate()
      .modulate({
        brightness: 1.03,
        saturation: 0.76,
        hue: -22,
      })
      .linear(1.02, -5)
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
