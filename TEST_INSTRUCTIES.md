# 🧪 Test Instructies - Stap voor Stap

**Doel:** Test alle kritieke flows voordat je de site lanceert  
**Tijd:** ~60 minuten  
**Niveau:** Stap-voor-stap uitleg voor elke test

---

## 📋 Voorbereiding

### 1. Open 2 Browsers (of Incognito Windows)
- **Browser 1:** Eigenaar account (of maak nieuw account)
- **Browser 2:** Verzorger account (of maak nieuw account)
- **Tip:** Gebruik incognito mode om makkelijk tussen accounts te switchen

### 2. Test Accounts Aanmaken
Als je nog geen test accounts hebt:
- Maak een **Eigenaar** account aan
- Maak een **Verzorger** account aan
- Vul beide profielen volledig in

### 3. Stripe Test Card
Voor betalingen gebruik je:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Elke toekomstige datum (bijv. `12/25`)
- **CVC:** Elke 3 cijfers (bijv. `123`)
- **ZIP:** Elke postcode (bijv. `1000`)

---

## 🧪 Test 1: Google Login Flow (~15 min)

### Stap 1: Test Nieuwe Gebruiker Zonder Account
**Doel:** Controleren dat nieuwe Google gebruikers niet kunnen inloggen zonder account

1. **Open incognito venster**
2. **Ga naar:** https://www.tailtribe.be/auth/signin
3. **Klik op:** "Continue with Google"
4. **Log in met Google account** dat nog niet bestaat in TailTribe
5. **Verwacht resultaat:**
   - ❌ Foutmelding: "Account niet gevonden" of vergelijkbaar
   - ✅ Redirect naar registratie pagina
   - ✅ Gebruiker kan account aanmaken

**✅ Succes als:** Foutmelding verschijnt + redirect naar registratie

---

### Stap 2: Test Account Linking
**Doel:** Controleren dat bestaande gebruikers hun Google account kunnen linken

1. **Log in** met bestaand account (email/password)
2. **Ga naar:** Dashboard → Settings/Profile
3. **Zoek naar:** "Link Google Account" of "Connect Google"
4. **Klik op:** Link Google button
5. **Log in met Google**
6. **Verwacht resultaat:**
   - ✅ Google account wordt gelinkt
   - ✅ Bericht: "Google account succesvol gelinkt"
   - ✅ Je kunt nu inloggen met Google

**✅ Succes als:** Google account wordt gelinkt zonder errors

---

### Stap 3: Test Bestaande Google Gebruiker
**Doel:** Controleren dat bestaande Google gebruikers direct kunnen inloggen

1. **Open incognito venster**
2. **Ga naar:** https://www.tailtribe.be/auth/signin
3. **Klik op:** "Continue with Google"
4. **Log in met Google account** dat al bestaat in TailTribe
5. **Verwacht resultaat:**
   - ✅ Direct ingelogd
   - ✅ Redirect naar dashboard
   - ✅ Geen foutmeldingen

**✅ Succes als:** Direct ingelogd zonder errors

---

## 🧪 Test 2: Booking Flow (~20 min)

### Stap 1: Zoek Verzorger
**Doel:** Vind een verzorger om te boeken

1. **Log in als Eigenaar** (Browser 1)
2. **Ga naar:** https://www.tailtribe.be/search
3. **Zoek op stad:** Bijv. "Brussel" of "Amsterdam"
4. **Selecteer filters:** Dienst, prijs, rating (optioneel)
5. **Verwacht resultaat:**
   - ✅ Verzorgers worden getoond
   - ✅ Kaart toont markers (als verzorgers coördinaten hebben)
   - ✅ Verzorger cards zijn klikbaar

**✅ Succes als:** Verzorgers worden getoond

---

### Stap 2: Maak Boeking Aanvraag
**Doel:** Vraag een boeking aan bij een verzorger

1. **Klik op verzorger card** of **marker op kaart**
2. **Klik op:** "Boek nu" of "Aanvraag indienen"
3. **Vul formulier in:**
   - Datum (selecteer toekomstige datum)
   - Tijd (bijv. 10:00 - 12:00)
   - Service (bijv. "Hondenuitlaat")
   - Pet info (naam, soort, leeftijd)
   - Opmerkingen (optioneel)
