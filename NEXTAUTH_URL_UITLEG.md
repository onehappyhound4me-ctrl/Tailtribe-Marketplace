# 🔐 NEXTAUTH_URL Uitleg voor Meerdere Domains

## ❓ Moet tailtribe.nl in de variables staan?

### Kort antwoord: **NEE, niet per se!**

## 📋 Hoe het werkt:

### Optie 1: NEXTAUTH_URL leeg laten (Aanbevolen) ✅

**Als je NEXTAUTH_URL NIET instelt:**
- NextAuth detecteert **automatisch** het juiste domain uit de request headers
- Werkt voor **beide** domains (.be en .nl) zonder extra configuratie
- **Dit is wat we nu hebben geconfigureerd in de code**

**Variables die je nodig hebt:**
- ✅ `NEXTAUTH_SECRET` (VERPLICHT)
- ✅ `DATABASE_URL` (VERPLICHT)
- ❌ `NEXTAUTH_URL` (NIET nodig - kan leeg blijven)

### Optie 2: NEXTAUTH_URL instellen

**Als je NEXTAUTH_URL WEL instelt:**

**Voor één project met beide domains:**
- Gebruik de **primary domain** (bijv. `https://www.tailtribe.be`)
- NextAuth gebruikt deze als fallback, maar detecteert nog steeds automatisch het juiste domain

**Variables:**
- ✅ `NEXTAUTH_SECRET` (VERPLICHT)
- ✅ `DATABASE_URL` (VERPLICHT)
- ✅ `NEXTAUTH_URL` = `https://www.tailtribe.be` (optioneel)

**VOORBEELD:**
```
NEXTAUTH_URL = https://www.tailtribe.be
```

**Werkt dit voor tailtribe.nl?**
- ✅ JA! NextAuth detecteert automatisch dat je op tailtribe.nl bent
- ✅ Gebruikt tailtribe.nl voor redirects, ook al staat tailtribe.be in NEXTAUTH_URL
- ✅ De code die we hebben gemaakt ondersteunt beide domains automatisch

## 🎯 Wat moet je nu doen?

### Minimum (Werkt voor beide domains):

1. **NEXTAUTH_SECRET** (VERPLICHT)
   ```
   ROT6CHqqqw/xhgVO8kJwc9a36uBfLiPwIAlKoLZD+AE=
   ```

2. **DATABASE_URL** (VERPLICHT)
   ```
   postgresql://user:password@host:5432/database
   ```

3. **NEXTAUTH_URL** (OPTIONEEL - kan leeg blijven)
   - Als je het instelt: gebruik `https://www.tailtribe.be`
   - Als je het niet instelt: NextAuth detecteert automatisch

## ✅ Aanbevolen Setup:

### Voor één Vercel project met beide domains:

**Variables:**
```
NEXTAUTH_SECRET = ROT6CHqqqw/xhgVO8kJwc9a36uBfLiPwIAlKoLZD+AE=
DATABASE_URL = [jouw database connection string]
NEXTAUTH_URL = https://www.tailtribe.be (of leeg laten)
```

**Waarom dit werkt:**
- `NEXTAUTH_SECRET` is hetzelfde voor beide domains (moet!)
- `DATABASE_URL` is hetzelfde voor beide domains (moet!)
- `NEXTAUTH_URL` kan de primary domain zijn, maar NextAuth detecteert automatisch het juiste domain per request

## 🔍 Check in Vercel:

### Stap 1: Ga naar Environment Variables
Vercel → je project → Settings → Environment Variables

### Stap 2: Check of deze er zijn:

**VERPLICHT:**
- [ ] `NEXTAUTH_SECRET` - Moet er zijn!
- [ ] `DATABASE_URL` - Moet er zijn!

**OPTIONEEL:**
- [ ] `NEXTAUTH_URL` - Kan er zijn (met tailtribe.be) OF leeg
- [ ] `GOOGLE_CLIENT_ID` - Als je Google OAuth gebruikt
- [ ] `GOOGLE_CLIENT_SECRET` - Als je Google OAuth gebruikt

## ⚠️ BELANGRIJK:

### Je hoeft NIET:
- ❌ Aparte `NEXTAUTH_URL` voor tailtribe.nl maken
- ❌ Aparte `NEXTAUTH_SECRET` voor tailtribe.nl maken
- ❌ Aparte `DATABASE_URL` voor tailtribe.nl maken

### Je moet WEL:
- ✅ `NEXTAUTH_SECRET` toevoegen (één voor beide domains)
- ✅ `DATABASE_URL` toevoegen (één voor beide domains)
- ✅ Redeploy na het toevoegen van variables

## 🧪 Test:

Na het toevoegen van variables en redeploy:

1. Test login op `tailtribe.be` → Moet werken
2. Test login op `tailtribe.nl` → Moet ook werken
3. Beide gebruiken dezelfde `NEXTAUTH_SECRET` en `DATABASE_URL`
4. NextAuth detecteert automatisch het juiste domain

---

## 📝 Samenvatting:

**Moet tailtribe.nl in de variables staan?**
- ❌ NEE - Je hoeft geen aparte variable voor tailtribe.nl te maken
- ✅ De code detecteert automatisch of je op .be of .nl bent
- ✅ Gebruik dezelfde variables voor beide domains

**Wat moet je toevoegen?**
1. `NEXTAUTH_SECRET` (één voor beide)
2. `DATABASE_URL` (één voor beide)
3. `NEXTAUTH_URL` is optioneel (kan leeg blijven)

---

**Laatste update:** 2025-01-13

