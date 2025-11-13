# 🗺️ Check Kaart Status

## ✅ **WANNEER ZIE JE DE KAART?**

De kaart verschijnt alleen als:
1. ✅ Er zijn verzorgers in de database
2. ✅ Die verzorgers hebben `lat` en `lng` coördinaten
3. ✅ Ze zijn goedgekeurd (`isApproved: true`)
4. ✅ Je bent op `/search` pagina

---

## 🔍 **QUICK CHECK**

### Stap 1: Ga naar Search Pagina
1. Open `https://tailtribe.be/search`
2. Scroll naar beneden
3. **Als je de kaart ziet:** ✅ Alles werkt!
4. **Als je de kaart NIET ziet:** Zie hieronder

---

## ❌ **WAAROM ZIE IK DE KAART NIET?**

### Mogelijke redenen:

#### 1. Geen verzorgers met coördinaten
**Probleem:** Verzorgers hebben geen `lat`/`lng` in database

**Oplossing:**
- Verzorgers moeten een locatie hebben (stad/postcode)
- Coördinaten worden automatisch ingevuld bij registratie
- Of handmatig via geocoding API

#### 2. Geen goedgekeurde verzorgers
**Probleem:** Verzorgers zijn niet goedgekeurd (`isApproved: false`)

**Oplossing:**
- Log in als Admin
- Ga naar `/admin`
- Keur verzorgers goed

#### 3. Geen verzorgers in database
**Probleem:** Er zijn helemaal geen verzorgers

**Oplossing:**
- Registreer een test verzorger
- Of gebruik seed scripts

---

## ✅ **HOE TE CHECKEN**

### Database Query:
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
  AND "isApproved" = true;
```

**Als dit 0 resultaten geeft:** Geen verzorgers met coördinaten → Kaart wordt niet getoond

**Als dit 1+ resultaten geeft:** Kaart zou moeten verschijnen

---

## 🧪 **TEST: Maak Test Verzorger met Coördinaten**

### Optie 1: Via UI
1. Registreer als verzorger
2. Vul stad/postcode in (bijv. "Brussel" of "1000")
3. Coördinaten worden automatisch ingevuld
4. Keur goed als Admin
5. Ga naar `/search`
6. **Verwacht:** Kaart verschijnt

### Optie 2: Via Database
```sql
-- Update bestaande verzorger met coördinaten
UPDATE "CaregiverProfile"
SET 
  lat = 50.8503,  -- Brussel
  lng = 4.3517,
  "isApproved" = true
WHERE id = 'YOUR_CAREGIVER_ID';
```

---

## 📍 **WAAR STAAT DE KAART?**

De kaart staat op:
- **URL:** `https://tailtribe.be/search`
- **Locatie:** Na de filters, boven de verzorger cards
- **Titel:** "Verzorgers op de kaart (X)"

---

## 🎯 **QUICK TEST**

1. [ ] Ga naar `https://tailtribe.be/search`
2. [ ] Scroll naar beneden
3. [ ] **Zie je "Verzorgers op de kaart"?** → ✅ Kaart werkt!
4. [ ] **Zie je alleen verzorger cards?** → Geen verzorgers met coördinaten

---

## 💡 **TIP**

Als je de kaart niet ziet, check de browser console (F12):
- Zoek naar `🗺️ Kaart check:` log
- Dit toont hoeveel verzorgers coördinaten hebben

---

**Laatste update:** 2025-01-13