4. **Klik op:** "Verzenden" of "Boeking aanvragen"
5. **Verwacht resultaat:**
   - ✅ Bevestigingsbericht: "Boeking aanvraag verzonden"
   - ✅ Redirect naar dashboard of boekingspagina
   - ✅ Boeking status: "PENDING" of "AWAITING_APPROVAL"

**✅ Succes als:** Boeking aanvraag wordt verzonden zonder errors

---

### Stap 3: Betaal Met Stripe Test Card
**Doel:** Test betalingsflow met Stripe test card

1. **Ga naar:** Dashboard → Bookings → Nieuwe boeking
2. **Klik op:** "Betaal nu" of "Afrekenen"
3. **Vul Stripe formulier in:**
   - **Card:** `4242 4242 4242 4242`
   - **Expiry:** `12/25` (of andere toekomstige datum)
   - **CVC:** `123`
   - **ZIP:** `1000`
4. **Klik op:** "Betalen" of "Pay"
5. **Verwacht resultaat:**
   - ✅ Betaling wordt verwerkt
   - ✅ Bevestigingsbericht: "Betaling succesvol"
   - ✅ Boeking status: "PAID" of "CONFIRMED"
   - ✅ Email bevestiging wordt verstuurd (check inbox)

**✅ Succes als:** Betaling wordt verwerkt zonder errors

---

### Stap 4: Verzorger Ontvangt Aanvraag
**Doel:** Controleren dat verzorger de aanvraag ontvangt

1. **Open Browser 2** (of incognito)
2. **Log in als Verzorger**
3. **Ga naar:** Dashboard → Bookings of Notifications
4. **Verwacht resultaat:**
   - ✅ Nieuwe boeking aanvraag is zichtbaar
   - ✅ Status: "PENDING" of "AWAITING_APPROVAL"
   - ✅ Notificatie badge toont aantal nieuwe aanvragen
   - ✅ Email notificatie is verstuurd (check inbox)

**✅ Succes als:** Verzorger ziet de aanvraag

---

### Stap 5: Accept/Decline Boeking
**Doel:** Test acceptatie/afwijzing flow

**Optie A: Accepteer Boeking**
1. **Klik op:** Boeking aanvraag
2. **Klik op:** "Accepteren" of "Accept"
3. **Verwacht resultaat:**
   - ✅ Boeking status: "ACCEPTED" of "CONFIRMED"
   - ✅ Eigenaar ontvangt notificatie
   - ✅ Email bevestiging wordt verstuurd

**Optie B: Wijzig Boeking Af**
1. **Klik op:** Boeking aanvraag
2. **Klik op:** "Afwijzen" of "Decline"
3. **Vul reden in** (als gevraagd)
4. **Klik op:** "Bevestigen"
5. **Verwacht resultaat:**
   - ✅ Boeking status: "DECLINED" of "CANCELLED"
   - ✅ Eigenaar ontvangt notificatie
   - ✅ Email notificatie wordt verstuurd

**✅ Succes als:** Accept/decline werkt zonder errors

---

## 🧪 Test 3: Messaging Flow (~10 min)

### Stap 1: Start Conversatie
**Doel:** Start een chat vanuit een boeking

1. **Log in als Eigenaar** (Browser 1)
2. **Ga naar:** Dashboard → Bookings → [Selecteer boeking]
3. **Klik op:** "Bericht versturen" of "Start chat"
4. **Verwacht resultaat:**
   - ✅ Chat venster opent
   - ✅ Conversatie wordt aangemaakt
   - ✅ Berichten pagina opent

**✅ Succes als:** Chat venster opent

---

### Stap 2: Verstuur Bericht
**Doel:** Test berichten versturen

1. **Type bericht:** Bijv. "Hallo, ik heb een vraag over de boeking"
2. **Klik op:** "Verzenden" of "Send"
3. **Verwacht resultaat:**
   - ✅ Bericht wordt verstuurd
   - ✅ Bericht verschijnt in chat
   - ✅ Timestamp wordt getoond
   - ✅ Verzonden status wordt getoond

