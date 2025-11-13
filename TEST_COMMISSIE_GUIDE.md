# 💰 TailTribe - Commissie Test Guide

**Datum:** _______________  
**Tester:** _______________  

---

## 📊 **COMMISSIE OVERZICHT**

### Huidige Commissie Instellingen:
- **Platform Commissie:** 20% (van elke boeking)
- **Verzorger Ontvangt:** 80% (van elke boeking)
- **Configuratie:** `src/lib/constants.ts` → `PLATFORM_CONFIG.COMMISSION_PERCENTAGE = 20`

---

## ✅ **TEST 1: Commissie Berekening** (~10 min)

### Stap 1: Maak een Test Boeking
1. [ ] Log in als **Owner**
2. [ ] Zoek een verzorger met een **bekend uurtarief** (bijv. €25/uur)
3. [ ] Maak een boeking voor **2 uur** (bijv. 10:00 - 12:00)
4. [ ] **Verwacht totaal bedrag:** €50 (2 uur × €25)

### Stap 2: Verifieer Commissie Berekening
**Voorbeeld berekening:**
- Totaal bedrag: €50.00
- Platform commissie (20%): €10.00
- Verzorger ontvangt (80%): €40.00

**Te controleren:**
- [ ] Check de payment pagina (voor betaling)
- [ ] **Verwacht:** Commissie breakdown is zichtbaar
- [ ] **Verwacht:** Platform fee = €10.00 (20%)
- [ ] **Verwacht:** Verzorger ontvangt = €40.00 (80%)

### Stap 3: Check Database
- [ ] Open database (via Prisma Studio of direct query)
- [ ] Zoek de booking record
- [ ] **Verwacht:** `amountCents` = 5000 (€50.00)
- [ ] **Verwacht:** `platformFeeCents` = 1000 (€10.00)
- [ ] **Verwacht:** `caregiverAmountCents` = 4000 (€40.00)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 2: Payment & Commissie Opslag** (~15 min)

### Stap 1: Betaal de Boeking
1. [ ] Ga naar payment pagina
2. [ ] Gebruik Stripe test card: `4242 4242 4242 4242`
3. [ ] Voltooi de betaling
4. [ ] **Verwacht:** Payment succesvol

### Stap 2: Verifieer Database Update
- [ ] Check booking record in database
- [ ] **Verwacht:** `status` = "PAID"
- [ ] **Verwacht:** `paidAt` is ingevuld
- [ ] **Verwacht:** `platformFeeCents` is correct opgeslagen
- [ ] **Verwacht:** `caregiverAmountCents` is correct opgeslagen

### Stap 3: Check Stripe Dashboard
- [ ] Log in op Stripe Dashboard (test mode)
- [ ] Ga naar **Payments** → Zoek de payment
- [ ] **Verwacht:** Payment Intent heeft `application_fee_amount`
- [ ] **Verwacht:** Application fee = €10.00 (20% van €50)
- [ ] **Verwacht:** Transfer naar verzorger = €40.00

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 3: Admin Revenue Dashboard** (~10 min)

### Stap 1: Check Admin Stats API
1. [ ] Log in als **ADMIN** gebruiker
2. [ ] Ga naar `/admin` dashboard (als beschikbaar)
3. [ ] Of maak direct API call naar `/api/admin/stats`

### Stap 2: Verifieer Revenue Totaal
**API Response verwachting:**
```json
{
  "stats": {
    "totalRevenue": 10.00,  // Som van alle platformFeeCents / 100
    "totalBookings": 1,
    ...
  }
}
```

**Te controleren:**
- [ ] **Verwacht:** `totalRevenue` = som van alle `platformFeeCents` van PAID bookings
- [ ] **Verwacht:** Revenue wordt getoond in euro's (niet cents)
- [ ] **Verwacht:** Revenue is correct berekend (20% van alle betaalde boekingen)

### Stap 3: Test met Meerdere Bookings
- [ ] Maak 3 test bookings:
  - Booking 1: €50 → Commissie €10
  - Booking 2: €100 → Commissie €20
  - Booking 3: €75 → Commissie €15
- [ ] Betaal alle 3
- [ ] **Verwacht:** Totaal revenue = €45 (€10 + €20 + €15)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 4: Verzorger Earnings** (~10 min)

### Stap 1: Check Verzorger Dashboard
1. [ ] Log in als **Caregiver**
2. [ ] Ga naar earnings/earnings pagina (als beschikbaar)
3. [ ] Of check `/api/earnings` endpoint

