# 📱 Booking Flow - Visual Guide

## 🔄 **COMPLETE USER JOURNEY**

### **STEP 1: Details Invullen**
```
┌────────────────────────────────────────────────┐
│ 📋 Boekingsdetails                             │
├────────────────────────────────────────────────┤
│                                                │
│ 1️⃣ Service Selectie                            │
│    [Dropdown: Hondenuitlaat - €15/uur]        │
│                                                │
│ 2️⃣ Kalender (tot 90 dagen)                     │
│    [Calendar: Select multiple dates]          │
│    💡 Hover over dagen → zie beschikbare tijden│
│                                                │
│ 3️⃣ Tijden per Dag                              │
│    ┌──────────────────────────────┐           │
│    │ ma 21 okt                    │           │
│    │ Start: [09:00] Eind: [17:00] │           │
│    └──────────────────────────────┘           │
│    ┌──────────────────────────────┐           │
│    │ di 22 okt                    │           │
│    │ Start: [09:00] Eind: [17:00] │           │
│    └──────────────────────────────┘           │
│                                                │
│ 4️⃣ Huisdier Info                               │
│    Naam: [Max]                                │
│    Type: [🐕 Hond]                            │
│    Ras:  [Golden Retriever] *NIEUW*          │
│                                                │
│ 5️⃣ Special Instructies                         │
│    [Textbox]                                  │
│                                                │
│ 6️⃣ Emergency Contacts (optioneel)              │
│    Noodcontact: [...]                         │
│    Dierenarts:  [...]                         │
│                                                │
├────────────────────────────────────────────────┤
│ 💰 TOTAAL KOSTEN                               │
│ ┌────────────────────────────────────────┐   │
│ │ Tarief: €15/uur  |  2 dagen geselecteerd│   │
│ │                                         │   │
│ │ Per dag:                                │   │
│ │ ma 21 okt  09:00-17:00  8.0u  €120.00  │   │
│ │ di 22 okt  09:00-17:00  8.0u  €120.00  │   │
│ │                                         │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│ │ Totaal: €240.00                         │   │
│ └────────────────────────────────────────┘   │
├────────────────────────────────────────────────┤
│                                                │
│ ⚠️ Als velden ontbreken:                       │
│ ┌──────────────────────────────────────┐     │
│ │ ⚠️ Vul nog de volgende velden in:    │     │
│ │ • Tijden voor 1 dag                  │     │
│ │ • Ras                                │     │
│ └──────────────────────────────────────┘     │
│                                                │
│ [Annuleren]          [Naar Betaling] (disabled│
│                       tot alles ingevuld)      │
└────────────────────────────────────────────────┘
```

---

### **STEP 2: Betaling**
```
┌────────────────────────────────────────────────┐
│ 💳 Betaling                                    │
├────────────────────────────────────────────────┤
│                                                │
│ 📋 Boeking Overzicht:                          │
│ ┌────────────────────────────────────────┐   │
│ │ Verzorger: Marie Dupont                │   │
│ │ Service: Hondenuitlaat                 │   │
│ │                                        │   │
│ │ Data (2):                              │   │
│ │ 📅 ma 21 okt                           │   │
│ │ 📅 di 22 okt                           │   │
│ │                                        │   │
│ │ Huisdier: Max (Golden Retriever)      │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│ │ Totaal: €240.00                        │   │
│ └────────────────────────────────────────┘   │
│                                                │
│ 💳 Betaalmethode:                              │
│ ○ Creditcard / Debitcard                      │
│ ○ Bancontact                                  │
│ ○ PayPal                                      │
│                                                │
│ [Terug]              [Bevestigen & Boeken]    │
└────────────────────────────────────────────────┘
```

---

