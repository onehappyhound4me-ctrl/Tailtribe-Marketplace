# 🔐 Vercel Environment Variables Setup

**Project:** tailtribe  
**URL:** https://vercel.com/stevens-projects-6df24ffb/tailtribe/settings/environment-variables

---

## ⚡ SNELSTART: Kopieer deze exact naar Vercel

Ga naar: **Settings → Environment Variables** in Vercel Dashboard

### ✅ KRITIEK (MOET je hebben):

```bash
# Database - POSTGRESQL VERPLICHT!
DATABASE_URL=postgresql://...  # Van Supabase/Vercel Postgres/Neon
DIRECT_URL=postgresql://...    # Direct connection (geen pgbouncer)

# NextAuth - AUTENTICATIE
NEXTAUTH_SECRET=+16uDxsARkTb0N9qX6YmBVS1KoMW/hDOWC1UelByKAQ=
NEXTAUTH_URL=https://tailtribe.vercel.app

# App Configuratie
NEXT_PUBLIC_APP_URL=https://tailtribe.vercel.app
PLATFORM_COMMISSION_PERCENTAGE=20
```

### ⚠️ BELANGRIJK (voor later, maar platform werkt zonder):

```bash
# Stripe - BETALINGEN (kan later)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email - NOTIFICATIES (kan later)
RESEND_API_KEY=re_...

# Google OAuth - OPTIONEEL
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📋 STAPPENPLAN

### 1️⃣ Database Setup (CHOSE ONE):

#### Optie A: Vercel Postgres (EENVOUDIGST!)
1. Ga naar Vercel Dashboard
2. Klik op project "tailtribe"
3. Tab: **Storage**
4. Klik **Create** → **Postgres**
5. Vercel configureert automatisch DATABASE_URL en DIRECT_URL voor je ✓

#### Optie B: Supabase (GRATIS tier)
1. Ga naar https://supabase.com
2. Maak account + nieuw project
3. Settings → Database → Connection string
4. Kopieer "Connection pooling" (DATABASE_URL)
5. Kopieer "Direct connection" (DIRECT_URL)

#### Optie C: Neon (Serverless)
1. Ga naar https://neon.tech
2. Maak account + project
3. Kopieer connection string
4. DATABASE_URL = connection string
5. DIRECT_URL = zelfde connection string

---

### 2️⃣ Voeg Environment Variables toe:

**In Vercel Dashboard:**
1. Ga naar: https://vercel.com/stevens-projects-6df24ffb/tailtribe/settings/environment-variables
2. Klik **Add New** voor elke variabele
3. Selecteer **Production** environment
4. Copy/paste exact (geen extra spaties!)

---

### 3️⃣ Deploy & Migrate:

```bash
# Vanuit lokale terminal:
cd C:\Dev\TailTribe-Final.bak_20251007_233850
vercel --prod

# In Vercel deployment shell of lokaal:
npx prisma db push
npx prisma generate
```

---

## ✅ MINIMUM VIABLE PRODUCT

**Voor EERSTE deployment heb je minimaal nodig:**

- ✅ DATABASE_URL (PostgreSQL)
- ✅ DIRECT_URL (PostgreSQL)
- ✅ NEXTAUTH_SECRET (hierboven gegenereerd ✓)
- ✅ NEXTAUTH_URL (https://tailtribe.vercel.app)
- ✅ NEXT_PUBLIC_APP_URL (https://tailtribe.vercel.app)
- ✅ PLATFORM_COMMISSION_PERCENTAGE (20)

**ZONDER deze variabelen werkt het NIET:**
- ❌ Stripe keys (betalingen uitgeschakeld - OK!)
- ❌ Resend API (geen emails - OK!)
- ❌ Google OAuth (alleen email/password - OK!)

---

## 🆘 TROUBLESHOOTING

**Database connection fails?**
- Check DATABASE_URL is postgresql:// (niet file://)
- Check DIRECT_URL is postgresql:// (niet file://)
- Supabase: Gebruik pooled connection voor DATABASE_URL
- Supabase: Gebruik direct connection voor DIRECT_URL

**Authentication fails?**
- Check NEXTAUTH_SECRET is exact zoals hierboven
- Check NEXTAUTH_URL matcht je domain
- Regenerate secret als nodig

**Build fails?**
- Check alle required vars zijn gezet
- Check geen extra spaties in values
- Run `npm run build` lokaal om errors te zien

---

**🚀 Ready? Start met Database Setup!**

