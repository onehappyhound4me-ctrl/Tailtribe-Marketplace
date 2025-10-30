# FAQ Implementation Check

## ✅ VOOR BAASJES (OWNERS)

### ✅ "Wat is TailTribe?"
**FAQ:** Belgisch platform dat eigenaars verbindt met verzorgers
**Code:** ✅ Correct - platform funktionaliteit aanwezig

### ✅ "Hoe werkt het?" (4 stappen)
**FAQ:** 
1. Maak gratis profiel aan
2. Zoek verzorger in je buurt
3. Bekijk profiel, ervaring, recensies
4. Neem contact op en spreek af

**Code Check:**
- ✅ Registratie: `/auth/register`
- ✅ Zoeken: `/search` met filters
- ✅ Profielen: `/caregivers/[id]` met reviews
- ✅ Contact: `/messages/new`
- ✅ **COMPLEET**

### ✅ "Kan ik verzorgers beoordelen?"
**FAQ:** Ja, na elke samenwerking
**Code:** ✅ Reviews systeem aanwezig (`/reviews/write`)

### ✅ "Wat als er iets misgaat?"
**FAQ:** TailTribe is platform, overeenkomst is tussen eigenaar en verzorger
**Code:** ✅ Correct - staat in algemene voorwaarden

### ✅ "Welke soorten dieren?"
**FAQ:** Honden, katten, konijnen, reptielen, paarden, kleinvee
**Code:** ✅ Pet types in booking form (dog, cat, rabbit, bird, other)
**⚠️ NOTE:** Reptielen en paarden niet specifiek, maar "other" werkt

### ✅ "Meet & Greet?"
**FAQ:** Aan te raden, plan een korte kennismaking
**Code:** ✅ Kan via messaging systeem

### ❌ "Terugkerende wandelingen?"
**FAQ:** "Ja. Spreek vast schema af (dagen/uren) met verzorger"
**Code:** ❌ **ONTBREEKT** - Geen recurring bookings functionaliteit
**ACTION NEEDED:** Implementeer recurring bookings!

### ✅ "Annuleringsbeleid?"
**FAQ:** 
- Tot 1 dag vóór EN vóór 12:00: 100%
- Later: 50%
- Tijdens: 0%

**Code:** ✅ NU CORRECT - `cancellation.ts` updated!

### ❌ "Mag mijn hond loslopen?"
**FAQ:** Alleen waar wettelijk mag en als verzorger het veilig acht
**Code:** ⚠️ Niet expliciet in booking form
**ACTION:** Voeg "Mag loslopen?" checkbox toe aan booking

### ✅ "Extreem weer?"
**FAQ:** Activiteit inkorten/aanpassen in overleg
**Code:** ✅ Kan via messaging

### ❌ "Noodgevallen / dierenarts?"
**FAQ:** "Spreek vooraf noodprocedure af"
**Code:** ❌ **ONTBREEKT** - Geen emergency contact veld in booking!
**ACTION NEEDED:** Emergency contact & veterinarian info!

### ⚠️ "Sleuteloverdracht?"
**FAQ:** Bij voorkeur persoonlijk of sleutelkluis
**Code:** ⚠️ Geen sleutel management systeem
**NOTE:** Kan via messaging, maar geen dedicated flow

### ✅ "Privacy?"
**FAQ:** Data alleen voor matching, account verwijderen mogelijk
**Code:** ✅ Privacy policy aanwezig, GDPR compliant

### ✅ "Probleem melden?"
**FAQ:** Via contactformulier of steven@tailtribe.be
**Code:** ✅ Contact pagina aanwezig

### ✅ "Overeenkomst met wie?"
**FAQ:** Tussen eigenaar en verzorger, niet TailTribe
**Code:** ✅ Correct in algemene voorwaarden

### ✅ "Klacht melden?"
**FAQ:** Via contactformulier, binnen 5 werkdagen behandeld
**Code:** ✅ Contact pagina + email