### **STEP 3: Bevestiging** ⭐ **HIER STAAT DE KNOP!**
```
┌────────────────────────────────────────────────┐
│ ✅ Bevestiging                                 │
├────────────────────────────────────────────────┤
│                                                │
│         ┌─────────────┐                        │
│         │   ✓ DONE    │                        │
│         └─────────────┘                        │
│                                                │
│   🎉 Boeking succesvol aangemaakt!            │
│                                                │
│   Je boeking is bevestigd. Je ontvangt        │
│   binnen enkele minuten een bevestigingsmail. │
│   De verzorger wordt op de hoogte gebracht.   │
│                                                │
│ ┌────────────────────────────────────────┐   │
│ │ 📋 Volgende stappen:                   │   │
│ │ ✓ Controleer je e-mail                │   │
│ │ ✓ Verzorger neemt binnen 24u contact  │   │
│ │ ✓ Berichten via dashboard              │   │
│ │ ✓ Betaling na goedkeuring verzorger   │   │
│ └────────────────────────────────────────┘   │
│                                                │
│ ┌────────────────────────────────────────┐   │
│ │ 🐾 Meerdere huisdieren?                │   │
│ │                                        │   │
│ │ Boek voor elk huisdier apart. Dit      │   │
│ │ maakt het flexibeler voor verschillende│   │
│ │ tijden, instructies en annuleringen.   │   │
│ └────────────────────────────────────────┘   │
│                                                │
│ ┌────────┬────────────┬──────────────────┐   │
│ │🏠 Dash │📄 Bekijk   │🐾 Boek Ander     │   │ ← HIER!
│ │board   │Boeking     │Huisdier          │   │
│ └────────┴────────────┴──────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 🐾 **"BOEK ANDER HUISDIER" KNOP**

### **Locatie:**
📍 `src/app/booking/new/page.tsx` - Regel 853-857

### **Wanneer Zichtbaar:**
✅ **NA** succesvolle booking (Step 3)
✅ Als `bookingId` bestaat
✅ Naast "Dashboard" en "Bekijk Boeking"

### **Wat Gebeurt Er:**
```
1. User klikt "🐾 Boek Ander Huisdier"
2. Link: /booking/new?caregiver=[ID]&from=profile
3. Nieuw leeg formulier opent
4. Zelfde verzorger pre-selected
5. User vult in voor 2e huisdier
6. Process herhaalt
```

### **User Flow:**
```
Booking 1 (Max):
├── Invullen → Betaling → ✅ Bevestiging
└── Klik "🐾 Boek Ander Huisdier"
    
Booking 2 (Luna):
├── Invullen → Betaling → ✅ Bevestiging
└── Klik "🐾 Boek Ander Huisdier" (optioneel voor 3e)

