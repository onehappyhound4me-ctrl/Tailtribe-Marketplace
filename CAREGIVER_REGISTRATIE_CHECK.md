# 🔍 Caregiver Registratie Flow - Volledige Check

## 🔄 **COMPLETE FLOW**

### **Step 1: Account Aanmaken**
```
/auth/register
├── Voornaam
├── Achternaam
├── Email
├── Wachtwoord
└── Rol: CAREGIVER

→ Account aangemaakt in User tabel
→ Auto-login
→ Redirect naar onboarding
```

### **Step 2: Onboarding (5 Steps)**

#### **Welke Onboarding Pagina?**
Er zijn 2 versies:
1. `/onboarding/caregiver` (oude versie - simpel)
2. `/onboarding/caregiver-new` (nieuwe versie - uitgebreid)

**Redirect gaat naar:** `/onboarding/caregiver-new` (regel 208 in register page)

---

## 📋 **CAREGIVER-NEW ONBOARDING (Huidige Flow)**

### **Step 1: Profiel Basis**
```
├── Profielfoto (upload)
├── Postcode *
├── Stad *
├── Actieradius (km) *
├── Land *
├── Bio/Beschrijving *
```

### **Step 2: Services & Prijzen**
```
├── Services (meerdere selecteren):
│   ├── DOG_WALKING
│   ├── PET_SITTING
│   ├── PET_BOARDING
│   └── ... (meer services)
│
├── Diersoorten (unified list):
│   ├── 🐕 Hond
│   ├── 🐈 Kat
│   ├── 🐹 Kleine huisdieren
│   └── ...
│
├── Dier groottes:
│   ├── SMALL (<10kg)
│   ├── MEDIUM (10-25kg)
│   └── LARGE (>25kg)
│
├── Max aantal dieren tegelijk *
│
└── Prijzen per service:
    ├── Hondenuitlaat: €__ /uur
    ├── Oppas: €__ /uur
    └── ...
```

### **Step 3: Badges & Certificaten**
```
├── Verzekering:
│   ├── Heeft verzekering? (ja/nee)
│   ├── Verzekering nummer
│   └── Verloopt op (datum)
│
├── Eerste hulp certificaat? (ja/nee)
│
└── Ondernemingsnummer (optioneel)
```

### **Step 4: Beschikbaarheid**
```
├── Dagen (selecteer meerdere):
│   ├── ☐ Maandag
│   ├── ☐ Dinsdag
│   └── ...
│
├── Tijdslots (selecteer meerdere):
│   ├── ☐ Ochtend (06:00-12:00)
│   ├── ☐ Overdag (09:00-17:00)
│   └── ☐ Avond (17:00-22:00)
│
└── Annuleringsbeleid *
```

### **Step 5: Payout Info**
```
├── IBAN nummer *
├── Naam rekeninghouder *
├── ☐ Akkoord met 20% commissie *
└── ☐ Akkoord met platform regels *
```

---

## ✅ **WAT ER GOED IS**

### **Functionaliteit:**
- ✅ 5-step wizard met validatie
- ✅ Photo upload
- ✅ Unified animal types
- ✅ Multiple services
- ✅ Custom pricing per service
- ✅ Availability system
- ✅ Insurance tracking
- ✅ IBAN voor payouts

### **User Experience:**
- ✅ Progress indicator
- ✅ Validatie per step
- ✅ Back/Next buttons
- ✅ Dutch labels
- ✅ Help text

### **Database:**
- ✅ CaregiverProfile aangemaakt
- ✅ isApproved = false (admin moet goedkeuren)
- ✅ Alle data opgeslagen

---

## ⚠️ **MOGELIJKE ISSUES**

### **1. Availability Data Format**
**Oude Flow (`/onboarding/caregiver`):**
```javascript
availability: JSON.stringify({
  days: ['MA', 'DI', 'WO'],
  from: '09:00',
  to: '18:00'
})
```

**Nieuwe Flow (`/onboarding/caregiver-new`):**
```javascript
availabilityData: JSON.stringify({
  days: ['MA', 'DI', 'WO'],
  times: ['OVERDAG', 'AVOND']
  // Mogelijk daySpecific?
})
```

**Probleem:** 
⚠️ Format moet consistent zijn met booking calendar!

### **2. Pricing Structure**
**Onboarding vraagt:**
- Per-service prijzen (Hondenuitlaat: €15, Oppas: €20, etc.)

**Booking gebruikt:**
- `hourlyRate` (enkel tarief)

**Probleem:**
⚠️ Mismatch tussen onboarding (per-service) en booking (hourly rate)

### **3. Admin Approval**
**Na onboarding:**
- `isApproved = false`
- Caregiver kan NIET zichtbaar zijn in search
- Moet op admin goedkeuring wachten

**Vraag:**
⚠️ Hoe lang duurt approval? Wat ziet caregiver ondertussen?

### **4. Exact Daily Slots**
**Booking verwacht:**
```javascript
exactDailySlots: {
  '2025-10-21': [{ start: '09:00', end: '17:00' }]
}
```

