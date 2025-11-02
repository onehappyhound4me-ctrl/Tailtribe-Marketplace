# 🔍 Caregiver Data Inconsistentie Check

## ⚠️ **ZELFDE PROBLEEM BIJ CAREGIVERS!**

### **Meerdere Plekken voor Caregiver Data:**

#### **1. Onboarding**
```
/onboarding/caregiver-new (5 steps)
├── Step 1: Profiel (city, bio, phone)
├── Step 2: Services (services, animalTypes, servicePrices)
├── Step 3: Badges (insurance, certificates)
├── Step 4: Availability (days, times, weeklyJson)
└── Step 5: Payout (IBAN, commission)

→ Slaat ALLES op in CaregiverProfile tabel
```

#### **2. Profile Edit**
```
/profile/edit
├── Naam
├── Bio
├── Stad
├── Services (lijst)
├── Hourly Rate
└── Photo

→ Update via /api/profile/update
→ Maar NIET: availability, servicePrices, badges!
```

#### **3. Schedule/Availability**
```
/schedule/availability
├── Weekly schedule (per dag, per tijdslot)
├── Exceptions (specifieke datums)
└── Opslaan

→ Update via /api/availability
→ Slaat op in Availability tabel (weeklyJson, exceptions)
→ NIET in CaregiverProfile.availabilityData!
```

---

## 🚨 **KRITIEKE INCONSISTENTIES**

### **Probleem 1: Availability in 2 Plekken**

#### **Onboarding slaat op:**
```javascript
CaregiverProfile.availabilityData = {
  "days": ["MA", "DI", "WO"],
  "from": "09:00",
  "to": "18:00"
}
```

#### **Schedule pagina slaat op:**
```javascript
Availability.weeklyJson = {
  "monday": [{"start": "09:00", "end": "17:00"}],
  "tuesday": [{"start": "09:00", "end": "17:00"}]
}

Availability.exceptions = {
  "2025-10-21": {"available": false}
}
```

#### **Booking gebruikt:**
```javascript
// Eerst: CaregiverProfile.availabilityData
// Dan: Availability.weeklyJson (via exactDailySlots)
```

**Result:**
⚠️ **CONFLICT! Welke data is leidend?**

---

### **Probleem 2: Pricing in 2 Plekken**

#### **Onboarding:**
```javascript
CaregiverProfile.servicePrices = {
  "DOG_WALKING": 15,
  "PET_SITTING": 20,
  "PET_BOARDING": 25
}

CaregiverProfile.hourlyRate = 25 (default?)
```

#### **Profile Edit:**
```javascript
CaregiverProfile.hourlyRate = 18 (update)
// Maar servicePrices wordt NIET geupdate!
```

#### **Booking gebruikt:**
```javascript
caregiver.hourlyRate = 18
// Ignoreert servicePrices!
```

**Result:**
⚠️ **MISMATCH! Per-service prijzen worden niet gebruikt!**

---

### **Probleem 3: Services Update**

#### **Onboarding:**
```javascript
CaregiverProfile.services = ["DOG_WALKING", "PET_SITTING", "HOME_CARE"]
```

#### **Profile Edit:**
```javascript
// Kan services updaten
CaregiverProfile.services = ["DOG_WALKING", "PET_BOARDING"]
// Maar servicePrices blijft oud!
```

**Result:**
⚠️ **Orphaned prices! PET_SITTING prijs blijft in servicePrices!**

---

## 📊 **DATA FLOW VERGELIJKING**

### **OWNER (Pets):**
```
3 plekken:
├── Onboarding → Pet tabel
├── Booking → Booking tabel (duplicate!)
└── Pet Edit → Pet tabel

Probleem: Dubbele data in Booking
```

### **CAREGIVER (Services/Availability):**
```
3 plekken:
├── Onboarding → CaregiverProfile (availabilityData + servicePrices)
├── Profile Edit → CaregiverProfile (hourlyRate, services)
└── Schedule → Availability tabel (weeklyJson, exceptions)

Probleem: Data verspreid over 2 tabellen + conflicts
```

**CAREGIVER PROBLEEM IS ERGER!**

---

## ✅ **OPLOSSINGEN**

### **Voor CAREGIVERS:**

#### **Oplossing 1: Unify Availability (CRITICAL)**
```
Kies 1 bron voor availability:
A) Availability.weeklyJson (gedetailleerd)
B) CaregiverProfile.availabilityData (simpel)

Aanbeveling: A (Availability.weeklyJson)
├── Meer flexibel
├── Per-dag tijdslots
├── Exceptions support
└── Booking gebruikt dit al

Action:
1. Deprecate CaregiverProfile.availabilityData
2. Alle code moet Availability.weeklyJson gebruiken
3. Onboarding moet Availability record aanmaken
```

#### **Oplossing 2: Service Prices Consistency**
```
Kies pricing model:
A) Per-service prijzen (servicePrices)
B) Enkel hourlyRate

Aanbeveling: B (hourlyRate)
├── Simpeler
├── Standaard marketplace model
├── Makkelijker te berekenen

Action:
1. Verwijder servicePrices uit onboarding
2. Vraag alleen hourlyRate
3. Profile edit kan hourlyRate updaten
```