### Stap 2: Verifieer Verzorger Ontvangt
**Te controleren:**
- [ ] **Verwacht:** Verzorger ziet hoeveel hij ontvangt (80% van boeking)
- [ ] **Verwacht:** Platform commissie is transparant getoond
- [ ] **Verwacht:** Earnings zijn correct berekend

**Voorbeeld:**
- Boeking: €50
- Verzorger ziet: "Je ontvangt €40.00 (80%)"
- Platform commissie: "TailTribe commissie: €10.00 (20%)"

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 5: Stripe Connect Transfer** (~15 min)

### Stap 1: Verifieer Stripe Connect Setup
- [ ] Check of verzorger een Stripe Connect account heeft
- [ ] **Verwacht:** Verzorger heeft `stripeAccountId` in database
- [ ] **Verwacht:** Stripe Connect is geconfigureerd

### Stap 2: Test Transfer naar Verzorger
**In Stripe Dashboard:**
- [ ] Ga naar **Transfers** sectie
- [ ] Zoek transfers naar verzorger account
- [ ] **Verwacht:** Transfer wordt automatisch aangemaakt na payment
- [ ] **Verwacht:** Transfer amount = verzorger ontvangt (80%)
- [ ] **Verwacht:** Application fee blijft op platform account

**Voorbeeld:**
- Payment: €50
- Transfer naar verzorger: €40
- Application fee op platform: €10

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## ✅ **TEST 6: Edge Cases** (~10 min)

### Test 6.1: Afronding
- [ ] Maak boeking met bedrag dat niet mooi deelbaar is
- [ ] Bijv.: €33.33 (1.33 uur × €25)
- [ ] **Verwacht:** Commissie wordt correct afgerond
- [ ] **Verwacht:** Geen verlies door afronding

**Voorbeeld:**
- Totaal: €33.33
- Commissie (20%): €6.67 (afgerond)
- Verzorger: €26.66

### Test 6.2: Grote Bedragen
- [ ] Maak boeking met groot bedrag (bijv. €500)
- [ ] **Verwacht:** Commissie = €100 (20%)
- [ ] **Verwacht:** Verzorger = €400 (80%)

### Test 6.3: Kleine Bedragen
- [ ] Maak boeking met klein bedrag (bijv. €5)
- [ ] **Verwacht:** Commissie = €1 (20%)
- [ ] **Verwacht:** Verzorger = €4 (80%)

**Resultaat:** ☐ Geslaagd ☐ Gefaald  
**Notities:** _________________________________________________

---

## 📊 **COMMISSIE VERIFICATIE FORMULE**

### Handmatige Berekening:
```
Totaal Bedrag = Uren × Uurtarief
Platform Commissie = Totaal Bedrag × 0.20 (20%)
Verzorger Ontvangt = Totaal Bedrag × 0.80 (80%)

Verificatie: Platform Commissie + Verzorger Ontvangt = Totaal Bedrag
```

### Database Velden:
- `amountCents`: Totaal bedrag in cents (bijv. 5000 = €50.00)
- `platformFeeCents`: Platform commissie in cents (bijv. 1000 = €10.00)
- `caregiverAmountCents`: Verzorger ontvangt in cents (bijv. 4000 = €40.00)

---

## 🔍 **QUICK CHECK: Database Query**

### Check alle betaalde boekingen:
```sql
SELECT 
  id,
  amountCents / 100.0 as total_amount,
  platformFeeCents / 100.0 as platform_fee,
  caregiverAmountCents / 100.0 as caregiver_receives,
  status
FROM bookings
WHERE status = 'PAID'
ORDER BY createdAt DESC;
```

### Check totale revenue:
```sql
SELECT 
  SUM(platformFeeCents) / 100.0 as total_revenue
FROM bookings
WHERE status = 'PAID';
```

---

## 📋 **TEST SAMENVATTING**

### Totaal Tests: 6 categorieën
### Geslaagd: ___ / 6
### Gefaald: ___ / 6

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

- [ ] Commissie wordt correct berekend (20%)
- [ ] Commissie wordt opgeslagen in database
- [ ] Admin dashboard toont totale revenue
- [ ] Verzorger ziet correcte earnings (80%)
- [ ] Stripe transfers werken correct
- [ ] Edge cases (afronding) werken correct
- [ ] Geen verlies door afronding fouten

---

**Laatste update:** 2025-01-13  
**Versie:** 1.0