**✅ Succes als:** Bericht wordt verstuurd zonder errors

---

### Stap 3: Test Unread Count
**Doel:** Controleren dat unread count werkt

1. **Open Browser 2** (Verzorger)
2. **Ga naar:** Dashboard → Messages
3. **Verwacht resultaat:**
   - ✅ Unread badge toont aantal ongelezen berichten
   - ✅ Nieuwe conversatie is zichtbaar
   - ✅ Bericht is gemarkeerd als "unread"

**✅ Succes als:** Unread count wordt correct getoond

---

### Stap 4: Test Berichten Opslaan
**Doel:** Controleren dat berichten worden opgeslagen

1. **Verstuur meerdere berichten** (beide kanten)
2. **Refresh pagina** (F5)
3. **Verwacht resultaat:**
   - ✅ Alle berichten zijn nog zichtbaar
   - ✅ Berichten zijn in juiste volgorde
   - ✅ Geen berichten zijn verloren

**✅ Succes als:** Berichten worden opgeslagen en blijven zichtbaar

---

## 🧪 Test 4: Review Flow (~10 min)

### Stap 1: Schrijf Review Na Completed Booking
**Doel:** Test review schrijven na voltooide boeking

1. **Log in als Eigenaar** (Browser 1)
2. **Ga naar:** Dashboard → Bookings → [Selecteer completed boeking]
3. **Klik op:** "Schrijf review" of "Leave review"
4. **Vul review formulier in:**
   - **Rating:** Selecteer sterren (bijv. 5 sterren)
   - **Titel:** Bijv. "Geweldige verzorger!"
   - **Review tekst:** Bijv. "Zeer tevreden met de service"
5. **Klik op:** "Verzenden" of "Submit"
6. **Verwacht resultaat:**
   - ✅ Review wordt opgeslagen
   - ✅ Bevestigingsbericht: "Review succesvol toegevoegd"
   - ✅ Review verschijnt op verzorger profiel

**✅ Succes als:** Review wordt opgeslagen zonder errors

---

### Stap 2: Test Average Rating Update
**Doel:** Controleren dat gemiddelde rating wordt bijgewerkt

1. **Ga naar:** Verzorger profiel pagina
2. **Check rating:**
   - ✅ Gemiddelde rating is bijgewerkt
   - ✅ Aantal reviews is bijgewerkt
   - ✅ Sterren weergave klopt

**✅ Succes als:** Rating wordt correct bijgewerkt

---

### Stap 3: Test Review Verschijnt Op Profiel
**Doel:** Controleren dat review zichtbaar is op profiel

1. **Ga naar:** Verzorger profiel pagina
2. **Scroll naar:** Reviews sectie
3. **Verwacht resultaat:**
   - ✅ Review is zichtbaar
   - ✅ Rating wordt getoond
   - ✅ Review tekst wordt getoond
   - ✅ Datum wordt getoond
   - ✅ Eigenaar naam wordt getoond (of anoniem)

**✅ Succes als:** Review verschijnt op profiel

---

## 🧪 Test 5: UI/UX Checks (~15 min)

### Stap 1: Cookie Consent
**Doel:** Test cookie consent popup

1. **Open incognito venster**
2. **Ga naar:** https://www.tailtribe.be
3. **Verwacht resultaat:**
   - ✅ Cookie consent popup verschijnt
   - ✅ "Accepteren" button werkt
   - ✅ "Weigeren" button werkt (als aanwezig)
   - ✅ Popup verdwijnt na accepteren

**✅ Succes als:** Cookie consent werkt

---

### Stap 2: Responsive Design
**Doel:** Test op verschillende schermformaten

**Desktop (1920x1080):**
1. **Open site op desktop**
2. **Check:**
   - ✅ Layout is correct
   - ✅ Navigation werkt
   - ✅ Content is leesbaar
   - ✅ Images laden correct