#### **Oplossing 3: Profile Edit Uitbreiden**
```
/profile/edit moet kunnen updaten:
├── Bio, city, phone ✅ (al mogelijk)
├── Services ✅ (al mogelijk)
├── Hourly rate ✅ (al mogelijk)
├── Availability → Link naar /schedule/availability
├── Badges → Nieuwe pagina /profile/badges
└── Payout → Link naar /settings/payment

Action:
1. Profile edit = master control panel
2. Deep settings op aparte paginas
3. Clear navigation
```

---

## 🛠️ **PRIORITEIT FIXES**

### **CRITICAL (Must Fix):**

#### **1. Availability Unification**
```typescript
// In booking form, ONLY use Availability table
const caregiver = await db.caregiverProfile.findUnique({
  include: {
    availability: true // Always use this
  }
})

// Ignore CaregiverProfile.availabilityData
// Use caregiver.availability.weeklyJson
```

#### **2. Onboarding Must Create Availability**
```typescript
// src/app/api/caregiver/onboarding/complete/route.ts

// After creating CaregiverProfile:
await db.availability.create({
  data: {
    caregiverId: profile.id,
    weeklyJson: JSON.stringify({
      monday: [{ start: "09:00", end: "17:00" }],
      // ... based on onboarding form
    }),
    exceptions: JSON.stringify({})
  }
})
```

#### **3. Remove servicePrices**
```
Onboarding:
- ❌ Delete Step "Prijzen per service"
- ✅ Keep Step "Uurtarief"
- ✅ hourlyRate = leidend tarief

Profile Edit:
- ✅ Update hourlyRate mogelijk
```

---

### **IMPORTANT (Should Fix):**

#### **4. Profile Edit Navigation**
```jsx
/profile/edit
├── Basic info (name, bio, city)
├── Services & hourly rate
└── Quick links:
    ├── [Beschikbaarheid Instellen] → /schedule/availability
    ├── [Badges Beheren] → /profile/badges (TODO)
    └── [Payout Instellingen] → /settings/payment
```

#### **5. Dashboard Availability Widget**
```jsx
// Show current availability status
<AvailabilityWidget>
  ✅ Beschikbaar: Ma-Vr, Overdag
  [Wijzig] → /schedule/availability
</AvailabilityWidget>
```

---

## 📋 **COMPLETE FIX CHECKLIST**

### **Phase 1: Availability (2-3 uur)**
- [ ] Update onboarding: Create Availability record
- [ ] Deprecate CaregiverProfile.availabilityData
- [ ] All booking code: Use Availability.weeklyJson only
- [ ] Test: Caregiver onboarding → booking werkt
- [ ] Test: Schedule update → booking ziet wijzigingen

### **Phase 2: Pricing (1 uur)**
- [ ] Remove servicePrices from onboarding
- [ ] Only ask hourlyRate
- [ ] Update booking to always use hourlyRate
- [ ] Remove servicePrices references

### **Phase 3: Profile Edit (1 uur)**
- [ ] Add links to specialty pages
- [ ] Show current availability summary
- [ ] Can update hourlyRate
- [ ] Clear navigation

---

## 🎯 **IMPACT ANALYSIS**

### **Als NIET Gefixed:**
```
Caregiver registreert:
├── Stelt availability in tijdens onboarding
│   → CaregiverProfile.availabilityData
│
├── Later: Update via /schedule/availability
│   → Availability.weeklyJson
│
└── Booking checkt BEIDE:
    ├── Eerst: availabilityData (oud)
    └── Dan: weeklyJson (nieuw)
    
Result:
❌ Conflict tussen oude en nieuwe data
❌ Caregiver begrijpt niet waarom calendar niet werkt
❌ Bookings mogelijk op verkeerde tijden
```

### **Als WEL Gefixed:**
```
Caregiver registreert:
├── Onboarding maakt Availability record ✅
│
├── Later: Update via /schedule/availability
│   → Availability.weeklyJson ✅
│
└── Booking checkt ALLEEN weeklyJson ✅
    
Result:
✅ Consistency
✅ Duidelijk voor caregiver
✅ Bookings alleen op beschikbare tijden
```

---

## ⚡ **QUICK DECISION NEEDED**

### **Voor Caregiver Registratie Test:**

**Optie A: Fix Nu (3-4 uur)**
- Unify availability eerst
- Dan pas testen
- Garantie dat het werkt

**Optie B: Test Eerst, Fix Later**
- Test huidige flow
- Identificeer problemen
- Fix daarna

**🎯 AANBEVELING: Optie A (Fix Nu)**
Waarom?
- Anders test je een broken flow
- Availability is kritiek voor booking
- Beter 1x goed doen

---

## 🚨 **CAREGIVER HEEFT MEER PROBLEMEN DAN OWNER!**

```
Owner:
⚠️ Pet data duplicatie in Booking
→ Fix: Pet selector (1.5u)

Caregiver:
⚠️ Availability in 2 tabellen + conflict
⚠️ ServicePrices vs hourlyRate mismatch
⚠️ Profile edit incomplete
→ Fix: Availability unification (3-4u)
```

**Caregiver issues zijn kritischer voor booking functionaliteit!**

---

**Wil je dat ik eerst de caregiver availability fix, of toch eerst de owner pet selector?**





















