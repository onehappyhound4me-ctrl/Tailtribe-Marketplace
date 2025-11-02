# 🐾 Pet Data Flow - Inconsistentie Probleem

## ⚠️ **HET PROBLEEM**

Er zijn **3 VERSCHILLENDE PLEKKEN** waar owners pet informatie kunnen invullen:

### **1. Owner Onboarding**
```
/onboarding/owner (Step 2)
├── Pet naam *
├── Pet type *
├── Pet ras *
├── Geslacht
├── Leeftijd
├── Gewicht
├── Gesteriliseerd?
├── Medische info
├── Sociaal met huisdieren?
├── Sociaal met mensen?
└── Karakter

→ Slaat op in Pet tabel (via /api/pets/create-detailed)
```

### **2. Booking Form**
```
/booking/new (Step 1)
├── Pet naam *
├── Pet type *
├── Pet ras *
└── Speciale instructies

→ Slaat op in Booking tabel (NIET in Pet!)
```

### **3. Pet Management**
```
/pets/edit/[id]
├── Alle velden zoals onboarding
└── Update bestaande pet

→ Update Pet tabel
```

---

## 🚨 **INCONSISTENTIES**

### **Probleem 1: Dubbele Pet Data**
```
Scenario: Owner heeft Max al in Pet tabel

Bij booking:
❌ Moet opnieuw naam, type, ras invullen
❌ Geen link naar bestaande Pet record
❌ Data staat 2x: Pet tabel + Booking tabel
```

### **Probleem 2: Verschillende Velden**
```
Pet tabel heeft:
✅ Breed, age, weight, medicalInfo, vaccinations, etc.

Booking tabel heeft:
✅ petName, petType, petBreed
❌ MAAR: Geen link naar Pet.id

Result:
→ Caregiver ziet alleen naam/type/ras bij booking
→ Caregiver ziet NIET medische info, leeftijd, karakter
```

### **Probleem 3: Updates Niet Gesynchroniseerd**
```
Owner update Max in /pets/edit/123:
✅ Pet.breed = "Golden Retriever" (was "Labrador")

Oude bookings:
❌ Booking.petBreed = "Labrador" (blijft oud)

Result:
→ Historische data klopt niet meer
```

---

## ✅ **OPLOSSINGEN**

### **Oplossing A: Link Booking → Pet (AANBEVOLEN)**

#### **Database Schema Update:**
```prisma
model Booking {
  // Current:
  petName   String?
  petType   String?
  petBreed  String?
  
  // Add:
  pet       Pet?     @relation(fields: [petId], references: [id])
  petId     String?
  
  // Keep old fields for backwards compatibility & non-registered pets
}
```

#### **Booking Form Update:**
```jsx
// Option 1: Select existing pet
<select onChange={(e) => selectPet(e.target.value)}>
  <option value="">Nieuw huisdier</option>
  {ownerPets.map(pet => (
    <option value={pet.id}>{pet.name} ({pet.breed})</option>
  ))}
</select>

// Option 2: Enter new pet data
{!selectedPetId && (
  <>
    <input name="petName" />
    <input name="petType" />
    <input name="petBreed" />
  </>
)}
```

#### **Voordelen:**
- ✅ Pet data 1x opgeslagen
- ✅ Caregiver ziet ALLE pet info
- ✅ Updates automatisch gesynchroniseerd
- ✅ Sneller boeken (select van lijst)

#### **Nadelen:**
- 🔧 Schema change (migration nodig)
- 🔧 Booking form refactor

---

### **Oplossing B: Auto-Pre-fill (SIMPELER)**

#### **Booking Form:**
```jsx
// Fetch owner's pets
useEffect(() => {
  const fetchPets = async () => {
    const pets = await fetch('/api/pets/list')
    setOwnerPets(pets)
  }
  fetchPets()
}, [])

// Auto-fill if only 1 pet
useEffect(() => {
  if (ownerPets.length === 1) {
    const pet = ownerPets[0]
    setBookingData({
      ...bookingData,
      petName: pet.name,
      petType: pet.type,
      petBreed: pet.breed
    })
  }
}, [ownerPets])

// Show selection if multiple pets
{ownerPets.length > 1 && (
  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
    <p className="font-semibold mb-2">Selecteer huisdier:</p>
    {ownerPets.map(pet => (
      <button
        key={pet.id}
        onClick={() => fillPetData(pet)}
        className="px-4 py-2 bg-white border rounded mr-2"
      >
        {pet.icon} {pet.name}
      </button>
    ))}
  </div>
)}
```

#### **Voordelen:**
- ✅ Geen schema change
- ✅ Quick implementation (1 uur)
- ✅ Betere UX (1-click select)
- ✅ Backwards compatible

#### **Nadelen:**
- ❌ Data nog steeds duplicated
- ❌ No automatic sync bij updates

---

### **Oplossing C: Verplicht Pet Aanmaken Eerst (STRICT)**

