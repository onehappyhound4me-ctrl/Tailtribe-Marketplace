# TailTribe Dispatch

Simpele dispatch site voor dierenverzorging - zonder SaaS complexiteit.

## ✨ Wat zit erin

- **Homepage** (`/`) - Moderne landingspagina met services
- **Booking Formulier** (`/boeken`) - 4-staps booking flow
- **Bedankt Pagina** (`/bedankt`) - Bevestiging na booking
- **Admin Dashboard** (`/admin`) - Bekijk en dispatch bookings

## 🚀 Lokaal Draaien

```bash
npm run dev
```

Dan open: `http://localhost:3001`

## ✅ Mobile validatie in 2 minuten (zonder handmatig iPhone testen)

Deze repo heeft **Playwright mobile regression tests** (Chromium Android + WebKit iPhone) met screenshots.

1) Eenmalig browsers installeren:

```bash
npx playwright install
```

Windows tip (aanbevolen): Playwright browsers in project-cache (stabieler op OneDrive/AV):

```bat
set PLAYWRIGHT_BROWSERS_PATH=0&& npx playwright install
```

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="0"; npx playwright install
```

2) Run mobile tests (snel, dev server):

```bash
npm run test:e2e
```

3) Run “production parity” (build + start, meest betrouwbaar):

```bash
PW_SERVER=prod npm run test:e2e
```

PowerShell:

```powershell
$env:PW_SERVER="prod"; npm run test:e2e
```

4) Run tegen live site (snelle sanity check zonder lokale server):

```bash
PW_BASE_URL=https://www.tailtribe.be npm run test:e2e
```

Let op: bij `PW_BASE_URL` worden **screenshot diffs automatisch overgeslagen** (live en lokaal verschillen altijd).

Wat dit afdekt:
- Home laadt zonder console/page errors
- Hamburger menu open/close/navigatie
- Key pages: Diensten / Over ons / Contact / Login / Boeken→Login
- Geen horizontale overflow op mobile
- Images zijn aanwezig (minimaal 1 zichtbaar waar verwacht)
- Screenshot diffs per page/project

Rapport:

```bash
npm run test:e2e:report
```

## 📋 Features

✅ **TailTribe design** - Zelfde kleuren, fonts, stijl
✅ **Simpel booking formulier** - Geen complexiteit
✅ **Admin dashboard** - Bekijk alle bookings
✅ **Geen betalingen** - Offline afhandelen
✅ **Geen messaging** - Direct contact
✅ **Geen reviews** - Focus op dispatch

## 🔧 Hoe het werkt

1. Klant boekt via `/boeken`
2. Booking wordt opgeslagen
3. Jij ziet het in `/admin`
4. Jij dispatcht handmatig naar freelancer
5. Klant wordt gebeld/gemaild voor bevestiging

## 🎯 Volgende Stappen

### Nu:
- Bookings worden opgeslagen in memory (verdwijnen bij restart)
- Geen email notificaties

### Later Toevoegen:
1. **Database** (PostgreSQL/Supabase)
   - Bookings permanent opslaan
   - Freelancer lijst

2. **Email Notificaties**
   - Naar jou bij nieuwe booking
   - Naar klant bij bevestiging

3. **Freelancer Management**
   - Lijst van freelancers
   - Assign button werkt echt

4. **WhatsApp/SMS**
   - Direct contact met klanten

## 🚀 Deploy naar Vercel

Belangrijk: **SQLite is niet geschikt op Vercel** (filesystem is read-only / niet persistent).  
Voor een werkende live site heb je **een hosted database** nodig (PostgreSQL).

Zie `ENV_TEMPLATE.md` voor alle benodigde environment variables.

### Snelle Vercel deploy (aanbevolen)

1) Maak een Postgres DB (bv. Neon/Supabase) en kopieer je **DATABASE_URL**.  
2) In Vercel → Project → Settings → Environment Variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (bv. `https://tailtribe.be`)
   - `NEXT_PUBLIC_APP_URL` (zelfde als je domein)
   - (optioneel) `RESEND_API_KEY`, `EMAIL_FROM`

3) Deploy:

```bash
vercel
vercel --prod
```

De build gebruikt automatisch de Postgres Prisma schema via `vercel.json`.

## 📝 Notities

- Geen auth nodig (jij bent enige admin)
- Geen complex SaaS spul
- Focus op simpelheid & snelheid
- Makkelijk uit te breiden later

### Google reviews link (iPhone fix)

Op iPhone Safari kan Google Maps/Reviews soms een witte pagina tonen (vooral bij Google account sessies).
Daarom routeert de homepage link “Bekijk alle Google reviews” altijd via `"/google-reviews"`, waar de gebruiker
een paar betrouwbare opties krijgt (Google Maps app / Chrome / browser).

---

**Made with 🐾 by TailTribe**
