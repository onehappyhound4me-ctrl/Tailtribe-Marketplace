# ⚡ QUICK LAUNCH CHECKLIST - TailTribe

**Doel:** Site klaar voor publieke aankondiging  
**Status:** ✅ **BIJNA KLAAR!** - Meeste kritieke items zijn al gedaan

---

## ✅ AL GEDAAN (VERIFICEREN)

### 1. Database Setup ✅
- [x] **PostgreSQL database** - Schema is PostgreSQL ready
- [x] **Connection strings** - DATABASE_URL en DIRECT_URL zijn geconfigureerd in Vercel

### 2. Vercel Environment Variables ✅
- [x] `DATABASE_URL` - ✅ Geconfigureerd (Production)
- [x] `DIRECT_URL` - ✅ Geconfigureerd (Production)
- [x] `NEXTAUTH_SECRET` - ✅ Geconfigureerd (Production)
- [x] `NEXTAUTH_URL` - ✅ Geconfigureerd (Production)
- [x] `STRIPE_SECRET_KEY` - ✅ Geconfigureerd (Production)
- [x] `STRIPE_PUBLISHABLE_KEY` - ✅ Geconfigureerd (Production)
- [x] `STRIPE_WEBHOOK_SECRET` - ✅ Geconfigureerd (Production)
- [x] `RESEND_API_KEY` - ✅ Geconfigureerd (Production)
- [x] `GOOGLE_CLIENT_ID` - ✅ Geconfigureerd
- [x] `CLOUDINARY_*` - ✅ Geconfigureerd

### 3. Database Migratie ✅/⚠️
- [x] Schema is PostgreSQL ready
- [x] **VERIFICATIE:** Database werkt correct (getest via health endpoint)
- [x] **VERIFICATIE:** Database connection healthy (response time: ~1076ms)
- ⚠️ **AANDACHTSPUNT:** Migration lock file mismatch (sqlite vs postgresql)
  - **Impact:** Laag - Database werkt al
  - **Fix:** Gebruik `npx prisma db push` of fix `migration_lock.toml`

### 4. Deploy & Test ✅
- [x] **Site is deployed** - ✅ Production deployment actief (16h geleden)
- [x] **Custom domains** - ✅ tailtribe.be en tailtribe.nl geconfigureerd
- [x] **Build werkt** - ✅ `npm run build` succeeds
- [ ] **TEST KRITIEKE FLOWS:** (doe dit nu!)
  - [ ] Site laadt: https://tailtribe.be
  - [ ] Registratie werkt
  - [ ] Login werkt
  - [ ] Dashboard laadt
  - [ ] Booking flow werkt (minimaal 1 test)

### 5. Legal Pages ✅
- [x] **Privacy Policy** - ✅ Bestaat op `/privacy`
- [x] **Terms of Service** - ✅ Bestaat op `/terms`
- [x] **Links in footer** - ✅ Aanwezig

---

## ⚠️ BELANGRIJK (DOE NU - 30 MIN)

