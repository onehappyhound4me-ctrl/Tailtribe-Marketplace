# ✅ Check: Welke Environment Variables heb je al?

## ✅ NEXTAUTH_SECRET: AANWEZIG
```
7418b7f2cfc20209d2183ce030ee59d7c9682e0c329344cae4b42603ea5033a4
```
- ✅ Lengte: 64 karakters (goed, minimaal 32 nodig)
- ✅ Format: Hex string (goed)
- ✅ Status: **DEZE IS GOED!**

## ❓ Check nu deze:

### 1. DATABASE_URL
**Vraag:** Staat deze erin?
- [ ] JA - Wat is de waarde? (eerste paar karakters: `postgresql://...` of `mysql://...`)
- [ ] NEE - Deze moet je toevoegen!

**Waar vind je DATABASE_URL?**
- Check je lokale `.env` bestand
- Check Vercel → Storage → Postgres (als je Vercel Postgres gebruikt)
- Check je database provider dashboard

### 2. NEXTAUTH_URL (Optioneel)
**Vraag:** Staat deze erin?
- [ ] JA - Wat is de waarde?
- [ ] NEE - Kan leeg blijven (optioneel)

**Als je het instelt:**
- Gebruik: `https://www.tailtribe.be`
- OF: Laat leeg (NextAuth detecteert automatisch)

### 3. Andere variables (Als gebruikt)
- [ ] `GOOGLE_CLIENT_ID` - Als je Google OAuth gebruikt
- [ ] `GOOGLE_CLIENT_SECRET` - Als je Google OAuth gebruikt
- [ ] `STRIPE_SECRET_KEY` - Als je Stripe gebruikt
- [ ] `STRIPE_PUBLISHABLE_KEY` - Als je Stripe gebruikt

## 🔍 Wat te checken in Vercel:

### Stap 1: Ga naar Environment Variables
Vercel → je project → Settings → Environment Variables

### Stap 2: Noteer wat er staat:

**Verplicht (moet er zijn):**
- [ ] `NEXTAUTH_SECRET` = `7418b7f2cfc20209d2183ce030ee59d7c9682e0c329344cae4b42603ea5033a4` ✅
- [ ] `DATABASE_URL` = `???` ❓

**Optioneel:**
- [ ] `NEXTAUTH_URL` = `???` ❓

### Stap 3: Check Environment
Voor elke variable, check of deze is ingesteld voor:
- [ ] Production
- [ ] Preview
- [ ] Development

## 🚨 Als DATABASE_URL ontbreekt:

**Dit is waarschijnlijk het probleem!**

### Stap 1: Vind je DATABASE_URL

**Optie A: Vercel Postgres**
1. Ga naar Vercel → je project → Storage
2. Klik op je Postgres database
3. Ga naar ".env.local" tab
4. Kopieer `DATABASE_URL`

**Optie B: Lokale .env file**
1. Open je lokale `.env` bestand
2. Zoek naar `DATABASE_URL`
3. Kopieer de waarde

**Optie C: Andere database provider**
- Check je database provider dashboard
- Zoek naar "Connection String" of "DATABASE_URL"

### Stap 2: Voeg toe aan Vercel
1. Vercel → je project → Settings → Environment Variables
2. Klik "Add New"
3. Key: `DATABASE_URL`
4. Value: [jouw database connection string]
5. Environment: Production, Preview, Development
6. Save

### Stap 3: REDEPLOY
1. Ga naar Deployments
2. Klik op laatste deployment → Redeploy
3. Wacht tot klaar

## 🧪 Test na toevoegen DATABASE_URL:

1. Wacht tot deployment klaar is
2. Hard refresh: `Ctrl + Shift + R`
3. Test login op `tailtribe.be`
4. Test login op `tailtribe.nl`
5. Check browser console (F12) voor errors

## 📋 Samenvatting:

**Wat je al hebt:**
- ✅ `NEXTAUTH_SECRET` - GOED!

**Wat je waarschijnlijk nog nodig hebt:**
- ❓ `DATABASE_URL` - Check of deze erin staat!

**Wat optioneel is:**
- ❓ `NEXTAUTH_URL` - Kan leeg blijven

---

**Laat weten:**
1. Staat `DATABASE_URL` erin? (JA/NEE)
2. Zo ja, wat is de waarde? (eerste deel: `postgresql://...` of `mysql://...`)
3. Zo nee, waar staat je database? (Vercel Postgres, Supabase, andere?)

