# 🧪 TailTribe - Handmatige Test Checklist

**Datum:** _______________  
**Tester:** _______________  
**Browser:** _______________  
**Omgeving:** Production (tailtribe.be)

---

## 📋 **VOORBEREIDING**

### Test Accounts Aanmaken
- [ ] **Owner account:** Registreer met email (bijv. `test-owner@example.com`)
- [ ] **Caregiver account:** Registreer met email (bijv. `test-caregiver@example.com`)
- [ ] **Google account:** Zorg dat je een Google account hebt voor OAuth tests

### Test Data Voorbereiden
- [ ] Zorg dat je een Stripe test account hebt
- [ ] Test credit card nummer: `4242 4242 4242 4242`
- [ ] Test CVV: `123`
- [ ] Test expiratie: Elke toekomstige datum

---

## ✅ **TEST 1: Google Login Flow** (~15 min)

### 1.1 Nieuwe Gebruiker (Geen Account)
- [ ] Ga naar `/auth/signin`
- [ ] Klik op "Inloggen met Google"
- [ ] **Verwacht:** Google OAuth popup
- [ ] Log in met een Google account dat **GEEN** TailTribe account heeft
- [ ] **Verwacht:** Terug naar `/auth/signin` met foutmelding:
  - ✅ Tekst: "Je hebt nog geen TailTribe account met dit e-mailadres. Registreer je eerst."
  - ✅ Button: "Account aanmaken" (centraal geplaatst)
- [ ] Klik op "Account aanmaken"
- [ ] **Verwacht:** Redirect naar `/auth/register`
- [ ] **Verwacht:** Geen "Registreer met Google" button op register pagina

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 1.2 Bestaande Gebruiker (Account Linking)
- [ ] Registreer eerst met email/password (bijv. `test-linking@example.com`)
- [ ] Log uit
- [ ] Ga naar `/auth/signin`
- [ ] Klik op "Inloggen met Google"
- [ ] Log in met hetzelfde email adres als je registratie
- [ ] **Verwacht:** Succesvol ingelogd zonder foutmelding
- [ ] **Verwacht:** Redirect naar dashboard
- [ ] Check in database/UI dat Google account is gelinkt

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 1.3 Bestaande Google Gebruiker
- [ ] Log uit
- [ ] Ga naar `/auth/signin`
- [ ] Klik op "Inloggen met Google"
- [ ] Log in met een Google account dat **WEL** een TailTribe account heeft
- [ ] **Verwacht:** Direct ingelogd, redirect naar dashboard
- [ ] **Verwacht:** Geen foutmeldingen

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 2: Booking Flow** (~20 min)

### 2.1 Zoek Verzorger
- [ ] Log in als Owner
- [ ] Ga naar `/search`
- [ ] **Verwacht:** Geen testpersonen zichtbaar
- [ ] Gebruik filters:
  - [ ] Selecteer stad (bijv. "Brussel")
  - [ ] Selecteer service (bijv. "Hondenuitlaat")
  - [ ] Stel max prijs in
- [ ] **Verwacht:** Resultaten worden gefilterd
- [ ] **Verwacht:** Afstand wordt getoond (als locatie beschikbaar)
- [ ] Klik op een verzorger card
- [ ] **Verwacht:** Redirect naar `/caregivers/[id]`

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 2.2 Maak Boeking
- [ ] Op verzorger detail pagina
- [ ] Selecteer datum (start & eind)
- [ ] Selecteer service
- [ ] Vul pet informatie in
- [ ] **Verwacht:** Kosten worden automatisch berekend
- [ ] Klik op "Boek Nu" of "Verzend Aanvraag"
- [ ] **Verwacht:** Redirect naar payment pagina of booking confirmation

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 2.3 Betaal Boeking
- [ ] Op payment pagina
- [ ] Vul Stripe test card in:
  - Card: `4242 4242 4242 4242`
  - Expiry: `12/25` (of toekomstige datum)
  - CVC: `123`
- [ ] Klik "Betaal"
- [ ] **Verwacht:** Payment succesvol
- [ ] **Verwacht:** Redirect naar booking confirmation pagina
- [ ] **Verwacht:** Booking status = "PAID" of "ACCEPTED"
- [ ] Check email inbox
- [ ] **Verwacht:** Email ontvangen met booking details

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 2.4 Verzorger Ontvangt Aanvraag
- [ ] Log in als Caregiver (andere browser/incognito)
- [ ] Ga naar dashboard
- [ ] **Verwacht:** Nieuwe booking zichtbaar
- [ ] **Verwacht:** Email ontvangen met booking aanvraag
- [ ] Accepteer of decline booking
- [ ] **Verwacht:** Status update werkt
- [ ] **Verwacht:** Owner ontvangt email met status update

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 3: Messaging Flow** (~10 min)

