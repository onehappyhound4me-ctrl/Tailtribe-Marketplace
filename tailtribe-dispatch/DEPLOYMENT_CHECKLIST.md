# Deployment checklist (TailTribe dispatch)

Short list after deploying `main` to Vercel (or another host).

## Required environment variables (production)

- `DATABASE_URL` — hosted PostgreSQL (not SQLite).
- `NEXTAUTH_SECRET` (or `AUTH_SECRET`)
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` — **`https://tailtribe.be`** (no trailing slash). **Set both explicitly in Vercel Production** so reset/booking emails never use `*.vercel.app`. (If unset on production, code falls back to `https://tailtribe.be`.)
- Email: `RESEND_API_KEY` and/or SMTP, plus `DISPATCH_EMAIL_FROM`, `DISPATCH_ADMIN_EMAIL`.

See `ENV_TEMPLATE.md` for the full template.

## Recommended security / diagnostics

- **`AUTH_HEALTH_TOKEN`** — long random secret. Needed to call **in production**:
  - `GET /api/auth/health`, `/api/health/email`, `/api/health/seo`
  - `GET /api/debug/build`, `/api/debug/env-admin`  
  Send header: `x-auth-health-token: <same value>`.  
  For `/debug/visibility`, use query `?authHealthToken=<same value>`.

## Post-deploy smoke tests (manual)

1. **Home** — `GET /` loads; no obvious console errors.
2. **Public booking** — `/boeken` → step 1 visible; submit with empty honeypot still validates (no crash).
3. **Login** — credentials login and (if configured) Google OAuth.
4. **Owner flow** — new booking request from dashboard (if you have a test owner).
5. **Admin assignment** — assign a caregiver once; verify no duplicate-slot error when expected.

## Support notes (recent product behaviour)

- **Public `/boeken` with existing caregiver/admin email**  
  Users must **log in** with that account (as owner workflows go through `/dashboard`). They cannot downgrade staff roles via the public form anymore.

- **Google login after registering with password**  
  Google sign-in is **blocked** until the email verification link has been completed (prevents takeover of half-registered accounts). Users should verify email first or log in with password.

## Automated checks locally

```bash
npm run typecheck
npm run test:unit
npm run test:e2e   # Playwright (starts dev server unless PW_BASE_URL is set)
```

**Tip:** `test:e2e` draait standaard meerdere browser-projecten. Alleen desktop Chromium + één API-test:

```bash
npx playwright test e2e/desktop-booking-api.spec.ts --project=desktop-chromium
```

## Rollback

In Vercel: redeploy previous production deployment from the Deployments tab if a release misbehaves.
