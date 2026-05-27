import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

// Note: we intentionally do NOT force PLAYWRIGHT_BROWSERS_PATH here.
// In some environments (Cursor sandbox / OneDrive), forcing it to '0' can make
// Playwright look for browsers under `node_modules/playwright-core/.local-browsers`
// even when the browsers were installed to the default cache location.

const PORT = Number(process.env.PW_PORT ?? process.env.PORT ?? 3000)
// Use localhost by default to avoid WebKit CORS issues between localhost and 127.0.0.1.
const baseURL = process.env.PW_BASE_URL ?? `http://localhost:${PORT}`
const serverMode = process.env.PW_SERVER ?? (process.env.CI ? 'prod' : 'dev')
const useWebServer = !process.env.PW_BASE_URL
const isCi = Boolean(process.env.CI)

// Windows (and sometimes OneDrive/AV) can block deletion of prior run artifacts (e.g. `.last-run.json`).
// Avoid deleting by writing each run's artifacts to a fresh folder.
const runId = process.env.PW_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-')
const outputDir = path.join('test-results', runId)
const reportDir = path.join('playwright-report', runId)

const webServerCommand =
  serverMode === 'start'
    ? `npm run start -- -p ${PORT}`
    : serverMode === 'prod'
      ? `npm run build && npm run start -- -p ${PORT}`
      : `npm run dev -- --port ${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  // CI uses one Next server; parallel workers cause 60s navigation timeouts.
  fullyParallel: !isCi,
  workers: isCi ? 1 : undefined,
  retries: isCi ? 2 : 0,
  outputDir,
  reporter: [['list'], ['html', { open: 'never', outputFolder: reportDir }]],

  expect: {
    // WebKit in CI can be slower to stabilize fonts/layout for fullPage screenshots.
    // Keep this higher to avoid flaky "toHaveScreenshot" timeouts.
    timeout: 30_000,
    toHaveScreenshot: {
      // Keep diffs tight but not hypersensitive to font rendering.
      maxDiffPixelRatio: 0.02,
    },
  },

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: useWebServer
    ? {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: !isCi,
        timeout: serverMode === 'start' ? 60_000 : 300_000,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,

  projects: [
    {
      name: 'desktop-chromium',
      testMatch: /.*desktop.*\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-webkit-iphone',
      testIgnore: [/desktop-diensten-navigation\.spec\.ts/, /desktop-diagnostics-gate\.spec\.ts/],
      use: {
        ...devices['iPhone 14'],
        browserName: 'webkit',
      },
    },
    {
      name: 'mobile-chromium-pixel',
      testIgnore: [/desktop-diensten-navigation\.spec\.ts/, /desktop-diagnostics-gate\.spec\.ts/],
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
      },
    },
  ],

  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
})