### 3.1 Start Conversatie
- [ ] Log in als Owner
- [ ] Ga naar een booking detail pagina
- [ ] **Verwacht:** Chat/messaging sectie zichtbaar
- [ ] Stuur een test bericht
- [ ] **Verwacht:** Bericht wordt opgeslagen
- [ ] **Verwacht:** Bericht verschijnt in chat

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 3.2 Unread Count
- [ ] Log in als Caregiver (andere browser/incognito)
- [ ] Ga naar messaging/conversations pagina
- [ ] **Verwacht:** Unread count badge zichtbaar bij nieuwe berichten
- [ ] Open conversatie
- [ ] **Verwacht:** Unread count verdwijnt na lezen
- [ ] Stuur antwoord terug
- [ ] Log terug in als Owner
- [ ] **Verwacht:** Unread count bij Owner toont nieuwe berichten

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 4: Review Flow** (~10 min)

### 4.1 Schrijf Review
- [ ] Log in als Owner
- [ ] Ga naar een completed booking
- [ ] **Verwacht:** "Schrijf Review" button zichtbaar
- [ ] Klik op button
- [ ] Vul review in:
  - Rating: 5 sterren
  - Comment: "Uitstekende verzorger!"
- [ ] Submit review
- [ ] **Verwacht:** Review wordt opgeslagen
- [ ] **Verwacht:** Success message

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 4.2 Average Rating Update
- [ ] Ga naar verzorger profiel pagina
- [ ] **Verwacht:** Average rating is bijgewerkt
- [ ] **Verwacht:** Review count is correct
- [ ] **Verwacht:** Review is zichtbaar op profiel

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 5: UI & UX** (~15 min)

### 5.1 Cookie Consent
- [ ] Open site in **incognito/private mode**
- [ ] **Verwacht:** Cookie consent banner verschijnt
- [ ] Klik "Accepteren"
- [ ] **Verwacht:** Banner verdwijnt
- [ ] Refresh pagina
- [ ] **Verwacht:** Banner verschijnt NIET meer
- [ ] Clear cookies en refresh
- [ ] **Verwacht:** Banner verschijnt weer

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 5.2 Responsive Design
- [ ] Open site op **mobile** (of gebruik browser dev tools)
- [ ] Test belangrijke pagina's:
  - [ ] Homepage
  - [ ] Search pagina
  - [ ] Caregiver detail pagina
  - [ ] Dashboard
- [ ] **Verwacht:** Alles is goed leesbaar
- [ ] **Verwacht:** Knoppen zijn klikbaar
- [ ] **Verwacht:** Geen horizontale scroll
- [ ] **Verwacht:** Menu werkt op mobile

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 5.3 Loading States
- [ ] Ga naar search pagina
- [ ] **Verwacht:** Skeleton loaders verschijnen tijdens data fetch
- [ ] **Verwacht:** Geen lege pagina tijdens loading
- [ ] Test andere pagina's met data fetching
- [ ] **Verwacht:** Loading states werken overal

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 5.4 Error Handling
- [ ] Probeer een ongeldige URL (bijv. `/nonexistent`)
- [ ] **Verwacht:** 404 pagina wordt getoond
- [ ] Test een API error (bijv. disconnect internet tijdens request)
- [ ] **Verwacht:** Error message wordt getoond
- [ ] **Verwacht:** Error boundary werkt (geen blanke pagina)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 6: Payment & Webhook** (~15 min)

### 6.1 Stripe Payment Test
- [ ] Maak een nieuwe booking
- [ ] Ga naar payment pagina
- [ ] Gebruik Stripe test card: `4242 4242 4242 4242`
- [ ] **Verwacht:** Payment wordt verwerkt
- [ ] Check Stripe Dashboard (test mode)
- [ ] **Verwacht:** Payment Intent is aangemaakt
- [ ] **Verwacht:** Payment status = "succeeded"

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 6.2 Webhook Verificatie
- [ ] Check Stripe Dashboard → Webhooks
- [ ] **Verwacht:** Webhook endpoint is geconfigureerd
- [ ] **Verwacht:** Events zijn geselecteerd:
  - `payment_intent.succeeded`
  - `charge.succeeded`
- [ ] Maak een test payment
- [ ] Check webhook logs in Stripe
- [ ] **Verwacht:** Webhook is ontvangen
- [ ] **Verwacht:** Webhook response = 200 OK
- [ ] Check database
- [ ] **Verwacht:** Booking status is bijgewerkt naar "PAID"

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 6.3 Email Notifications
- [ ] Check email inbox na elke actie:
  - [ ] Booking aanvraag → Caregiver ontvangt email
  - [ ] Booking geaccepteerd → Owner ontvangt email
  - [ ] Payment succesvol → Owner ontvangt email
  - [ ] Booking geannuleerd → Beide partijen ontvangen email
