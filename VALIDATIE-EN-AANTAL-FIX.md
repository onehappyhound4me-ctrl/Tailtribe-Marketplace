# ✅ VALIDATIE & AANTAL HUISDIEREN - GEFIXED

## 🎯 PROBLEMEN OPGELOST

### 1. **Aantal huisdieren selector - Altijd zichtbaar** ✅
**Probleem:** "Hoeveel huisdieren" vraag was alleen zichtbaar bij eerste huisdier  
**Oplossing:** Selector is NU ALTIJD zichtbaar en kan op elk moment aangepast worden

### 2. **Verkeerde gegevens validatie** ✅
**Probleem:** Geen validatie voor postcodes en andere velden  
**Oplossing:** Complete validatie toegevoegd met duidelijke error messages

---

## 🔄 **NIEUWE FUNCTIES**

### **1. Dynamische Huisdieren Selector**
```
┌─────────────────────────────────────┐
│ Hoeveel huisdieren heb je? *        │
│ ┌───┬───┬───┬───┬───┐               │
│ │ 1 │ 2 │ 3 │ 4 │ 5 │               │
│ └───┴───┴───┴───┴───┘               │
│       ✅ (3 geselecteerd)            │
│                                     │
│ Je hebt 3 huisdieren geselecteerd.  │
│ Vul elk huisdier hieronder in.      │
└─────────────────────────────────────┘

↓ Wijzig naar 2

┌─────────────────────────────────────┐
│ Hoeveel huisdieren heb je? *        │
│ ┌───┬───┬───┬───┬───┐               │
│ │ 1 │ 2 │ 3 │ 4 │ 5 │               │
│ └───┴───┴───┴───┴───┘               │
│     ✅ (2 geselecteerd)              │
│                                     │
│ Je hebt 2 huisdieren geselecteerd.  │
│ Vul elk huisdier hieronder in.      │
└─────────────────────────────────────┘
```

**Features:**
- ✅ Altijd zichtbaar (niet alleen bij eerste huisdier)
- ✅ Kan op elk moment aangepast worden
- ✅ Toont duidelijk hoeveel huisdieren geselecteerd zijn
- ✅ Dynamische tekst: "Huisdier X van Y"

---

### **2. Postcode Validatie**

#### **Nederlandse Postcode:**
```
Format: 1234AB (4 cijfers + 2 letters)
```

**Geldig:**
- ✅ `1012AB`
- ✅ `2000 XY` (met spatie)
- ✅ `9999ZZ`

**Ongeldig:**
- ❌ `1234` → "Ongeldige Nederlandse postcode (bijv. 1012AB)"
- ❌ `ABCD12` → "Ongeldige Nederlandse postcode (bijv. 1012AB)"
- ❌ `0123AB` → "Ongeldige Nederlandse postcode (bijv. 1012AB)" (mag niet met 0 beginnen)

#### **Belgische Postcode:**
```
Format: 1000-9999 (4 cijfers)
```

**Geldig:**
- ✅ `1000`
- ✅ `2000`
- ✅ `9999`

**Ongeldig:**
- ❌ `123` → "Ongeldige Belgische postcode (bijv. 1000)"
- ❌ `12345` → "Ongeldige Belgische postcode (bijv. 1000)"
- ❌ `0999` → "Ongeldige Belgische postcode (bijv. 1000)" (mag niet met 0 beginnen)

---

### **3. Huisdier Validatie**

#### **Naam:**
- ❌ Leeg → "Naam voor huisdier 1 is verplicht"
- ❌ < 2 tekens → "Naam moet minimaal 2 tekens zijn"
- ✅ ≥ 2 tekens → Geldig

#### **Type:**
- ❌ Niet geselecteerd → "Kies een diersoort"
- ✅ Geselecteerd → Geldig

#### **Leeftijd (optioneel):**
- ❌ < 0 → "Leeftijd moet tussen 0 en 30 jaar zijn"
- ❌ > 30 → "Leeftijd moet tussen 0 en 30 jaar zijn"
- ✅ 0-30 → Geldig

#### **Gewicht (optioneel):**
- ❌ ≤ 0 → "Gewicht moet tussen 0 en 200 kg zijn"
- ❌ > 200 → "Gewicht moet tussen 0 en 200 kg zijn"
- ✅ 0-200 → Geldig

---

## 🎯 **COMPLETE FLOW**

### **Stap 1: Basisgegevens**
```
Postcode: 1234
         ↓
Klik "Volgende stap"
         ↓
❌ "Ongeldige Belgische postcode (bijv. 1000)"
         ↓
Wijzig naar: 1000
         ↓
✅ "Gegevens opgeslagen!"
```

