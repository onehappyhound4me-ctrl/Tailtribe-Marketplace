# 🚨 QUICK FIX: Voeg Environment Variables toe aan Vercel

## ⚠️ PROBLEEM:
De domains staan erin, maar de environment variables ontbreken. Zonder deze werkt login NIET!

## ✅ OPLOSSING: Voeg deze variables toe

### Stap 1: Ga naar Vercel
1. Log in op https://vercel.com
2. Selecteer je TailTribe project
3. Ga naar **Settings** → **Environment Variables**

### Stap 2: Voeg NEXTAUTH_SECRET toe

1. Klik op **"Add New"**
2. **Key:** `NEXTAUTH_SECRET`
3. **Value:** Gebruik deze gegenereerde secret:
   ```
   [GENERATED_SECRET_WILL_BE_HERE]
   ```
   OF genereer zelf een nieuwe:
   - Ga naar: https://generate-secret.vercel.app/32
   - Kopieer de gegenereerde secret
4. **Environment:** Selecteer:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Klik **"Save"**

### Stap 3: Voeg DATABASE_URL toe

1. Klik op **"Add New"**
2. **Key:** `DATABASE_URL`
3. **Value:** Je Prisma database connection string
   - Voorbeeld: `postgresql://user:password@host:5432/database`
   - Check je Prisma configuratie of `.env` bestand voor de juiste waarde
4. **Environment:** Selecteer:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Klik **"Save"**

### Stap 4: (Optioneel) Voeg NEXTAUTH_URL toe

**BELANGRIJK:** Dit kan leeg blijven, maar als je het instelt:

1. Klik op **"Add New"**
2. **Key:** `NEXTAUTH_URL`
3. **Value:** `https://www.tailtribe.be` (of leeg laten)
   - **Let op:** Als je beide domains hebt, gebruik dan de primary domain
   - NextAuth detecteert automatisch het juiste domain
4. **Environment:** Selecteer:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Klik **"Save"**

### Stap 5: (Als je Google OAuth gebruikt) Voeg Google variables toe

1. **GOOGLE_CLIENT_ID:**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Je Google OAuth Client ID (begint met `...googleusercontent.com`)
   - Environment: Production, Preview, Development

2. **GOOGLE_CLIENT_SECRET:**
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: Je Google OAuth Client Secret
   - Environment: Production, Preview, Development

### Stap 6: (Als je Stripe gebruikt) Voeg Stripe variables toe

1. **STRIPE_SECRET_KEY:**
   - Key: `STRIPE_SECRET_KEY`
   - Value: Je Stripe Secret Key (begint met `sk_test_` of `sk_live_`)
   - Environment: Production, Preview, Development

2. **STRIPE_PUBLISHABLE_KEY:**
   - Key: `STRIPE_PUBLISHABLE_KEY`
   - Value: Je Stripe Publishable Key (begint met `pk_test_` of `pk_live_`)
   - Environment: Production, Preview, Development

3. **STRIPE_WEBHOOK_SECRET:**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: Je Stripe Webhook Secret (begint met `whsec_`)
   - Environment: Production, Preview, Development

### Stap 7: REDEPLOY (BELANGRIJK!)

Na het toevoegen van variables:
1. Ga naar **Deployments**
2. Klik op de laatste deployment
3. Klik op **"Redeploy"**
4. Selecteer **"Use existing Build Cache"** (optioneel)
5. Klik **"Redeploy"**
6. Wacht tot deployment klaar is (2-5 minuten)

## 📋 Checklist:

### Verplicht:
- [ ] `NEXTAUTH_SECRET` is toegevoegd
- [ ] `DATABASE_URL` is toegevoegd
- [ ] Redeploy is gedaan

### Optioneel maar aanbevolen:
- [ ] `NEXTAUTH_URL` is toegevoegd (of leeg gelaten)
- [ ] `GOOGLE_CLIENT_ID` is toegevoegd (als gebruikt)
- [ ] `GOOGLE_CLIENT_SECRET` is toegevoegd (als gebruikt)
- [ ] Stripe variables zijn toegevoegd (als gebruikt)

## 🔍 Waar vind je de waarden?

### NEXTAUTH_SECRET:
- Gebruik de gegenereerde secret hierboven
- OF: Genereer via https://generate-secret.vercel.app/32

### DATABASE_URL:
- Check je `.env` bestand lokaal
- Check je Prisma configuratie
- Check je database provider (Vercel Postgres, Supabase, etc.)

### Google OAuth:
- Ga naar: https://console.cloud.google.com
- Selecteer je project → APIs & Services → Credentials
- Kopieer Client ID en Client Secret

### Stripe:
- Ga naar: https://dashboard.stripe.com
- Developers → API keys
- Kopieer Publishable key en Secret key

## ⚠️ BELANGRIJK:

1. **NEXTAUTH_SECRET moet minimaal 32 karakters zijn**
2. **Redeploy NA het toevoegen van variables** - anders werken ze niet
3. **Gebruik dezelfde NEXTAUTH_SECRET voor beide domains** (als je één project gebruikt)
4. **Check dat alle variables zijn ingesteld voor Production environment**

## 🧪 Test na deployment:

1. Wacht tot deployment klaar is
2. Hard refresh: `Ctrl + Shift + R`
3. Test login op `tailtribe.be`
4. Test login op `tailtribe.nl`
5. Check browser console voor errors (F12)

---

**Als je klaar bent met het toevoegen van variables, laat het weten en we testen of login werkt!**

