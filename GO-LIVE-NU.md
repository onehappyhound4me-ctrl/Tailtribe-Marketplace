# 🚀 TailTribe LIVE - Stappenplan

**Status:** Build werkt ✓ | PostgreSQL schema klaar ✓ | Klaar voor deployment!

---

## ⚡ KRITIEKE STAPPEN (volg deze volgorde!)

### STAP 1: PostgreSQL Database Aanmaken (10 min) ⚠️ KRITIEK

**Kies ÉÉN van deze opties:**

#### ✅ Optie A: Supabase (AANBEVOLEN - Gratis tier)
1. Ga naar https://supabase.com
2. Maak account + nieuw project
3. Wacht tot database klaar is
4. Ga naar Settings → Database
5. Scroll naar "Connection string" → "URI"
6. Kopieer de connection string
7. ⚠️ Je hebt TWEE URLs nodig:
   - **DATABASE_URL**: De pooled connection (met `?pgbouncer=true`)
   - **DIRECT_URL**: De direct connection (zonder pgbouncer)

**Voorbeeld:**
```
DATABASE_URL=postgresql://postgres.xxx:xxxxx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:xxxxx@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

#### ✅ Optie B: Vercel Postgres (Eenvoudigst)
1. In Vercel dashboard: Ga naar **Storage** tab
2. Klik **Create** → **Postgres**
3. Selecteer project
4. Vercel configureert automatisch DATABASE_URL en DIRECT_URL

#### ✅ Optie C: Neon (Serverless PostgreSQL)
1. Ga naar https://neon.tech
2. Maak account + project
3. Kopieer connection string
4. Voeg direct URL toe (zelfde als DATABASE_URL)

---

### STAP 2: Vercel Environment Variables (5 min)

Ga naar: **https://vercel.com/[jouw-project]/settings/environment-variables**

**Voeg toe (kopieer deze lijst!):**

```bash
# DATABASE (VERPLICHT!)
DATABASE_URL=postgresql://...  # Uit Supabase/Vercel/Neon
DIRECT_URL=postgresql://...    # Zelfde, maar zonder pgbouncer

# NEXTAUTH (VERPLICHT!)
NEXTAUTH_URL=https://tailtribe.vercel.app  # Of je eigen domain
NEXTAUTH_SECRET=<generated-secret>  # Gebruik commando hieronder

# STRIPE (VERPLICHT voor betalingen!)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# EMAIL (VERPLICHT!)
RESEND_API_KEY=re_...

# APP CONFIG
NEXT_PUBLIC_APP_URL=https://tailtribe.vercel.app
PLATFORM_COMMISSION_PERCENTAGE=20
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
(Bij Windows PowerShell: Download OpenSSL of gebruik: https://8gwifi.org/passgen.jsp)

**⚠️ BELANGRIJK:**
- Selecteer **Production** environment voor alle variabelen
- Controleer dat je **LIVE keys** gebruikt (niet test keys!)
- Copy/paste exact, geen extra spaties

---

### STAP 3: Database Migratie (5 min)

**In Vercel Dashboard:**
1. Ga naar je project
2. Ga naar **Deployments** tab
3. Klik op de laatste deployment → **View Build Logs**
4. Of gebruik Vercel CLI:

```bash
# In lokale terminal:
cd C:\Dev\TailTribe-Final.bak_20251007_233850
vercel login
vercel link  # Link aan bestaand project

# Run migrations:
vercel env pull .env.production  # Download env vars
npx prisma migrate deploy
npx prisma generate
```

**Of in Vercel UI:**
- Ga naar project settings
- **Deployments** → **Redeploy** met environment variables
- Build zal automatisch migrations runnen (zie `package.json` build script)

---

### STAP 4: Deploy Naar Productie (2 min)

**Via Vercel CLI:**
```bash
vercel --prod
```

**Of via GitHub (als gekoppeld):**
```bash
git push origin main
```
Vercel deployed automatisch!

---

### STAP 5: Verify Alles Werkt (10 min)

**Checklist:**
- [ ] Site laadt: https://tailtribe.vercel.app
- [ ] Geen database errors in logs
- [ ] Registratie werkt
- [ ] Login werkt
- [ ] Dashboard laadt
- [ ] Booking flow werkt

**Check logs:**
```bash
vercel logs --prod
```

---

## 🎯 OPTIONELE NEXTE STAPPEN

### Custom Domain Setup
1. In Vercel: Settings → Domains
2. Voeg custom domain toe: `www.tailtribe.be`
3. Volg DNS instructies
4. Update `NEXTAUTH_URL` en `NEXT_PUBLIC_APP_URL`

### Monitoring & Analytics
- **Sentry:** Error tracking (al geconfigureerd ✓)
- **Vercel Analytics:** Auto-enabled
- **Plausible:** Privacy-friendly analytics (optioneel)

### Email Configuration
- **Resend:** Setup domain
- Configureer SPF/DKIM records
- Test email sending

### Stripe Webhook Setup
- Webhook URL: `https://tailtribe.vercel.app/api/stripe/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Kopieer webhook secret naar Vercel env vars

---

## 🆘 TROUBLESHOOTING

**Database connection error?**
- Check DATABASE_URL is correct
- Check DIRECT_URL is correct
- Supabase: Gebruik "Connection pooling" mode

**Build fails?**
- Run lokaal: `npm run build`
- Check logs voor specifieke error
- Verwijder `.next` folder en rebuild

**Migrations fail?**
- Check DATABASE_URL bereikbaar is
- Run `npx prisma migrate deploy` handmatig
- Check database heeft correcte permissions

**NEXTAUTH errors?**
- Check NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matcht je domain
- Regenerate secret als nodig

---

## 📞 CONTACT

**Zit je vast?**
1. Check build logs in Vercel dashboard
2. Check database logs (Supabase dashboard)
3. Check `vercel logs --prod` voor runtime errors
4. Read PRODUCTION_DEPLOY.md voor meer details

---

**🚀 Ready? Start met STAP 1!**