### **Stap 2: Huisdieren**
```
1. Selecteer aantal: [3]
   ✅ "Je hebt 3 huisdieren geselecteerd"

2. Vul huisdier 1 in:
   Naam: M
   ↓ Klik "Volgende"
   ❌ "Naam moet minimaal 2 tekens zijn"
   ↓ Wijzig naar: Max
   ✅ "Max toegevoegd! Vul nu huisdier 2 in"

3. Vul huisdier 2 in:
   Naam: Luna
   Leeftijd: 35
   ↓ Klik "Volgende"
   ❌ "Leeftijd moet tussen 0 en 30 jaar zijn"
   ↓ Wijzig naar: 2
   ✅ "Luna toegevoegd! Vul nu huisdier 3 in"

4. Vul huisdier 3 in:
   Naam: Pip
   ✅ "Alle 3 huisdieren toegevoegd!"
```

---

## 📊 **TOAST MESSAGES**

### **Stap 1 - Basisgegevens:**
- ❌ "Postcode is verplicht"
- ❌ "Stad is verplicht"
- ❌ "Ongeldige Nederlandse postcode (bijv. 1012AB)"
- ❌ "Ongeldige Belgische postcode (bijv. 1000)"
- ✅ "Gegevens opgeslagen!"

### **Stap 2 - Huisdieren:**
- ❌ "Naam voor huisdier 1 is verplicht"
- ❌ "Naam moet minimaal 2 tekens zijn"
- ❌ "Kies een diersoort"
- ❌ "Leeftijd moet tussen 0 en 30 jaar zijn"
- ❌ "Gewicht moet tussen 0 en 200 kg zijn"
- ✅ "Max toegevoegd! Vul nu huisdier 2 in"
- ✅ "Alle 3 huisdieren toegevoegd!"

---

## 🧪 **TEST SCENARIOS**

### **Test 1: Verkeerde Postcode**
```
1. Onboarding stap 1
2. Postcode: "1234"
3. Stad: "Amsterdam"
4. Klik "Volgende stap"
5. ✅ "Ongeldige Nederlandse postcode (bijv. 1012AB)"
6. Wijzig naar: "1012AB"
7. Klik "Volgende stap"
8. ✅ "Gegevens opgeslagen!"
```

### **Test 2: Aantal Wijzigen**
```
1. Onboarding stap 2
2. Selecteer: [2] huisdieren
3. ✅ "Je hebt 2 huisdieren geselecteerd"
4. Vul huisdier 1 in
5. Wijzig aantal naar: [3]
6. ✅ Tekst update: "Je hebt 3 huisdieren geselecteerd"
7. Vul alle 3 huisdieren in
8. ✅ "Alle 3 huisdieren toegevoegd!"
```

### **Test 3: Te Korte Naam**
```
1. Huisdier 1 naam: "M"
2. Klik "Volgende"
3. ✅ "Naam moet minimaal 2 tekens zijn"
4. Wijzig naar: "Max"
5. Klik "Volgende"
6. ✅ "Max toegevoegd!"
```

### **Test 4: Ongeldige Leeftijd**
```
1. Huisdier naam: "Max"
2. Leeftijd: "35"
3. Klik "Volgende"
4. ✅ "Leeftijd moet tussen 0 en 30 jaar zijn"
5. Wijzig naar: "3"
6. Klik "Volgende"
7. ✅ "Max toegevoegd!"
```

---

## 💾 **CODE CHANGES**

### **Postcode Validatie:**
```typescript
const validatePostcode = (postcode: string, country: string): boolean => {
  if (country === 'NL') {
    // NL: 1234AB format
    return /^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(postcode)
  } else {
    // BE: 1000-9999 format
    return /^[1-9][0-9]{3}$/.test(postcode)
  }
}
```

### **Huisdier Validatie:**
```typescript
// Naam
if (!currentPet.name.trim()) {
  toast.error(`Naam voor huisdier ${currentPetIndex + 1} is verplicht`)
  return
}

// Leeftijd (optioneel)
if (currentPet.age && (parseInt(currentPet.age) < 0 || parseInt(currentPet.age) > 30)) {
  toast.error('Leeftijd moet tussen 0 en 30 jaar zijn')
  return
}
```

### **Dynamische Toast:**
```typescript
// Tussen huisdieren
toast.success(`${currentPet.name} toegevoegd! Vul nu huisdier ${currentPetIndex + 2} in`)

// Laatste huisdier
toast.success(`Alle ${numPets} huisdieren toegevoegd!`)
```

---

## ✅ **RESULTAAT**

**Gebruiker krijgt NU:**
- ✅ **Duidelijke feedback** bij fouten
- ✅ **Specifieke instructies** wat er mis is
- ✅ **Flexibele controle** over aantal huisdieren
- ✅ **Progressie indicatie** (huisdier X van Y)
- ✅ **Validatie** voor alle velden

**Geen frustratie meer door:**
- ✅ Verkeerde postcodes
- ✅ Te korte namen
- ✅ Ongeldige leeftijden
- ✅ Verborgen aantal selector

**Test nu met verschillende scenarios!** 🎯




































