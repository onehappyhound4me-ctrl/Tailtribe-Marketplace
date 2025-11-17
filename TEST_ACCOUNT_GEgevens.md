# ✅ Test Account Aangemaakt!

## 🔐 Test Owner Account Gegevens:

**Email:** `test.owner@tailtribe.nl`  
**Wachtwoord:** `test123456`  
**Role:** `OWNER`

## 📋 Hoe te gebruiken:

### Stap 1: Ga naar login pagina
- https://www.tailtribe.nl/auth/signin
- OF: https://www.tailtribe.be/auth/signin

### Stap 2: Log in met test account
- **Email:** `test.owner@tailtribe.nl`
- **Wachtwoord:** `test123456`
- Klik op "Inloggen"

### Stap 3: Je zou nu moeten worden doorgestuurd naar:
- `/dashboard/owner` (eigenaar dashboard)

## 🔄 Account Resetten:

Als je het account opnieuw wilt instellen (bijv. wachtwoord resetten):

```bash
npx tsx scripts/create-test-owner.ts
```

Dit script:
- Zoekt naar het test account
- Als het bestaat: reset het wachtwoord naar `test123456`
- Als het niet bestaat: maakt een nieuw account aan

## 🧪 Test Account Features:

- ✅ Email is geverifieerd (`emailVerified` is gezet)
- ✅ Role is `OWNER`
- ✅ Wachtwoord is correct gehashed
- ✅ Account is klaar voor gebruik

## ⚠️ Als login nog steeds niet werkt:

1. **Check browser console (F12):**
   - Zie je `[SIGNIN]` logs?
   - Zie je `[AUTH]` logs?
   - Zie je errors?

2. **Check Vercel logs:**
   - Ga naar Vercel → je project → Logs
   - Probeer in te loggen
   - Check voor `[AUTH]` en `[MIDDLEWARE]` logs

3. **Test met incognito venster:**
   - Open incognito/private venster
   - Probeer in te loggen
   - Werkt het daar wel?

4. **Check environment variables:**
   - `NEXTAUTH_SECRET` moet zijn ingesteld
   - `DATABASE_URL` moet zijn ingesteld
   - Beide moeten voor Production zijn ingesteld

---

**Laat weten of het werkt met dit nieuwe test account!**

