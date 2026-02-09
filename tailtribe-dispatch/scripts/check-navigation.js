/* eslint-disable no-console */
const fs = require('node:fs')
const path = require('node:path')

const repoRoot = path.join(__dirname, '..')

const TARGET_DIRS = ['app', 'components', 'lib']
const TARGET_FILES = ['page.tsx']

const FILE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip noise
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'test-results' || entry.name === 'playwright-report') {
        continue
      }
      out.push(...walk(full))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (FILE_EXTS.has(ext)) out.push(full)
    }
  }
  return out
}

function rel(p) {
  return path.relative(repoRoot, p).replace(/\\/g, '/')
}

const files = []
for (const d of TARGET_DIRS) files.push(...walk(path.join(repoRoot, d)))
for (const f of TARGET_FILES) files.push(path.join(repoRoot, f))

const findings = []

const RULES = [
  {
    id: 'no-router-push-home',
    description: `Disallow router.push('/') and router.replace('/') (unintended home fallbacks)`,
    regex: /\brouter\.(push|replace)\(\s*['"`]\/['"`]\s*\)/g,
  },
  {
    id: 'no-home-services-hash',
    description: `Disallow '/#services' (causes "Diensten" to route to home)`,
    regex: /['"`]\/#services['"`]/g,
  },
]

for (const file of files) {
  let content = ''
  try {
    content = fs.readFileSync(file, 'utf8')
  } catch {
    continue
  }
  for (const rule of RULES) {
    rule.regex.lastIndex = 0
    let m
    while ((m = rule.regex.exec(content))) {
      const before = content.slice(0, m.index)
      const line = before.split(/\r?\n/).length
      findings.push({
        file: rel(file),
        line,
        rule: rule.id,
        match: m[0],
      })
      // Avoid endless loops on zero-length matches (shouldn't happen).
      if (m.index === rule.regex.lastIndex) rule.regex.lastIndex++
    }
  }
}

if (findings.length) {
  console.error('\nNavigation guard failed.\n')
  for (const f of findings) {
    console.error(`- ${f.file}:${f.line} [${f.rule}] ${f.match}`)
  }
  console.error('\nFix the findings or justify them explicitly.\n')
  process.exit(1)
}

console.log('Navigation guard passed.')

