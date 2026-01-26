import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PW_PORT ?? process.env.PORT ?? 3000)
const baseURL = process.env.PW_BASE_URL ?? `http://127.0.0.1:${PORT}`
const serverMode = process.env.PW_SERVER ?? (process.env.CI ? 'prod' : 'dev')

const webServerCommand =
  serverMode === 'prod'
    ? `npm run build && npm run start -- -p ${PORT}`
    : `npm run dev -- --port ${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

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

  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: [
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

