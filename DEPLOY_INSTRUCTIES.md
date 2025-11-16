# 🚀 DEPLOY INSTRUCTIES - TailTribe voor Groot Publiek

## ⚡ SNELSTART (30 minuten)

### STAP 1: Database Setup (10 min)
**Optie A - Supabase (Aanbevolen):**
1. Ga naar https://supabase.com → Sign up
2. Nieuw project aanmaken
3. Settings → Database → Connection string kopiëren
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Optie B - Vercel Postgres (Eenvoudigst):**
1. In Vercel dashboard: Storage tab
2. Create → Postgres
3. Automatisch verbonden met project

### STAP 2: Environment Variables (5 min)
Ga naar: **Vercel Dashboard → Settings → Environment Variables**

Voeg deze toe:
```
DATABASE_URL=postgresql://... (uit Supabase/Vercel)
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://www.tailtribe.be
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://www.tailtribe.be
PLATFORM_COMMISSION_PERCENTAGE=20
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### STAP 3: Database Migratie (5 min)
In Vercel deployment shell of lokaal met production DATABASE_URL:
```bash
npx prisma migrate deploy
npx prisma generate
```

### STAP 4: Deploy (5 min)
```bash
# Eerste keer
vercel login
vercel --prod

# Of via GitHub: Push naar main branch → Auto-deploy
```

### STAP 5: Verify (5 min)
- [ ] Site laadt: https://www.tailtribe.be
- [ ] Registratie test
- [ ] Login test
- [ ] Booking flow test

---

## ✅ WAT IS KLAAR

- ✅ Core functionaliteit werkend
- ✅ Security (authentication, validation, rate limiting)
- ✅ Debug logs verwijderd uit productie code
- ✅ Error handling in API routes
- ✅ Legal pages (Privacy, Terms)
- ✅ Database schema compleet
- ✅ UI/UX professioneel

---

## ⚠️ KRITIEKE PUNTEN

### 1. Database (MUST DO)
- **NIET** gebruiken: SQLite (development only)
- **WEL** gebruiken: PostgreSQL (Supabase/Neon/Vercel Postgres)

### 2. Environment Variables (MUST DO)
- Alle variabelen moeten in Vercel dashboard staan
- Niet hardcoded in code
- Use production keys (niet test keys!)

### 3. Stripe Webhook (BELANGRIJK)
- Configureer webhook URL in Stripe dashboard
- URL: `https://www.tailtribe.be/api/stripe/webhook`
- Kopieer webhook secret naar Vercel env vars

---

## 🎯 POST-LAUNCH CHECKLIST

Na deployment:
- [ ] Monitor error rates (Vercel logs)
- [ ] Test payment flow end-to-end
- [ ] Verify email sending werkt
- [ ] Check database performance
- [ ] Monitor user registrations
- [ ] Setup uptime monitoring (UptimeRobot - gratis)

---

## 📊 MONITORING (Optioneel maar Aanbevolen)

**Sentry Error Tracking:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Analytics:**
- Google Analytics: Voeg tracking code toe
- Of: Plausible Analytics (privacy-friendly)

---

## 🆘 TROUBLESHOOTING

**Build fails:**
```bash
npx prisma generate
npm run build
```

**Database issues:**
```bash
npx prisma migrate status
npx prisma db pull
```

**Check logs:**
```bash
vercel logs --prod
```

---

**🚀 JE SITE IS NU KLAAR VOOR PRODUCTIE MET GROOT PUBLIEK!**

Alle kritieke items zijn afgehandeld:
- ✅ Code cleanup gedaan
- ✅ Debug logs verwijderd  
- ✅ Error handling correct
- ✅ Deployment guide compleet

**Volgende stap: Database setup + Deploy!**

















