# 🔧 Deployment Troubleshooting Guide

**Probleem:** Failed production deployments op Vercel

---

## ✅ **STAP 1: Verifieer Build Lokaal**

```bash
npm run build
```

**Verwacht:** Build moet slagen zonder errors

**Als build faalt:** Fix de errors eerst lokaal voordat je pusht.

---

## ✅ **STAP 2: Check Vercel Deployment Logs**

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project (TailTribe)
3. Ga naar **Deployments** tab
4. Klik op de **meest recente failed deployment**
5. Bekijk de **Build Logs**

**Te zoeken:**
- TypeScript errors
- Missing dependencies
- Environment variable errors
- Database connection errors

---

## ✅ **STAP 3: Verifieer Environment Variables**

Check dat alle environment variables zijn ingesteld in Vercel:

### Verplichte Variables:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `DIRECT_URL` - Direct database URL (voor migrations)
- [ ] `NEXTAUTH_URL` - `https://tailtribe.be`
- [ ] `NEXTAUTH_SECRET` - Random secret string
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (test of live)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `RESEND_API_KEY` - Resend email API key
- [ ] `NEXT_PUBLIC_APP_URL` - `https://tailtribe.be`
- [ ] `SENTRY_DSN` - Sentry DSN (optioneel)

**Hoe te checken:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Verifieer dat alle variables zijn ingesteld voor **Production**
3. Check dat er geen typos zijn

---

## ✅ **STAP 4: Check Build Command**

**Verwacht build command:**
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Te checken:**
- [ ] `vercel.json` heeft correcte build command
- [ ] `package.json` heeft `build` script
- [ ] Build command werkt lokaal

---

## ✅ **STAP 5: Check Runtime Errors**

Soms faalt de build niet, maar zijn er runtime errors:

1. Ga naar Vercel Dashboard → Deployments
2. Klik op **failed deployment**
3. Check **Function Logs** (niet Build Logs)
4. Zoek naar runtime errors

**Veelvoorkomende runtime errors:**
- Database connection failures
- Missing environment variables
- Stripe API errors
- Email sending errors

---

## ✅ **STAP 6: Force New Deployment**

Soms helpt het om een nieuwe deployment te triggeren:

```bash
# Maak een lege commit
git commit --allow-empty -m "Trigger deployment"
git push
```

Of via Vercel Dashboard:
1. Ga naar Deployments
2. Klik op **Redeploy** op de laatste succesvolle deployment

---

## ✅ **STAP 7: Check Database Connection**

**Test database connectie:**
```bash
# Lokaal testen
npm run test:flows
```

**Als database connectie faalt:**
- [ ] Check `DATABASE_URL` in Vercel
- [ ] Verifieer dat database server bereikbaar is
- [ ] Check firewall settings (Neon database)
- [ ] Verifieer dat IP whitelist correct is

---

## ✅ **STAP 8: Check TypeScript Errors**

Soms zijn er TypeScript errors die alleen op Vercel optreden:

```bash
# Check TypeScript strict mode
npx tsc --noEmit
```

**Als TypeScript errors:**
- [ ] Fix alle type errors
- [ ] Check `tsconfig.json` settings
- [ ] Verifieer dat alle imports correct zijn

---

## ✅ **STAP 9: Check Dependencies**

**Verifieer dat alle dependencies zijn geïnstalleerd:**
```bash
npm install
npm run build
```

**Als dependency errors:**
- [ ] Check `package.json` voor missing dependencies
- [ ] Verifieer dat `package-lock.json` is gecommit
- [ ] Check voor peer dependency warnings

---

## ✅ **STAP 10: Check Vercel Build Settings**

In Vercel Dashboard → Settings → General:

- [ ] **Framework Preset:** Next.js
- [ ] **Build Command:** `npm run build` (of leeg voor auto-detect)
- [ ] **Output Directory:** `.next` (of leeg voor auto-detect)
- [ ] **Install Command:** `npm install` (of leeg voor auto-detect)
- [ ] **Node Version:** 18.x of 20.x

---

## 🔍 **COMMON ERRORS & FIXES**

### Error: "Module not found"
**Fix:** Check dat alle imports correct zijn en dependencies zijn geïnstalleerd

### Error: "Environment variable not found"
**Fix:** Voeg missing environment variable toe in Vercel

### Error: "Database connection failed"
**Fix:** Verifieer `DATABASE_URL` en database server status

### Error: "Build timeout"
**Fix:** Build kan te lang duren, check voor infinite loops of zware operaties

### Error: "Type error"
**Fix:** Fix TypeScript errors lokaal eerst

---

## 📧 **EMAIL NOTIFICATIES UITZETTEN**

Als je tijdelijk geen deployment emails wilt:

1. Ga naar Vercel Dashboard → Settings → Notifications
2. Zet **Deployment Notifications** uit
3. Of filter emails in Gmail

**Maar:** Het is beter om de errors te fixen dan emails uit te zetten!

---

## 🚀 **QUICK FIX CHECKLIST**

Als deployment faalt, check dit snel:

- [ ] `npm run build` werkt lokaal? → **JA** = Push naar GitHub
- [ ] Alle environment variables ingesteld? → **JA** = Check Vercel dashboard
- [ ] Database bereikbaar? → **JA** = Check connection string
- [ ] Geen TypeScript errors? → **JA** = Run `npx tsc --noEmit`
- [ ] Dependencies correct? → **JA** = Run `npm install`

---

## 📞 **NEXT STEPS**

Als niets werkt:

1. **Deel de exacte error message** uit Vercel deployment logs
2. **Check de Build Logs** in Vercel dashboard
3. **Check de Function Logs** voor runtime errors
4. **Test lokaal** met `npm run build`

---

**Laatste update:** 2025-01-13