#### **Flow:**
```
Owner wil boeken:
├── Check: Heeft owner pets?
│   ├── JA → Ga door naar booking
│   └── NEE → Redirect naar /pets/add
│       └── "Je moet eerst een huisdier toevoegen"
│
└── Booking form: SELECT pet (geen manual entry)
```

#### **Voordelen:**
- ✅ Data altijd in Pet tabel
- ✅ Consistentie gegarandeerd
- ✅ Betere data quality

#### **Nadelen:**
- ❌ Extra step voor owner
- ❌ Minder flexibel (geen quick booking)

---

## 🎯 **AANBEVELING**

### **Korte Termijn (Nu): Oplossing B**
**Auto-pre-fill van bestaande pets**
- Quick win (1 uur werk)
- Betere UX
- Geen breaking changes

### **Lange Termijn (Later): Oplossing A**
**Booking → Pet relatie**
- Complete data consistency
- Caregiver ziet medische info
- Professionele oplossing

---

## 🛠️ **IMPLEMENTATIE: Oplossing B (Quick Fix)**

### **Changes Needed:**

#### **1. Fetch Owner Pets in Booking Form**
```typescript
// src/app/booking/new/page.tsx

const [ownerPets, setOwnerPets] = useState<any[]>([])

useEffect(() => {
  const fetchOwnerPets = async () => {
    try {
      const response = await fetch('/api/pets/list')
      if (response.ok) {
        const data = await response.json()
        setOwnerPets(data.pets || [])
        
        // Auto-fill if only 1 pet
        if (data.pets.length === 1) {
          const pet = data.pets[0]
          setBookingData({
            ...bookingData,
            petName: pet.name,
            petType: pet.type,
            petBreed: pet.breed
          })
        }
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    }
  }
  
  fetchOwnerPets()
}, [])
```

#### **2. Add Pet Selector**
```jsx
{/* Pet Selection */}
{ownerPets.length > 0 && (
  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="font-semibold text-blue-900 mb-3">
      Selecteer een huisdier of vul handmatig in:
    </p>
    <div className="flex flex-wrap gap-2">
      {ownerPets.map(pet => (
        <button
          key={pet.id}
          type="button"
          onClick={() => {
            setBookingData({
              ...bookingData,
              petName: pet.name,
              petType: pet.type,
              petBreed: pet.breed || ''
            })
          }}
          className="px-4 py-2 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all"
        >
          {getAnimalTypeIcon(pet.type)} {pet.name}
        </button>
      ))}
    </div>
  </div>
)}

{/* Manual Entry (existing fields) */}
<div>
  <label>Naam huisdier *</label>
  <input value={bookingData.petName} ... />
</div>
```

---

## 📊 **CURRENT vs FIXED**

### **Huidige Situatie:**
```
Owner registreert → Voegt Max toe in onboarding
Owner boekt → Moet opnieuw "Max" intypen ❌
```

### **Na Fix:**
```
Owner registreert → Voegt Max toe in onboarding
Owner boekt → Ziet [🐕 Max] knop → 1 klik! ✅
```

---

## 🧪 **TEST SCENARIO**

### **Test 1: Owner met 1 Pet**
```
1. Owner heeft Max in Pet tabel
2. Gaat naar booking form
3. VERWACHT: Max auto-ingevuld
4. RESULTAAT: ✅ naam, type, ras pre-filled
```

### **Test 2: Owner met Meerdere Pets**
```
1. Owner heeft Max, Luna, Bella
2. Gaat naar booking form
3. VERWACHT: Zie buttons [🐕 Max] [🐈 Luna] [🐰 Bella]
4. RESULTAAT: Klik Max → data ingevuld
```

### **Test 3: Owner zonder Pets**
```
1. Owner heeft geen pets in tabel
2. Gaat naar booking form
3. VERWACHT: Normale manual entry
4. RESULTAAT: Vul naam/type/ras handmatig in
```

---

## ⏱️ **IMPLEMENTATIE TIJD**

### **Oplossing B (Auto-pre-fill):**
```
1. Add pets fetch: 15 min
2. Add pet selector UI: 30 min
3. Add auto-fill logic: 15 min
4. Testing: 15 min
━━━━━━━━━━━━━━━━━━━━━━━
TOTAAL: ~1.5 uur
```

### **Oplossing A (Pet relation):**
```
1. Schema update: 30 min
2. Migration: 15 min
3. API updates: 1 uur
4. UI refactor: 2 uur
5. Testing: 1 uur
━━━━━━━━━━━━━━━━━━━━━━━
TOTAAL: ~5 uur
```

---

## 💡 **BESLISSING**

**Wil je dat ik nu Oplossing B implementeer? (1.5 uur)**

**Voordelen:**
- ✅ Quick fix
- ✅ Betere UX (1-click pet select)
- ✅ Minder typen voor owner
- ✅ Geen breaking changes

**Of wachten en later Oplossing A doen?**

---

**Last Updated:** 2025-01-20  
**Status:** ⚠️ Probleem geïdentificeerd, oplossing klaar  
**Owner:** Steven @ TailTribe





