**Tablet (768x1024):**
1. **Open DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. **Selecteer:** iPad of tablet formaat
4. **Check:**
   - ✅ Layout past zich aan
   - ✅ Navigation werkt (hamburger menu)
   - ✅ Content is leesbaar

**Mobile (375x667):**
1. **Selecteer:** iPhone of mobile formaat
2. **Check:**
   - ✅ Layout past zich aan
   - ✅ Navigation werkt (hamburger menu)
   - ✅ Content is leesbaar
   - ✅ Buttons zijn klikbaar

**✅ Succes als:** Site werkt op alle schermformaten

---

### Stap 3: Loading States
**Doel:** Test loading states tijdens data ophalen

1. **Ga naar:** Search pagina
2. **Open DevTools** → Network tab
3. **Throttle network:** Slow 3G
4. **Refresh pagina**
5. **Verwacht resultaat:**
   - ✅ Loading spinner wordt getoond
   - ✅ Skeleton screens worden getoond (als gebruikt)
   - ✅ Geen lege pagina tijdens laden

**✅ Succes als:** Loading states werken

---

### Stap 4: Error Handling
**Doel:** Test error handling

**404 Error:**
1. **Ga naar:** https://www.tailtribe.be/nonexistent-page
2. **Verwacht resultaat:**
   - ✅ 404 pagina wordt getoond
   - ✅ "Pagina niet gevonden" bericht
   - ✅ Link terug naar homepage

**500 Error:**
1. **Probeer een actie die een error veroorzaakt** (bijv. invalid form submit)
2. **Verwacht resultaat:**
   - ✅ Error message wordt getoond
   - ✅ Geen stack trace zichtbaar voor gebruiker
   - ✅ Error wordt gelogd (check Sentry/Vercel logs)

**✅ Succes als:** Errors worden netjes afgehandeld

---

## 🧪 Test 6: Payment & Webhook (~15 min)

### Stap 1: Stripe Payment Test
**Doel:** Test betaling met Stripe test card

1. **Volg:** Test 2, Stap 3 (Betaal Met Stripe Test Card)
2. **Check Stripe Dashboard:**
   - ✅ Payment wordt getoond in Stripe dashboard
   - ✅ Status: "Succeeded"
   - ✅ Amount klopt

**✅ Succes als:** Payment wordt verwerkt in Stripe

---

### Stap 2: Webhook Test
**Doel:** Controleren dat webhook wordt ontvangen

1. **Ga naar:** Stripe Dashboard → Webhooks
2. **Check webhook events:**
   - ✅ `payment_intent.succeeded` event wordt ontvangen
   - ✅ Webhook wordt succesvol verwerkt
   - ✅ Geen errors in webhook logs

**✅ Succes als:** Webhook wordt ontvangen en verwerkt

---

### Stap 3: Booking Status Update
**Doel:** Controleren dat boeking status wordt bijgewerkt na betaling

1. **Ga naar:** Dashboard → Bookings
2. **Check boeking status:**
   - ✅ Status: "PAID" of "CONFIRMED"
   - ✅ Betalingsdatum wordt getoond
   - ✅ Betalingsbedrag wordt getoond

**✅ Succes als:** Boeking status wordt bijgewerkt

---

## 🧪 Test 7: Test User Filtering (~5 min)

### Stap 1: Check Search Results
**Doel:** Controleren dat test accounts niet zichtbaar zijn

1. **Ga naar:** https://www.tailtribe.be/search
2. **Check verzorger cards:**
   - ✅ Geen accounts met email: `test@example.com`
   - ✅ Geen accounts met naam: "test", "demo", "fake"
   - ✅ Alleen echte/goedgekeurde verzorgers worden getoond

**✅ Succes als:** Geen test accounts zichtbaar

---

## 🧪 Test 8: Monitoring (~15 min)

### Stap 1: Sentry Error Tracking
**Doel:** Test error tracking

1. **Maak test error aan:**
   - Open browser console (F12)
   - Type: `throw new Error("Test error")`
   - Of trigger een echte error (bijv. invalid form submit)
