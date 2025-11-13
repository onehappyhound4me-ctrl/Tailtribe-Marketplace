# 🗺️ TailTribe - Kaart Test Guide

**Datum:** _______________  
**Tester:** _______________  

---

## 📊 **KAART OVERZICHT**

### Waar wordt de kaart gebruikt:
- **Search pagina** (`/search`) - Toont verzorgers op de kaart
- **Dashboard** - Nearby caregivers map (als beschikbaar)

### Kaart Functionaliteit:
- Toont verzorgers met geldige coördinaten (lat/lng)
- Markers voor elke verzorger
- Klik op marker → Selecteer verzorger
- Afstand wordt getoond (als gebruiker locatie beschikbaar is)

---

## ✅ **TEST 1: Kaart Verschijnt op Search Pagina** (~5 min)

### Stap 1: Ga naar Search Pagina
1. [ ] Ga naar `https://tailtribe.be/search`
2. [ ] **Verwacht:** Search pagina laadt
3. [ ] Scroll naar beneden naar kaart sectie
4. [ ] **Verwacht:** Kaart sectie is zichtbaar met titel "Verzorgers op de kaart"

### Stap 2: Verifieer Kaart Rendering
- [ ] **Verwacht:** Kaart wordt geladen (niet leeg)
- [ ] **Verwacht:** Kaart toont België/Nederland gebied
- [ ] **Verwacht:** Geen JavaScript errors in console (F12)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 2: Verzorgers Verschijnen op Kaart** (~10 min)

### Stap 1: Zorg voor Verzorgers met Coördinaten
**Voorwaarde:** Er moeten verzorgers zijn met `lat` en `lng` in de database.

**Te controleren:**
- [ ] Log in als Admin of check database
- [ ] Verifieer dat er verzorgers zijn met:
  - `lat` (latitude) is ingevuld
  - `lng` (longitude) is ingevuld
  - `isApproved: true`

**Voorbeeld coördinaten:**
- Brussel: `lat: 50.8503, lng: 4.3517`
- Antwerpen: `lat: 51.2194, lng: 4.4025`
- Gent: `lat: 51.0543, lng: 3.7174`

### Stap 2: Check Kaart Markers
1. [ ] Ga naar `/search`
2. [ ] **Verwacht:** Markers verschijnen op de kaart
3. [ ] **Verwacht:** Aantal markers = aantal verzorgers met coördinaten
4. [ ] **Verwacht:** Markers staan op de juiste locaties

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 3: Marker Interactie** (~10 min)

### Stap 1: Klik op Marker
1. [ ] Klik op een marker op de kaart
2. [ ] **Verwacht:** Marker wordt geselecteerd (visuele feedback)
3. [ ] **Verwacht:** Verzorger card wordt geselecteerd in de lijst
4. [ ] **Verwacht:** Scroll naar verzorger card (als beschikbaar)

### Stap 2: Selecteer Verzorger uit Lijst
1. [ ] Klik op een verzorger card in de lijst
2. [ ] **Verwacht:** Marker op kaart wordt geselecteerd
3. [ ] **Verwacht:** Kaart zoomt naar marker (als beschikbaar)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 4: Afstand Weergave** (~10 min)

### Stap 1: Log in als Owner met Locatie
**Voorwaarde:** Owner moet `lat` en `lng` hebben in profiel.

1. [ ] Log in als Owner
2. [ ] Ga naar Settings → Profiel
3. [ ] Zorg dat je locatie is ingesteld (postcode/city)
4. [ ] **Verwacht:** `lat` en `lng` worden automatisch ingevuld

### Stap 2: Check Afstand op Kaart
1. [ ] Ga naar `/search`
2. [ ] **Verwacht:** Kaart toont afstand tot verzorgers
3. [ ] **Verwacht:** Afstand wordt getoond in kilometers (bijv. "2.5 km")
4. [ ] **Verwacht:** Afstand is correct berekend

**Test berekening:**
- Owner locatie: Brussel (50.8503, 4.3517)
- Verzorger locatie: Antwerpen (51.2194, 4.4025)
- **Verwacht afstand:** ~41 km

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 5: Kaart met Filters** (~10 min)

### Stap 1: Filter op Stad
1. [ ] Ga naar `/search`
2. [ ] Selecteer een stad in filters (bijv. "Brussel")
3. [ ] **Verwacht:** Kaart toont alleen verzorgers in die stad
4. [ ] **Verwacht:** Markers worden gefilterd

### Stap 2: Filter op Service
1. [ ] Selecteer een service (bijv. "Hondenuitlaat")
2. [ ] **Verwacht:** Kaart toont alleen verzorgers met die service
3. [ ] **Verwacht:** Markers worden bijgewerkt

### Stap 3: Combineer Filters
1. [ ] Selecteer stad + service + max prijs
2. [ ] **Verwacht:** Kaart toont alleen matching verzorgers
3. [ ] **Verwacht:** Markers worden correct gefilterd

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 6: Kaart zonder Coördinaten** (~5 min)

