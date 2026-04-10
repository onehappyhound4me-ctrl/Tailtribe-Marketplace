/**
 * Kopieert door de gebruiker in Cursor geüploade dienstfoto's naar public/marketing.
 * Eén keer draaien na het uploaden van beelden in de chat (assets verschijnen onder .cursor/projects/.../assets).
 *
 *   node scripts/sync-service-photos-from-cursor.mjs
 *
 * Na sync:
 * - `npm run build:hondenuitlaatservice-cover` → Charlotte naar `service-hondenuitlaatservice.png`
 * - `npm run build:service-event-cover` → optimaliseert `service-event.png` vanuit `service-event-source.png`
 *
 * Optioneel: set CURSOR_ASSETS_DIR=pad\naar\assets
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const marketing = path.join(root, 'public', 'marketing')

const defaultAssets = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-Users-steve-OneDrive-Desktop-marketplace-github-tailtribe-Tailtribe-Marketplace-tailtribe-dispatch',
  'assets'
)

const assetsDir = process.env.CURSOR_ASSETS_DIR || defaultAssets

/** Bronbestandsnaam (substring match) -> bestemming in public/marketing */
const MAP = [
  ['hero-option-1', 'service-hondenuitlaat-wandeling.jpg'],
  ['images_dog_chinees-5e0fdca3-c42a-41e8-bba6-2ef8a3056da3', 'service-hondenuitlaat.png'],
  ['images_dog_training__2_-896ba3cb-b703-4bde-a763-e31b1aa81e55', 'service-training.png'],
  ['images_iStock-1296353202-64919a02-9d40-4109-990a-b15d86238e1c', 'service-opvang.png'],
  ['images_horse-4a0f0a8e-7b62-44dd-8b06-0baea5dc6b81', 'service-kleinvee.png'],
  ['images_cat_eye-aade70ba-f14a-4d80-be01-e84beeb06bc6', 'service-transport.png'],
  ['images_wedding-13cc4555', 'service-event-source.png'],
  ['images_cavia-7382d586-d603-4ca2-8ba8-31b02b3c7efe', 'service-thuis.png'],
  ['images_kat-fb54f8a3-9534-4ccb-89f0-16841c0716a4', 'service-oppas.png'],
  ['_DSC_charlotte_2', 'service-hondenuitlaatservice-source.png'],
]

function main() {
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets-map niet gevonden:', assetsDir)
    console.error('Zet CURSOR_ASSETS_DIR of upload eerst beelden via Cursor chat.')
    process.exit(1)
  }
  const files = fs.readdirSync(assetsDir)
  let n = 0
  for (const [needle, destName] of MAP) {
    const name = files.find((f) => f.includes(needle))
    if (!name) {
      console.warn('Niet gevonden in assets:', needle)
      continue
    }
    const from = path.join(assetsDir, name)
    const to = path.join(marketing, destName)
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.copyFileSync(from, to)
    console.log('OK', destName, '<-', name.slice(-40))
    n++
  }
  if (n === 0) {
    console.error('Geen enkel bestand gekopieerd. Controleer', assetsDir)
    process.exit(1)
  }
  console.log('Klaar:', n, 'bestanden naar public/marketing')
}

main()
