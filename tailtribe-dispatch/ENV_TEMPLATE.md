# Environment variables (Template)

Gebruik dit als template voor `.env.local` (development) en als referentie voor Vercel “Environment Variables” (production).

## Minimal (werkt)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=replace_me_with_a_long_random_secret
DATABASE_URL=file:./prisma/dev.db

# Optioneel maar handig: always-works admin login (credentials)
ADMIN_LOGIN_EMAIL=admin@test.nl
ADMIN_LOGIN_PASSWORD=change_me
```

## Production (aanbevolen)

```env
NEXT_PUBLIC_APP_URL=https://jouwdomein.be
NEXTAUTH_URL=https://jouwdomein.be
NEXTAUTH_SECRET=replace_me_with_a_long_random_secret

# Postgres (Neon/Supabase/…)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require

# Optioneel maar handig: always-works admin login (credentials)
ADMIN_LOGIN_EMAIL=admin@test.nl
ADMIN_LOGIN_PASSWORD=change_me

# Optioneel: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optioneel: email via Resend
RESEND_API_KEY=

# Optioneel: GA4 first-party fallback (Measurement Protocol proxy)
# Alleen nodig als browsers/extensions `google-analytics.com/g/collect` blokkeren.
# Maak een API secret in GA4: Admin → Gegevensstreams → (Web) → Measurement Protocol API secrets
GA_MEASUREMENT_ID=G-7CN7YKXQB3
GA_API_SECRET=

# Optioneel: Admin emergency password reset (zet dit enkel tijdelijk)
# Gebruik een lange random value. Verwijder nadien of draai opnieuw.
RESET_PASSWORD_ADMIN_KEY=

# Productie: bescherm diagnostics (anders 404).
# Geldt o.a. voor GET /api/auth/health, /api/health/email, /api/health/seo,
# /api/debug/build en /api/debug/env-admin.
# Request header: x-auth-health-token: <zelfde waarde>
# Visibility debug: /debug/visibility?authHealthToken=<zelfde waarde>
AUTH_HEALTH_TOKEN=

# Afzender (belangrijk voor deliverability, vooral Gmail):
# Gebruik een verified domain/sender in Resend (SPF/DKIM).
DISPATCH_EMAIL_FROM=TailTribe <noreply@tailtribe.be>
DISPATCH_EMAIL_REPLY_TO=support@tailtribe.be

# Admin notificaties (aanvragen/aanmeldingen/registraties)
# Default fallback in code is steven@tailtribe.be, maar zet dit expliciet in productie.
DISPATCH_ADMIN_EMAIL=steven@tailtribe.be

# (Optioneel) Admin testmail endpoint
# Gebruik dezelfde RESET_PASSWORD_ADMIN_KEY als Bearer token om een testmail te triggeren via:
# POST /api/admin/test-email
```

## Local iPhone testing (Google OAuth)

Als je lokaal test op iPhone via je LAN IP (bv. `http://192.168.1.5:3000`), voeg dan ook deze redirect URI toe in Google Cloud:- `http://192.168.1.5:3000/api/auth/callback/google`

En zorg dat je lokale `.env.local` dezelfde host gebruikt voor `NEXT_PUBLIC_APP_URL` en `NEXTAUTH_URL`.

## Troubleshooting (productiegedrag)

### Publieke aanvraag (`/boeken`) wordt geweigerd

Komt dit e‑mailadres al voor als **verzorger of admin**, dan kun je niet nog eens als anonieme lead dat adres gebruiken. De gebruiker moet **inloggen** (eigen account) of een ander adres kiezen.

### Google-login lukt niet direct na registreren

Staat het account nog op **“e-mail nog niet geverifieerd”** na registratie met wachtwoord, dan blokkeert TailTribe Google-login voor dat adres tot de verificatielinks is gevolgd. Oplossing: mailbox controleren **of** inloggen met wachtwoord.

### Diagnostics 404 (health / debug API)

In **production** vragen health- en debug-API’s een ingestelde **`AUTH_HEALTH_TOKEN`** en header **`x-auth-health-token`**. Zonder token is **404** bewust (geen informatielek). Voor `/debug/visibility` kun je dezelfde waarde als query **`?authHealthToken=`** meegeven.

Zie ook `DEPLOYMENT_CHECKLIST.md`.
