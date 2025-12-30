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

Dan open: `http://localhost:3002`

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

```bash
# Verbind met Vercel
vercel

# Deploy production
vercel --prod
```

Dan koppel `tailtribe.be` domein in Vercel dashboard.

## 📝 Notities

- Geen auth nodig (jij bent enige admin)
- Geen complex SaaS spul
- Focus op simpelheid & snelheid
- Makkelijk uit te breiden later

---

**Made with 🐾 by TailTribe**
