# 🐛 Debug: Login Probleem Oplossen

## ✅ Wat is al goed:
- ✅ Environment variables zijn correct ingesteld
- ✅ NEXTAUTH_SECRET staat erin
- ✅ DATABASE_URL staat erin
- ✅ Beide zijn ingesteld voor Production

## 🔍 Wat te checken nu:

### Stap 1: Is de nieuwe code gedeployed?

**Check laatste deployment:**
1. Ga naar Vercel → je project → Deployments
2. Check de laatste deployment:
   - Wanneer was deze? (moet recent zijn, na onze code changes)
   - Welke commit? (moet `078b4d5` of nieuwer zijn)
   - Status: Succesvol?

**Als deployment oud is:**
- Klik op "Redeploy" om nieuwe code te deployen
- Wacht tot klaar

### Stap 2: Test login en check browser console

**Stap 2a: Open Developer Tools**
1. Ga naar `https://www.tailtribe.nl/auth/signin`
2. Druk op `F12` (of rechtsklik → Inspect)
3. Ga naar **Console** tab
4. Zorg dat "Preserve log" is aangevinkt

**Stap 2b: Probeer in te loggen**
1. Vul email en wachtwoord in
2. Klik "Inloggen"
3. **Let op wat er gebeurt:**
   - Zie je `[SIGNIN]` logs?
   - Zie je `[AUTH]` logs?
   - Zie je errors (rood)?
   - Wat is de laatste log voordat redirect?

**Stap 2c: Check Network tab**
1. Ga naar **Network** tab in Developer Tools
2. Probeer opnieuw in te loggen
3. Zoek naar:
   - `/api/auth/callback/credentials` - Wat is de response?
   - `/api/auth/session` - Wat is de response?
   - Zijn er failed requests (rood)?

### Stap 3: Check Vercel Logs

**Stap 3a: Function Logs**
1. Ga naar Vercel → je project → Deployments
2. Klik op laatste deployment
3. Klik op "View Function Logs"
4. Probeer in te loggen
5. Check logs voor:
   - `[AUTH]` logs
   - `[MIDDLEWARE]` logs
   - Errors

**Stap 3b: Real-time Logs**
1. Ga naar Vercel → je project → Logs
2. Probeer in te loggen
3. Check voor errors

### Stap 4: Test specifieke scenario's

**Test 1: Hard Refresh**
1. Ga naar `https://www.tailtribe.nl/auth/signin`
2. Druk `Ctrl + Shift + R` (hard refresh)
3. Probeer in te loggen

**Test 2: Incognito Venster**
1. Open incognito/private venster
2. Ga naar `https://www.tailtribe.nl/auth/signin`
3. Probeer in te loggen

**Test 3: Direct naar dashboard**
1. Ga direct naar `https://www.tailtribe.nl/dashboard`
2. Wat gebeurt er?
   - Redirect naar `/auth/signin`? (normaal als niet ingelogd)
   - Blijft hangen? (probleem)
   - Toont dashboard? (je bent al ingelogd)

## 🔍 Wat te zoeken in logs:

### In Browser Console:

**Goede logs (als login werkt):**
```
[SIGNIN] Login successful, redirecting to: /dashboard
[AUTH] Credentials authorize called
[AUTH] Email: test@example.com
[AUTH] User found, checking password...
[AUTH] Password valid, returning user object
```

**Probleem logs:**
```
[SIGNIN] Login error: CredentialsSignin
[AUTH] User not found: test@example.com
[AUTH] Password invalid for: test@example.com
```

### In Vercel Logs:

**Goede logs:**
```
[MIDDLEWARE] Protected path: /dashboard Token present: true
[AUTH] Redirect callback - url: /dashboard baseUrl: https://www.tailtribe.nl
```

**Probleem logs:**
```
[MIDDLEWARE] No token found, redirecting to signin
Error: ...
```

## 🚨 Veelvoorkomende Problemen:

### Probleem 1: Redirect Loop
**Symptomen:**
- Blijft redirecten tussen `/dashboard` en `/auth/signin`
- Console toont meerdere redirects

**Oplossing:**
- Check of middleware `/auth/*` routes skipt (moet `return NextResponse.next()`)
- Check of redirect callback auth pages blokkeert

### Probleem 2: Session Cookie wordt niet gezet
**Symptomen:**
- Login lijkt te werken, maar redirect terug naar signin
- Console toont geen errors
- Network tab toont `/api/auth/session` zonder user data

**Oplossing:**
- Check cookie settings in `src/lib/auth.ts`
- Check of `NEXTAUTH_SECRET` correct is
- Check browser cookie settings (third-party cookies?)

### Probleem 3: Database Connectie Fails
**Symptomen:**
- Vercel logs tonen database errors
- Login faalt zonder duidelijke reden

**Oplossing:**
- Check Neon database status
- Check DATABASE_URL is correct
- Check database is niet vol

### Probleem 4: Oude Code is nog gedeployed
**Symptomen:**
- Code changes werken niet
- Logs tonen oude code behavior

**Oplossing:**
- Redeploy in Vercel
- Check deployment commit hash
- Clear Vercel build cache

## 📋 Debug Checklist:

- [ ] Laatste deployment is recent (na code changes)
- [ ] Browser console is open tijdens login test
- [ ] Network tab is open tijdens login test
- [ ] Vercel logs zijn gecheckt
- [ ] Hard refresh is geprobeerd
- [ ] Incognito venster is geprobeerd
- [ ] Test account bestaat in database
- [ ] Test account wachtwoord is correct

## 🎯 Volgende Stappen:

1. **Test login en noteer wat je ziet:**
   - Wat staat er in browser console?
   - Wat staat er in Network tab?
   - Wat gebeurt er visueel? (redirect loop? error? niets?)

2. **Check Vercel logs:**
   - Zie je `[AUTH]` logs?
   - Zie je errors?
   - Wat is de laatste log?

3. **Laat weten:**
   - Wat zie je in browser console?
   - Wat zie je in Vercel logs?
   - Wat gebeurt er precies? (blijft hangen? redirect loop? error message?)

---

**Met deze informatie kunnen we het probleem precies identificeren en oplossen!**