### 6. Monitoring Setup ✅/⚠️
- [x] **Health endpoint** - ✅ Werkt (https://tailtribe.be/api/health)
- [x] **Database monitoring** - ✅ Healthy (getest via health endpoint)
- [x] **Vercel Analytics** - ✅ Automatisch actief
- ⚠️ **Sentry error tracking** - ⚠️ Configuratie bestaat, maar DSN niet verifieerbaar
  - **Actie:** Check Vercel dashboard → Environment Variables → `SENTRY_DSN`
- ⚠️ **Vercel logs** - ⚠️ Check handmatig via Vercel dashboard (Deployments → Latest → Logs)

### 7. Support Email ⚠️
- [ ] Email adres aanmaken: `support@tailtribe.be` (of jouw domein)
- [ ] Gmail alias instellen of forwarding
- [x] Contact pagina - ✅ Bestaat op `/contact`

### 8. Domain Setup ✅
- [x] Custom domain - ✅ tailtribe.be en tailtribe.nl geconfigureerd
- [x] SSL certificaat - ✅ Automatisch door Vercel
- [x] DNS records - ✅ Geconfigureerd

---

## ✅ NICE TO HAVE (KAN LATER)

- [ ] Email notificaties (Resend setup)
- [ ] Stripe betalingen (als je nog niet live bent)
- [ ] Beta banner op homepage
- [ ] SEO meta tags
- [ ] Google Analytics / Plausible
- [ ] Social media preview images

---

## 🎯 MINIMUM VIABLE LAUNCH

**Als je NU moet lanceren, doe minimaal:**
1. ✅ Database setup (PostgreSQL)
2. ✅ Environment variables in Vercel
3. ✅ Deploy & test kritieke flows
4. ✅ Legal pages (Privacy + Terms)

**Rest kan binnen 24-48 uur.**

---

## 🚀 LAUNCH COMMAND

```bash
# 1. Check build werkt lokaal
npm run build

# 2. Deploy naar productie
vercel --prod

# 3. Check logs
vercel logs --prod
```

---

## 🆘 QUICK FIXES

**Build fails?**
```bash
npx prisma generate
npm run build
```

**Database connection error?**
- Check `DATABASE_URL` correct is
- Check database bereikbaar is (ping test)
- Supabase: Gebruik "Connection pooling" mode

**NEXTAUTH errors?**
- Check `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matcht je domain exact

---

## ✅ FINAL CHECK - KRITIEKE FLOWS TESTEN (DOE DIT NU!)

**⚠️ BELANGRIJK:** Zie `HANDMATIGE_TEST_CHECKLIST.md` voor volledige details. Hier de belangrijkste:

### 🚨 KRITIEK - Test Deze Eerst (30 min):

1. **Google Login Flow** (~15 min)
   - [ ] Nieuwe gebruiker zonder account → foutmelding + redirect naar register
   - [ ] Bestaande gebruiker → account linking werkt
   - [ ] Bestaande Google gebruiker → direct login werkt

2. **Booking Flow** (~20 min)
   - [ ] Zoek verzorger via `/search`
   - [ ] Maak boeking (datum, service, pet info)
   - [ ] Betaal met Stripe test card (`4242 4242 4242 4242`)
   - [ ] Verzorger ontvangt aanvraag (andere browser/incognito)
   - [ ] Accept/decline werkt
   - [ ] Email notificaties worden verstuurd

3. **Messaging Flow** (~10 min)
   - [ ] Start conversatie vanuit booking
   - [ ] Unread count werkt correct
   - [ ] Berichten worden opgeslagen

4. **Review Flow** (~10 min)
   - [ ] Schrijf review na completed booking
   - [ ] Average rating update werkt
   - [ ] Review verschijnt op profiel

5. **UI/UX Checks** (~15 min)
   - [ ] Cookie consent werkt (incognito mode)
   - [ ] Responsive design (mobile test)
   - [ ] Loading states werken
   - [ ] Error handling werkt (404 pagina)

6. **Payment & Webhook** (~15 min)
   - [ ] Stripe payment werkt
   - [ ] Webhook wordt ontvangen (check Stripe dashboard)
   - [ ] Booking status update naar "PAID"

7. **Test User Filtering** (~5 min)
   - [ ] Geen testpersonen zichtbaar in search
   - [ ] Geen test@example.com accounts
   - [ ] Geen "test", "demo", "fake" namen

8. **Monitoring** (~15 min)
   - [ ] Sentry error tracking werkt (check Sentry dashboard)
   - [ ] Vercel Analytics werkt
   - [ ] Check logs: `vercel logs` (geen kritieke errors)

9. **Security** (~10 min)
   - [ ] Authentication required voor `/dashboard`
   - [ ] Authorization werkt (Owner vs Caregiver routes)
   - [ ] Rate limiting werkt

**📋 Volledige checklist:** Zie `HANDMATIGE_TEST_CHECKLIST.md` voor alle details!

**Als alles ✅ → JE BENT KLAAR! 🚀**

---

## 📊 STATUS SAMENVATTING

**✅ AL GEDAAN (90%):**
- Database setup ✅
- Environment variables ✅
- Deploy ✅
- Custom domains ✅
- Legal pages ✅
- Build werkt ✅

**⚠️ NOG TE DOEN (10%):**
- Test kritieke flows (30 min)
- Verifieer database migrations (5 min)
- Check logs voor errors (5 min)
- Support email setup (10 min)

**Totaal tijd:** ~30-50 minuten (testen + verificatie)


