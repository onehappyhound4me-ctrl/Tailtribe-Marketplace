import { test, expect } from '@playwright/test'

test.describe('desktop diagnostics gate', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop-only')
  })

  test('unauthenticated debug/health diagnostics return 404 when NODE_ENV=production', async ({
    request,
  }) => {
    test.skip(process.env.NODE_ENV !== 'production', 'Gate only enforced when NODE_ENV=production')

    for (const path of ['/api/debug/build', '/api/debug/env-admin', '/api/health/seo']) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(404)
    }
  })
})