### ✅ "Betalingen veilig?"
**FAQ:** Via Stripe, SSL, PCI DSS compliant
**Code:** ✅ Stripe integration compleet

### ✅ "Verzorger annuleert?"
**FAQ:** Melding + volledige refund binnen 3-5 werkdagen
**Code:** ✅ Booking status updates + email notificaties

### ✅ "Verzorger vaak annuleert?"
**FAQ:** Account kan beperkt/verwijderd worden
**Code:** ✅ Admin tools voor user management

### ✅ "Hoe boek ik?"
**FAQ:** Zoek verzorgers → filter → profiel → Boek nu
**Code:** ✅ Complete booking flow

### ⚠️ "Hoe annuleren/wijzigen?"
**FAQ:** Dashboard → Boekingen → Annuleren of Wijzigen
**Code:** ⚠️ Annuleren API bestaat, maar UI button ontbreekt!
**ACTION NEEDED:** Cancel button in booking detail pagina!

### ✅ "Betalingen en facturen?"
**FAQ:** Via Stripe, facturen in "Inkomsten & Uitbetalingen"
**Code:** ⚠️ Stripe works, maar "Inkomsten & Uitbetalingen" pagina bestaat niet voor owners!
**NOTE:** Owners hebben geen earnings, alleen expenses

### ✅ "Juiste service kiezen?"
**FAQ:** Via servicefilters, bekijk beschrijvingen en tarieven
**Code:** ✅ Search filters en service details

### ✅ "Beschikbaarheid en kalenders?"
**FAQ:** Verzorgers beheren beschikbaarheid
**Code:** ✅ Availability calendar component

### ✅ "Berichten en afspraken?"
**FAQ:** Dashboard → Berichten & Boekingen
**Code:** ✅ Both pagina's aanwezig

---

## ✅ VOOR VERZORGERS (CAREGIVERS)

### ✅ "Hoe begin ik?"
**FAQ:** Profiel → foto → beschrijving → diensten → tarieven
**Code:** ✅ Onboarding wizard (5 stappen)

### ✅ "Verdien ik geld?"
**FAQ:** Ja, jij bepaalt prijzen, TailTribe neemt commissie
**Code:** ✅ Hourly rate + Stripe Connect

### ✅ "Moet ik betalen?"
**FAQ:** Nee, alleen commissie op transacties
**Code:** ✅ 20% commissie systeem

### ❌ "Moet ik zelfstandige zijn?"
**FAQ:** "Nee, je moet geen zelfstandige zijn... ook als bijverdienste"
**Code:** ⚠️ Geen legal status check in onboarding
**NOTE:** Dit is OK - user verantwoordelijkheid volgens FAQ

### ✅ "Vertrouwen opbouwen?"
**FAQ:** Echte naam, foto, volledig profiel, snel reageren, reviews
**Code:** ✅ Profile completeness indicator + review systeem

### ✅ "Meerdere dieren tegelijk?"
**FAQ:** Ja, zolang veilig
**Code:** ✅ Kan via booking (geen hard limit)

### ✅ "Extra verdienen?"
**FAQ:** Van passie je bijverdienste maken
**Code:** ✅ Platform faciliteert dit

### ✅ "Eigen uren bepalen?"
**FAQ:** Jij beslist wanneer je werkt
**Code:** ✅ Availability management

### ✅ "Hoeveel bijverdienen?"
**FAQ:** Maak profiel, stel prijs in
**Code:** ✅ Hourly rate configureerbaar

### ✅ "Baasje annuleringsbeleid?"
**FAQ:** Zelfde als bij owners (1 dag + 12:00)
**Code:** ✅ NU CORRECT - cancellation.ts updated!

### ✅ "Hoe ontvang ik betaling bij annulering?"
**FAQ:** Automatisch via Stripe volgens uitbetalingsschema
**Code:** ✅ Stripe transfer systeem