- [ ] **Verwacht:** Alle emails worden verstuurd
- [ ] **Verwacht:** Email content is correct (Nederlands)
- [ ] **Verwacht:** Links in emails werken

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 7: Test User Filtering** (~5 min)

### 7.1 Search Results
- [ ] Log uit (of gebruik incognito)
- [ ] Ga naar `/search`
- [ ] **Verwacht:** Geen testpersonen zichtbaar
- [ ] **Verwacht:** Geen test@example.com accounts
- [ ] **Verwacht:** Geen "test", "demo", "fake" namen
- [ ] Test verschillende filters
- [ ] **Verwacht:** Filtering werkt, maar geen test users

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 7.2 Login Page
- [ ] Ga naar `/auth/signin`
- [ ] **Verwacht:** Geen "Test accounts" sectie
- [ ] **Verwacht:** Geen demo accounts zichtbaar
- [ ] **Verwacht:** Alleen normale login opties

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 8: Monitoring Verificatie** (~15 min)

### 8.1 Sentry Error Tracking
- [ ] Open browser console (F12)
- [ ] Maak een test error (bijv. `throw new Error('Test error')`)
- [ ] **Verwacht:** Error wordt gelogd in console
- [ ] Ga naar Sentry Dashboard
- [ ] **Verwacht:** Error is zichtbaar in Sentry
- [ ] **Verwacht:** Error bevat context (user, URL, etc.)
- [ ] Check dat `SENTRY_DSN` is ingesteld in Vercel

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 8.2 Vercel Analytics
- [ ] Navigeer door de site
- [ ] Ga naar Vercel Dashboard → Analytics
- [ ] **Verwacht:** Page views worden getrackt
- [ ] **Verwacht:** Traffic data is zichtbaar
- [ ] Check dat `VERCEL_ANALYTICS_ID` is ingesteld (automatisch)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 8.3 Performance Monitoring
- [ ] Ga naar Vercel Dashboard → Speed Insights
- [ ] **Verwacht:** Performance metrics zijn beschikbaar
- [ ] **Verwacht:** Core Web Vitals worden getrackt
- [ ] Test verschillende pagina's
- [ ] **Verwacht:** Performance data wordt verzameld

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 9: Security Checks** (~10 min)

### 9.1 Authentication
- [ ] Probeer toegang tot `/dashboard` zonder login
- [ ] **Verwacht:** Redirect naar `/auth/signin`
- [ ] Probeer toegang tot `/api/caregivers/search` zonder auth
- [ ] **Verwacht:** 401 Unauthorized (als vereist)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 9.2 Authorization
- [ ] Log in als Owner
- [ ] Probeer toegang tot `/dashboard/caregiver`
- [ ] **Verwacht:** Geen toegang of juiste redirect
- [ ] Log in als Caregiver
- [ ] Probeer toegang tot Owner-only routes
- [ ] **Verwacht:** Geen toegang

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

### 9.3 Rate Limiting
- [ ] Maak meerdere snel achter elkaar API requests
- [ ] **Verwacht:** Rate limiting wordt toegepast
- [ ] **Verwacht:** Error message bij te veel requests
- [ ] Wacht even en probeer opnieuw
- [ ] **Verwacht:** Requests werken weer

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## 📊 **TEST SAMENVATTING**

### Totaal Tests: 9 categorieën
### Geslaagd: ___ / 9
### Gefaald: ___ / 9

### Kritieke Issues:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Minor Issues:
1. _________________________________________________
2. _________________________________________________

### Opmerkingen:
_________________________________________________
_________________________________________________
_________________________________________________

---

## ✅ **GO-LIVE CHECKLIST**

Voor je live gaat, verifieer:

- [ ] Alle kritieke flows werken (Test 1-4)
- [ ] UI/UX is correct (Test 5)
- [ ] Payment & webhooks werken (Test 6)
- [ ] Geen test users zichtbaar (Test 7)
- [ ] Monitoring werkt (Test 8)
- [ ] Security is op orde (Test 9)
- [ ] Database backups zijn geconfigureerd
- [ ] Environment variables zijn correct ingesteld
- [ ] SSL certificaat is actief
- [ ] Domain is correct geconfigureerd

---

## 🚀 **READY TO LAUNCH?**

**Datum:** _______________  
**Go-Live Approved By:** _______________  
**Signature:** _______________

---

**Laatste update:** 2025-01-13  
**Versie:** 1.0

