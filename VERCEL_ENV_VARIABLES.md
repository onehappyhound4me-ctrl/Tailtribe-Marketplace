# 🔐 Vercel Environment Variables Setup

## ⚠️ BELANGRIJK: Environment Variables voor TailTribe

### Voor beide domains (.be en .nl):

De volgende environment variables MOETEN zijn ingesteld in Vercel:

## ✅ Verplichte Variables:

### 1. **NEXTAUTH_SECRET**
- **Waarde:** Een willekeurige geheime string (minimaal 32 karakters)
- **Voorbeeld:** `your-super-secret-key-here-min-32-chars`
- **Gebruik:** Voor het encrypten van JWT tokens
- **⚠️ BELANGRIJK:** Gebruik dezelfde waarde voor beide domains!

### 2. **NEXTAUTH_URL** (Optioneel maar aanbevolen)
- **Voor tailtribe.be:** `https://www.tailtribe.be`
- **Voor tailtribe.nl:** `https://www.tailtribe.nl`
- **Of:** Laat leeg - NextAuth detecteert automatisch het domain
- **Gebruik:** Voor redirect URLs na login

### 3. **DATABASE_URL**
- **Waarde:** Je Prisma database connection string
- **Voorbeeld:** `postgresql://user:password@host:5432/database`
- **Gebruik:** Database connectie voor alle domains

### 4. **GOOGLE_CLIENT_ID** (Als je Google OAuth gebruikt)
- **Waarde:** Je Google OAuth Client ID
- **Gebruik:** Voor Google login

### 5. **GOOGLE_CLIENT_SECRET** (Als je Google OAuth gebruikt)
- **Waarde:** Je Google OAuth Client Secret
- **Gebruik:** Voor Google login

## 🔧 Hoe in te stellen in Vercel:

### Stap 1: Ga naar Vercel Dashboard
1. Log in op https://vercel.com
2. Selecteer je TailTribe project

### Stap 2: Ga naar Settings → Environment Variables
1. Klik op "Settings" in de project navigatie
2. Klik op "Environment Variables" in het menu

### Stap 3: Voeg variables toe
Voor elke variable:
1. Klik op "Add New"
2. **Key:** Voer de variable naam in (bijv. `NEXTAUTH_SECRET`)
3. **Value:** Voer de waarde in
4. **Environment:** Selecteer:
   - ✅ Production
   - ✅ Preview (optioneel)
   - ✅ Development (optioneel)
5. Klik op "Save"

### Stap 4: Redeploy
Na het toevoegen van variables:
1. Ga naar "Deployments"
2. Klik op de laatste deployment
3. Klik op "Redeploy"
4. Wacht tot deployment klaar is

## 📋 Checklist:

### Voor tailtribe.be:
- [ ] `NEXTAUTH_SECRET` is ingesteld
- [ ] `NEXTAUTH_URL` = `https://www.tailtribe.be` (of leeg)
- [ ] `DATABASE_URL` is ingesteld
- [ ] `GOOGLE_CLIENT_ID` is ingesteld (als gebruikt)
- [ ] `GOOGLE_CLIENT_SECRET` is ingesteld (als gebruikt)

### Voor tailtribe.nl:
- [ ] `NEXTAUTH_SECRET` is ingesteld (zelfde als .be!)
- [ ] `NEXTAUTH_URL` = `https://www.tailtribe.nl` (of leeg)
- [ ] `DATABASE_URL` is ingesteld (zelfde als .be)
- [ ] `GOOGLE_CLIENT_ID` is ingesteld (als gebruikt)
- [ ] `GOOGLE_CLIENT_SECRET` is ingesteld (als gebruikt)

## ⚠️ Belangrijke Opmerkingen:

### 1. **NEXTAUTH_SECRET moet hetzelfde zijn voor beide domains!**
- Als je verschillende secrets gebruikt, kunnen gebruikers niet inloggen op beide sites
- Gebruik dezelfde secret voor beide domains

### 2. **NEXTAUTH_URL kan leeg blijven**
- NextAuth detecteert automatisch het domain uit de request headers
- Als je het wel instelt, gebruik dan het juiste domain voor elke site

### 3. **DATABASE_URL moet hetzelfde zijn**
- Beide sites gebruiken dezelfde database
- Gebruik dezelfde connection string voor beide domains

## 🐛 Troubleshooting:

### Probleem: Login werkt niet op .nl site
**Oplossing:**
1. Check of `NEXTAUTH_SECRET` is ingesteld
2. Check of `NEXTAUTH_SECRET` hetzelfde is als op .be site
3. Check Vercel logs voor errors
4. Redeploy na het toevoegen van variables

### Probleem: Redirect loop na login
**Oplossing:**
1. Check of `NEXTAUTH_URL` correct is ingesteld (of leeg)
2. Check of beide domains dezelfde `NEXTAUTH_SECRET` gebruiken
3. Check browser console voor errors
4. Hard refresh: `Ctrl + Shift + R`

### Probleem: Session cookie wordt niet gezet
**Oplossing:**
1. Check of `NEXTAUTH_SECRET` is ingesteld
2. Check of `NEXTAUTH_URL` correct is (of leeg)
3. Check browser console voor cookie errors
4. Test in incognito venster

## 📞 Support:

Als je problemen hebt:
1. Check Vercel → Deployments → Logs
2. Check browser console (F12)
3. Check of alle variables zijn ingesteld
4. Redeploy na het toevoegen van variables

---

**Laatste update:** 2025-01-13