### ✅ "Baasje annuleert vaak?"
**FAQ:** Account kan beperkt worden
**Code:** ✅ Admin management tools

### ⚠️ "Kan ik als verzorger annuleren?"
**FAQ:** "Alleen via TailTribe Support"
**Code:** ⚠️ Verzorger KAN status wijzigen via API
**CONFLICT:** FAQ zegt "alleen via support", maar code geeft directe mogelijkheid
**ACTION NEEDED:** Beslissen wat het moet zijn!

### ✅ "Wat moet ik doen bij annuleren?"
**FAQ:** 
1. Verwittig baasje
2. Contact TailTribe Support
3. Help met vervanger

**Code:** ⚠️ Geen "suggest replacement" functie
**NOTE:** Messaging kan gebruikt worden

### ✅ "Meerdere annuleringen gevolgen?"
**FAQ:** Account kan beperkt/verwijderd worden
**Code:** ✅ Admin tools aanwezig

### ✅ "Profiel aanmaken?"
**FAQ:** Profiel bewerken → services → foto's
**Code:** ✅ `/profile/edit` + onboarding

### ✅ "Beschikbaarheid instellen?"
**FAQ:** Beschikbaarheid pagina → weekschema's
**Code:** ✅ Availability calendar

### ✅ "Betalingen ontvangen?"
**FAQ:** Koppel Stripe, bekijk geschiedenis en facturen
**Code:** ✅ `/settings/payment` voor Stripe Connect

### ✅ "Berichten en boekingsverzoeken?"
**FAQ:** Reageer via Berichten, bevestig/weiger
**Code:** ✅ Booking status API (accept/decline)

### ✅ "Contactgegevens delen?"
**FAQ:** Nee, worden gemaskeerd
**Code:** ⚠️ Geen masking geïmplementeerd (kan nog toegevoegd)
**NOTE:** Low priority - users kunnen manueel contacten

### ✅ "Review rapporteren?"
**FAQ:** Review rapporteren button of via Contact
**Code:** ✅ Report button op reviews pagina

---

## 🚨 KRITIEKE DISCREPANCIES:

### 1. **RECURRING BOOKINGS** ❌
**FAQ:** "Ja. Spreek vast schema af"
**Code:** ONTBREEKT
**Impact:** HIGH - veel users willen wekelijkse walks

### 2. **EMERGENCY CONTACTS** ❌
**FAQ:** "Spreek vooraf noodprocedure af"
**Code:** ONTBREEKT
**Impact:** HIGH - veiligheid!

### 3. **CANCEL BUTTON IN BOOKING DETAIL** ⚠️
**FAQ:** "Dashboard → Boekingen → Annuleren"
**Code:** API bestaat, UI button ontbreekt
**Impact:** MEDIUM - users kunnen niet makkelijk annuleren

### 4. **VERZORGER ANNULERING CONFLICT** ⚠️
**FAQ:** Zegt "alleen via support"
**Code:** API geeft directe mogelijkheid
**Impact:** MEDIUM - policy inconsistency

### 5. **OFF-LEASH CHECKBOX** ⚠️
**FAQ:** Spreekt over "mag loslopen"
**Code:** Niet in booking form
**Impact:** LOW - kan via special instructions

### 6. **CONTACT MASKING** ⚠️
**FAQ:** "Contactgegevens worden gemaskeerd"
**Code:** Niet geïmplementeerd
**Impact:** LOW - users kunnen handmatig omzeilen

---

## 🎯 AANBEVOLEN ACTIES:

### PRIORITY 1 (MUST FIX):
1. ✅ Emergency contact field in bookings
2. ✅ Cancel button in booking detail UI
3. ✅ Recurring bookings systeem
4. ⚠️ Beslissen: mogen verzorgers direct annuleren of alleen via support?

### PRIORITY 2 (SHOULD FIX):
5. Off-leash checkbox in booking
6. Payment history voor owners
7. Contact masking in messages

**Wil je dat ik Priority 1 implementeer?**