Booking 3 (Bella):
├── Invullen → Betaling → ✅ Bevestiging
└── Klaar! 3 separate bookings
```

---

## 💡 **ALTERNATIEVE LOCATIES (Optioneel)**

### **Zou ook kunnen op:**

#### **1. Dashboard - "Mijn Huisdieren" Card**
```
┌─────────────────────────────────────┐
│ 🐾 Mijn Huisdieren (3)              │
├─────────────────────────────────────┤
│ 🐕 Max (Hond)                       │
│    [Bekijk] [Boek voor Max]        │ ← NIEUW
│                                     │
│ 🐈 Luna (Kat)                       │
│    [Bekijk] [Boek voor Luna]       │ ← NIEUW
│                                     │
│ 🐰 Bella (Konijn)                   │
│    [Bekijk] [Boek voor Bella]      │ ← NIEUW
└─────────────────────────────────────┘
```

#### **2. Caregiver Profile - Sidebar**
```
┌─────────────────────────────────────┐
│ Boek deze verzorger                 │
├─────────────────────────────────────┤
│ Kies een huisdier:                  │
│ ○ 🐕 Max (Hond)                     │ ← NIEUW
│ ○ 🐈 Luna (Kat)                     │ ← NIEUW
│ ○ 🐰 Bella (Konijn)                 │ ← NIEUW
│ ○ ➕ Ander huisdier (handmatig)     │
│                                     │
│ [Boek Nu]                           │
└─────────────────────────────────────┘
```

#### **3. Search Results - Card**
```
┌─────────────────────────────────────┐
│ Marie Dupont - €15/uur              │
│ 🐕 🐈 🐰 Brussel                    │
├─────────────────────────────────────┤
│ [📋 Profiel]                        │
│                                     │
│ Snel boeken voor:                   │
│ [🐕 Max] [🐈 Luna] [🐰 Bella]      │ ← NIEUW
└─────────────────────────────────────┘
```

---

## 🎯 **HUIDIGE IMPLEMENTATIE (Simpel & Effectief)**

### **Locatie:**
✅ **Bevestigingspagina** (Step 3)

### **Voordelen:**
1. ✅ Niet overweldigend voor nieuwe users
2. ✅ Verschijnt NA succesvolle eerste booking
3. ✅ Duidelijke call-to-action
4. ✅ Pre-filled caregiver (convenience)
5. ✅ Geen extra complexity in search/profile

### **Flow:**
```
Owner met 2 huisdieren:
├── Zoek verzorger → Vind Marie
├── Boek voor Max → Success! ✅
├── Zie "🐾 Boek Ander Huisdier" knop
├── Klik → Nieuw formulier (zelfde verzorger)
├── Boek voor Luna → Success! ✅
└── Dashboard toont beide bookings
```

---

## 🚀 **TOEKOMSTIGE VERBETERINGEN**

### **Smart Suggestions (Later):**
```javascript
// After booking success
const ownerPets = await db.pet.findMany({
  where: { ownerId: session.user.id }
})

const unbookedPets = ownerPets.filter(pet => 
  pet.name !== bookingData.petName
)

if (unbookedPets.length > 0) {
  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <p className="font-semibold mb-2">
        🐾 We zien dat je ook {unbookedPets.length} andere 
        {unbookedPets.length === 1 ? 'huisdier hebt' : 'huisdieren hebt'}!
      </p>
      <div className="flex gap-2">
        {unbookedPets.map(pet => (
          <Button key={pet.id} onClick={() => quickBookPet(pet)}>
            {getAnimalTypeIcon(pet.type)} {pet.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### **Quick Book Feature:**
```
Klik op huisdier → Pre-fill:
✅ Caregiver (zelfde)
✅ Service (zelfde)
✅ Dates (zelfde - maar aanpasbaar)
✅ Times (zelfde - maar aanpasbaar)
✅ Pet name, type, breed (auto)
❌ Instructies (leeg - uniek per huisdier)

→ Owner hoeft alleen te reviewen & submit!
```

---

## 📊 **ANALYTICS**

### **Track:**
- % owners met meerdere pets
- % die 2e booking maken binnen 1 uur
- Click rate "Boek Ander Huisdier"
- Average pets per owner
- Most common multi-pet combinations

### **Optimize:**
- Als >50% klikt binnen 1u → Add quick select
- Als <10% klikt → Remove/hide feature
- Als users vragen → Add prominent placement

---

## ✅ **CURRENT STATUS**

### **✅ Geïmplementeerd:**
```
Locatie: Bevestigingspagina (Step 3)
Trigger: Na succesvolle booking
Button:  🐾 Boek Ander Huisdier
Link:    /booking/new?caregiver=[ID]&from=profile
```

### **❌ Niet Geïmplementeerd (Optioneel):**
- Quick select pet op profile pagina
- Smart suggestions op bevestiging
- Bulk booking discount
- Clone & edit feature

### **🎯 Aanbeveling:**
**Huidige implementatie is perfect voor MVP!**
- Simpel & duidelijk
- Geen UI clutter
- Werkt voor 1-10 huisdieren

Later toevoegen:
- Smart suggestions (als data laat zien dat het nuttig is)
- Quick select (als users erom vragen)

---

**Last Updated:** 2025-01-20  
**Status:** ✅ Functional  
**Owner:** Steven @ TailTribe




