### Stap 1: Verzorgers zonder Locatie
**Scenario:** Verzorger heeft geen `lat`/`lng` in database.

1. [ ] Zorg dat er een verzorger is zonder coördinaten
2. [ ] Ga naar `/search`
3. [ ] **Verwacht:** Verzorger verschijnt NIET op kaart
4. [ ] **Verwacht:** Verzorger verschijnt WEL in lijst
5. [ ] **Verwacht:** Geen errors in console

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 7: Kaart Performance** (~5 min)

### Stap 1: Veel Verzorgers
1. [ ] Zorg dat er 20+ verzorgers zijn met coördinaten
2. [ ] Ga naar `/search`
3. [ ] **Verwacht:** Kaart laadt binnen 2-3 seconden
4. [ ] **Verwacht:** Alle markers worden getoond
5. [ ] **Verwacht:** Geen performance issues

### Stap 2: Kaart Interactie
1. [ ] Zoom in/uit op kaart
2. [ ] **Verwacht:** Soepele animatie
3. [ ] **Verwacht:** Markers blijven zichtbaar
4. [ ] Pan over kaart
5. [ ] **Verwacht:** Kaart reageert snel

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 8: Mobile Kaart** (~10 min)

### Stap 1: Test op Mobile Device
1. [ ] Open site op mobile (of gebruik browser dev tools)
2. [ ] Ga naar `/search`
3. [ ] **Verwacht:** Kaart is zichtbaar op mobile
4. [ ] **Verwacht:** Kaart is goed leesbaar
5. [ ] **Verwacht:** Markers zijn klikbaar

### Stap 2: Touch Interactie
1. [ ] Tap op marker
2. [ ] **Verwacht:** Marker wordt geselecteerd
3. [ ] Pinch to zoom
4. [ ] **Verwacht:** Zoom werkt
5. [ ] Swipe over kaart
6. [ ] **Verwacht:** Pan werkt

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 9: Kaart API Key** (~5 min)

### Stap 1: Check Map Provider
**Veelvoorkomende providers:**
- Google Maps (vereist API key)
- Mapbox (vereist API key)
- Leaflet/OpenStreetMap (gratis, geen key nodig)

**Te controleren:**
- [ ] Check welke map provider wordt gebruikt
- [ ] **Als Google Maps/Mapbox:** Verifieer dat API key is ingesteld
- [ ] **Verwacht:** Kaart laadt zonder "API key missing" errors
- [ ] Check console voor errors

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 10: Kaart met Geen Resultaten** (~5 min)

### Stap 1: Geen Verzorgers Match
1. [ ] Ga naar `/search`
2. [ ] Selecteer filters die geen resultaten geven (bijv. stad die niet bestaat)
3. [ ] **Verwacht:** Kaart sectie wordt NIET getoond (of toont "Geen verzorgers")
4. [ ] **Verwacht:** Geen errors in console

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## 🔍 **QUICK CHECK: Database Query**

### Check verzorgers met coördinaten:
```sql
SELECT 
  id,
  city,
  lat,
  lng,
  "isApproved"
FROM "CaregiverProfile"
WHERE lat IS NOT NULL 
  AND lng IS NOT NULL
  AND "isApproved" = true
LIMIT 10;
```

### Check owners met locatie:
```sql
SELECT 
  id,
  email,
  city,
  lat,
  lng
FROM users
WHERE role = 'OWNER'
  AND lat IS NOT NULL
  AND lng IS NOT NULL
LIMIT 10;
```

---

## 📋 **TEST SAMENVATTING**

### Totaal Tests: 10 categorieën
### Geslaagd: ___ / 10
### Gefaald: ___ / 10

### Gevonden Issues:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Opmerkingen:
_________________________________________________
_________________________________________________

---

## ✅ **VERIFICATIE CHECKLIST**

Voor productie launch, verifieer:

- [ ] Kaart verschijnt op search pagina
- [ ] Verzorgers met coördinaten verschijnen op kaart
- [ ] Markers zijn klikbaar en selecteren verzorger
- [ ] Afstand wordt getoond (als owner locatie beschikbaar)
- [ ] Filters werken met kaart
- [ ] Kaart werkt op mobile
- [ ] Geen JavaScript errors
- [ ] Performance is acceptabel (laadt snel)
- [ ] Kaart API key is ingesteld (als nodig)

---

## 🚀 **QUICK TEST (5 minuten)**

**Minimale verificatie:**

1. [ ] Ga naar `https://tailtribe.be/search`
2. [ ] **Verwacht:** Kaart sectie is zichtbaar
3. [ ] **Verwacht:** Markers verschijnen (als verzorgers met coördinaten)
4. [ ] [ ] Klik op marker → **Verwacht:** Verzorger wordt geselecteerd
5. [ ] Check console (F12) → **Verwacht:** Geen errors

**Als dit werkt:** Kaart functionaliteit is basis OK ✅

---

**Laatste update:** 2025-01-13  
**Versie:** 1.0

