import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

// Note: we intentionally do NOT force PLAYWRIGHT_BROWSERS_PATH here.
// In some environments (Cursor sandbox / OneDrive), forcing it to '0' can make
// Playwright look for browsers under `node_modules/playwright-core/.local-browsers`
// even when the browsers were installed to the default cache location.

const PORT = Number(process.env.PW_PORT ?? process.env.PORT ?? 3000)
const baseURL = process.env.PW_BASE_URL ?? `http://127.0.0.1:${PORT}`
const serverMode = process.env.PW_SERVER ?? (process.env.CI ? 'prod' : 'dev')
const useWebServer = !process.env.PW_BASE_URL

// Windows (and sometimes OneDrive/AV) can block deletion of prior run artifacts (e.g. `.last-run.json`).
// Avoid deleting by writing each run's artifacts to a fresh folder.
const runId = process.env.PW_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-')
const outputDir = path.join('test-results', runId)
const reportDir = path.join('playwright-report', runId)

const webServerCommand =
  serverMode === 'prod'
    ? `npm run build && npm run start -- -p ${PORT}`
    : `npm run dev -- --port ${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  outputDir,
  reporter: [['list'], ['html', { open: 'never', outputFolder: reportDir }]],

  expect: {
    timeout: 10_000,
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
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
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
      use: {
        ...devices['iPhone 14'],
        browserName: 'webkit',
      },
    },
    {
      name: 'mobile-chromium-pixel',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
      },
    },
  ],

  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
})

