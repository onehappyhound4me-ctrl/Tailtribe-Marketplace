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
EMAIL_FROM=noreply@tailtribe.be
```

## Local iPhone testing (Google OAuth)

Als je lokaal test op iPhone via je LAN IP (bv. `http://192.168.1.5:3000`), voeg dan ook deze redirect URI toe in Google Cloud:- `http://192.168.1.5:3000/api/auth/callback/google`

En zorg dat je lokale `.env.local` dezelfde host gebruikt voor `NEXT_PUBLIC_APP_URL` en `NEXTAUTH_URL`.
