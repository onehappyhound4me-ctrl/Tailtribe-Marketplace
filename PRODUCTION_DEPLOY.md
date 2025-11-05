# 🚀 TailTribe - Production Deployment Guide

## ⚡ SNELSTART (Voor Groot Publiek)

### 1. Database Setup (VERPLICHT - 15 min)
```bash
# Optie A: Supabase (Aanbevolen - Gratis tier)
1. Ga naar: https://supabase.com
2. Maak account + project
3. Kopieer PostgreSQL connection string
4. Voeg toe aan Vercel env vars: DATABASE_URL

# Optie B: Neon (Alternatief)
1. Ga naar: https://neon.tech
2. Maak account + database
3. Kopieer connection string

# Optie C: Vercel Postgres (Eenvoudigst)
1. In Vercel dashboard: Storage tab
2. Maak nieuwe Postgres database
3. Automatisch gekoppeld aan project
```

### 2. Environment Variables in Vercel (5 min)
Ga naar: `https://vercel.com/[your-project]/settings/environment-variables`

**VERPLICHT:**
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate-met-openssl-rand-base64-32>
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

### 3. Database Migration (5 min)
```bash
# In Vercel dashboard: Run in deployment shell
npx prisma migrate deploy
npx prisma generate
```

### 4. Deploy (2 min)
```bash
vercel --prod
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Voor je deployt, check:

- [ ] **Build succeeds:** `npm run build` (lokaal)
- [ ] **Database:** PostgreSQL connection string klaar
- [ ] **Env vars:** Alle variabelen in Vercel dashboard
- [ ] **Domain:** Gekoppeld aan Vercel project
- [ ] **Stripe:** Live keys (niet test keys!)
- [ ] **Email:** Resend API key actief
- [ ] **Legal:** Privacy Policy & Terms pages bestaan ✓

---

## 🔧 POST-DEPLOYMENT

### Direct na deployment:
1. **Test registratie** - Maak test account
2. **Test booking flow** - Voer volledige booking uit
3. **Check logs** - `vercel logs --prod`
4. **Test payments** - Verifieer Stripe webhook werkt

### Monitoring Setup (Optioneel maar Aanbevolen):

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
# Volg wizard instructies
```

**Analytics:**
- Google Analytics: Voeg tracking code toe
- Of: Plausible Analytics (privacy-friendly)

**Uptime Monitoring:**
- UptimeRobot.com (gratis) - Check elke 5 minuten
- Better Uptime - Als je meer features wilt

---

## 🚨 KRITIEKE INSTELLINGEN

### Rate Limiting
- ✅ Al geïmplementeerd in middleware
- Check: `src/middleware.ts`

### Security Headers
- ✅ Vercel handelt automatisch HTTPS
- ✅ CORS correct geconfigureerd

### Error Handling
- ✅ Try-catch in alle API routes
- ✅ User-friendly Nederlandse error messages
- ✅ Geen stack traces naar frontend

---

## 📊 PERFORMANCE OPTIMIZATIONS

### Al geïmplementeerd:
- ✅ Next.js Image optimization
- ✅ Lazy loading waar mogelijk
- ✅ API route caching strategieën

### Voor grote scale (later):
- Redis caching (optioneel)
- CDN voor static assets (Vercel doet dit automatisch)
- Database connection pooling (PostgreSQL providers doen dit)

---

## 🔍 TROUBLESHOOTING

### Build fails:
```bash
# Regenerate Prisma client
npx prisma generate
npm run build
```

### Database connection issues:
```bash
# Test connection
npx prisma db pull

# Check migrations
npx prisma migrate status
```

### Environment variables:
```bash
# Pull from Vercel
vercel env pull .env.local
```

---

## ✅ FINAL VERIFICATION

Voor GO-LIVE met groot publiek:

- [ ] Site laadt: https://www.tailtribe.be
- [ ] Registratie werkt
- [ ] Login werkt (alle rollen)
- [ ] Search functionaliteit werkt
- [ ] Booking creation werkt
- [ ] Payment processing werkt (Stripe)
- [ ] Email notificaties werken
- [ ] Database queries performant (< 500ms)
- [ ] Geen console errors in browser
- [ ] Mobile responsive werkt
- [ ] Legal pages beschikbaar

**Als alles ✅ → JE BENT KLAAR! 🎉**

---

## 📞 SUPPORT

**Production Issues:**
- Monitor: `vercel logs --prod`
- Database: Check Supabase/Neon dashboard
- Payments: Check Stripe dashboard

**Next Steps:**
1. Launch announcement
2. Marketing campaign
3. User onboarding emails
4. Monitor eerste week intensief
5. Iterate op feedback

---

**🚀 SUCCES MET JE LAUNCH!**













