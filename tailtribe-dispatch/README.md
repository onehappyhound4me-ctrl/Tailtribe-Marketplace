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