**Onboarding slaat op:**
```javascript
availabilityData: {
  days: ['MA', 'DI'],
  times: ['OVERDAG']
}
```

**Probleem:**
⚠️ `exactDailySlots` wordt NIET ingesteld tijdens onboarding!

---

## 🔧 **TE CHECKEN**

### **1. Doorloop Complete Flow:**
```
[ ] Registreer als caregiver
[ ] Doorloop alle 5 steps
[ ] Check database: CaregiverProfile aangemaakt?
[ ] Check: isApproved = false?
[ ] Check: availabilityData format correct?
[ ] Check: Alle services opgeslagen?
[ ] Check: Prijzen correct?
```

### **2. Na Approval:**
```
[ ] Admin zet isApproved = true
[ ] Caregiver zichtbaar in search?
[ ] Caregiver profiel pagina werkt?
[ ] Booking mogelijk?
[ ] Availability correct getoond?
```

### **3. Data Consistency:**
```
[ ] availabilityData format = booking calendar format?
[ ] exactDailySlots ingevuld? (of null?)
[ ] hourlyRate vs servicePrices?
[ ] weeklyJson format correct?
```

---

## 🎯 **MOET GETEST WORDEN**

### **Test Scenario:**
```
1. Ga naar /auth/register
2. Maak account: "Test Verzorger 2"
3. Kies rol: CAREGIVER
4. Doorloop onboarding:
   - Vul alles in
   - Let op: welke velden verplicht?
   - Let op: validatie errors?
5. Submit onboarding
6. Check database in Prisma Studio:
   - CaregiverProfile record?
   - availabilityData format?
   - services & prijzen?
7. Test als owner:
   - Zoek deze caregiver
   - Probeer te boeken
   - Check availability calendar
```

---

## 📊 **VERWACHTE RESULTATEN**

### **Na Registratie:**
```sql
User {
  name: "Test Verzorger 2"
  email: "test2@test.nl"
  role: "CAREGIVER"
  onboardingCompleted: false  ← Nog niet
}
```

### **Na Onboarding (Step 5 Submit):**
```sql
User {
  onboardingCompleted: true  ← Nu wel
}

CaregiverProfile {
  userId: "..."
  city: "Brussel"
  services: "[\"DOG_WALKING\",\"PET_SITTING\"]"
  animalTypes: "[\"DOG\",\"CAT\"]"
  servicePrices: "{\"DOG_WALKING\":15,\"PET_SITTING\":20}"
  hourlyRate: 25  ← Default (wordt overschreven?)
  availabilityData: "{\"days\":[\"MA\",\"DI\"],\"times\":[\"OVERDAG\"]}"
  isApproved: false  ← Wacht op admin
}
```

### **Na Admin Approval:**
```sql
CaregiverProfile {
  isApproved: true  ← Admin zet op true
}

→ Caregiver verschijnt in search
→ Booking mogelijk
```

---

## 🚨 **POTENTIËLE PROBLEMEN**

### **1. Hourly Rate vs Service Prices**
**Onboarding:**
- Vraagt per-service prijzen
- Hondenuitlaat: €15/u
- Oppas: €20/u

**Booking:**
- Gebruikt `caregiver.hourlyRate` (vast tarief)
- Ignoreert `servicePrices`

**Oplossing Nodig:**
- Gebruik `servicePrices[selectedService]` in booking
- Of: Vraag 1 uurtarief in onboarding

### **2. Availability Format**
**Onboarding slaat op:**
```json
{
  "days": ["MA", "DI"],
  "times": ["OVERDAG", "AVOND"]
}
```

**Booking verwacht EXACT TIMES:**
```json
{
  "2025-10-21": [
    { "start": "09:00", "end": "17:00" }
  ]
}
```

**Oplossing Nodig:**
- Onboarding moet `weeklyJson` aanmaken
- Of: Booking moet time slots converteren

### **3. Admin Approval Process**
**Huidige situatie:**
- Caregiver registreert
- `isApproved = false`
- Niet zichtbaar in search

**Vragen:**
- Wie is de admin?
- Hoe goedkeuren? (Prisma Studio?)
- Email notificatie naar admin?
- Wat ziet caregiver tijdens wachten?

---

## ✅ **ACTIELIJST**

### **Prioriteit 1: Test Complete Flow**
```
1. [ ] Registreer nieuwe caregiver
2. [ ] Doorloop volledige onboarding
3. [ ] Check database resultaat
4. [ ] Identificeer problemen
```

### **Prioriteit 2: Fix Data Formats**
```
1. [ ] Unify availability format
2. [ ] Fix hourlyRate vs servicePrices
3. [ ] Add weeklyJson generation
```

### **Prioriteit 3: Approval Process**
```
1. [ ] Admin notification systeem
2. [ ] Approval UI in admin dashboard
3. [ ] Caregiver "waiting" state UI
```

---

**KLAAR OM TE TESTEN!**

Prisma Studio is open op http://localhost:5555
→ Verwijder test bookings
→ Dan gaan we caregiver registratie testen

**Laat me weten als je klaar bent om te beginnen met testen!** 🧪





