2. **Check Sentry Dashboard:**
   - ✅ Error wordt getoond in Sentry
   - ✅ Error details zijn zichtbaar
   - ✅ Stack trace is beschikbaar

**✅ Succes als:** Errors worden getrackt in Sentry

---

### Stap 2: Vercel Analytics
**Doel:** Controleren dat analytics werkt

1. **Ga naar:** Vercel Dashboard → Analytics
2. **Check metrics:**
   - ✅ Page views worden getoond
   - ✅ Unique visitors worden getoond
   - ✅ Top pages worden getoond

**✅ Succes als:** Analytics werkt

---

### Stap 3: Check Logs
**Doel:** Controleren dat er geen kritieke errors zijn

1. **Ga naar:** Vercel Dashboard → Deployments → Latest → Logs
2. **Check logs:**
   - ✅ Geen kritieke errors
   - ✅ Geen 500 errors
   - ✅ Alleen info/warning logs (normaal)

**✅ Succes als:** Geen kritieke errors in logs

---

## 🧪 Test 9: Security (~10 min)

### Stap 1: Authentication Required
**Doel:** Controleren dat dashboard beschermd is

1. **Open incognito venster**
2. **Ga direct naar:** https://www.tailtribe.be/dashboard
3. **Verwacht resultaat:**
   - ✅ Redirect naar login pagina
   - ✅ Bericht: "Je moet ingelogd zijn"

**✅ Succes als:** Dashboard is beschermd

---

### Stap 2: Authorization Test
**Doel:** Controleren dat rollen correct werken

**Eigenaar:**
1. **Log in als Eigenaar**
2. **Ga naar:** Dashboard → Caregiver routes (als die bestaan)
3. **Verwacht resultaat:**
   - ✅ Geen toegang tot verzorger-only routes
   - ✅ Error message of redirect

**Verzorger:**
1. **Log in als Verzorger**
2. **Ga naar:** Dashboard → Owner routes (als die bestaan)
3. **Verwacht resultaat:**
   - ✅ Geen toegang tot eigenaar-only routes
   - ✅ Error message of redirect

**✅ Succes als:** Authorization werkt correct

---

### Stap 3: Rate Limiting
**Doel:** Test rate limiting (als geïmplementeerd)

1. **Probeer meerdere requests snel achter elkaar** (bijv. 10x form submit)
2. **Verwacht resultaat:**
   - ✅ Rate limit wordt getriggerd na X requests
   - ✅ Error message: "Te veel requests, probeer later opnieuw"
   - ✅ Requests worden geblokkeerd

**✅ Succes als:** Rate limiting werkt (als geïmplementeerd)

---

## ✅ Test Samenvatting

### Succes Criteria
- ✅ Alle 9 tests zijn uitgevoerd
- ✅ Geen kritieke errors
- ✅ Alle flows werken zoals verwacht
- ✅ Monitoring werkt
- ✅ Security werkt

### Als Iets Niet Werkt
1. **Noteer het probleem:**
   - Welke test?
   - Wat gebeurt er?
   - Wat verwacht je?
   - Browser console errors?
2. **Check logs:**
   - Vercel logs
   - Sentry errors
   - Browser console
3. **Rapporteer:**
   - Beschrijf het probleem
   - Voeg screenshots toe
   - Voeg console errors toe

---

## 🎯 Quick Reference

### Test Accounts
- **Eigenaar:** [jouw eigenaar email]
- **Verzorger:** [jouw verzorger email]

### Stripe Test Card
- **Card:** `4242 4242 4242 4242`
- **Expiry:** `12/25`
- **CVC:** `123`
- **ZIP:** `1000`

### Test URLs
- **Homepage:** https://www.tailtribe.be
- **Search:** https://www.tailtribe.be/search
- **Login:** https://www.tailtribe.be/auth/signin
- **Register:** https://www.tailtribe.be/auth/register
- **Dashboard:** https://www.tailtribe.be/dashboard

### Monitoring
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** [jouw Sentry URL]
- **Stripe Dashboard:** https://dashboard.stripe.com

---

**🎉 Als alle tests slagen → SITE IS KLAAR VOOR LAUNCH! 🎉**


