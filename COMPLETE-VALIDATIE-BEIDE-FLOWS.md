# ✅ VOLLEDIGE VALIDATIE - OWNER & CAREGIVER

## 🎯 ALLE VELDEN GEVALIDEERD

Nu krijgt **elke gebruiker** een **duidelijke melding** bij **verkeerde invoer**!

---

## 👥 OWNER ONBOARDING VALIDATIE

### **STAP 1: Basisgegevens**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Telefoon** | Optioneel, maar moet geldig zijn | "Ongeldig telefoonnummer (bijv. +32 123 45 67 89)" |
| | Moet beginnen met + | |
| | Moet 10-15 cijfers hebben | |
| **Postcode (NL)** | Verplicht, format 1234AB | "Ongeldige Nederlandse postcode (bijv. 1012AB)" |
| | Mag niet met 0 beginnen | |
| **Postcode (BE)** | Verplicht, format 1000-9999 | "Ongeldige Belgische postcode (bijv. 1000)" |
| | Moet 4 cijfers zijn | |
| **Stad** | Verplicht | "Stad is verplicht" |
| | Min 2 tekens | "Stad moet minimaal 2 tekens zijn" |

### **STAP 2: Huisdieren**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Aantal** | Verplicht, 1-5 | Visuele feedback via knoppen |
| **Naam** | Verplicht per huisdier | "Naam voor huisdier 1 is verplicht" |
| | Min 2 tekens | "Naam moet minimaal 2 tekens zijn" |
| **Diersoort** | Verplicht | "Kies een diersoort" |
| **Leeftijd** | Optioneel, 0-30 jaar | "Leeftijd moet tussen 0 en 30 jaar zijn" |
| **Gewicht** | Optioneel, 0-200 kg | "Gewicht moet tussen 0 en 200 kg zijn" |

### **STAP 3: Dienstenbehoefte**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Diensten** | Min 1 geselecteerd | "Selecteer minimaal 1 dienst die je nodig hebt" |
| **Frequentie** | Verplicht | "Selecteer hoe vaak je de dienst nodig hebt" |
| **Timing** | Min 1 geselecteerd | "Selecteer minimaal 1 tijdstip" |
| **Locatie** | Verplicht | "Selecteer waar de dienst moet plaatsvinden" |
| **Kwaliteiten** | Min 1 geselecteerd | "Selecteer minimaal 1 belangrijke kwaliteit" |

---

## 💼 CAREGIVER ONBOARDING VALIDATIE

### **STAP 1: Basisprofiel**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Postcode (NL)** | Verplicht, format 1234AB | "Ongeldige Nederlandse postcode (bijv. 1012AB)" |
| **Postcode (BE)** | Verplicht, format 1000-9999 | "Ongeldige Belgische postcode (bijv. 1000)" |
| **Stad** | Verplicht, min 2 tekens | "Stad is verplicht" / "Stad moet minimaal 2 tekens zijn" |
| **Actieradius** | 1-100 km | "Actieradius moet minimaal 1 km zijn" |
| | | "Actieradius mag maximaal 100 km zijn" |
| **Bio** | Min 50 tekens | "Bio moet minimaal 50 tekens zijn (nu: 25)" |
| | Max 140 tekens | "Bio mag max 140 karakters zijn" |

### **STAP 2: Diensten & Prijzen**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Diensten** | Min 1 geselecteerd | "Selecteer minimaal 1 dienst" |
| **Diersoorten** | Min 1 geselecteerd | "Selecteer minimaal 1 diersoort" |
| **Groottes** | Min 1 geselecteerd | "Selecteer minimaal 1 grootte categorie" |
| **Max dieren** | Min 1 | "Max aantal dieren moet minimaal 1 zijn" |
| **Prijs per dienst** | €5 - €200 | "Vul een prijs in voor Hondenuitlaat" |
| | | "Hondenuitlaat: Prijs moet minimaal €5 zijn" |
| | | "Hondenuitlaat: Prijs mag maximaal €200 zijn" |

### **STAP 3: Beschikbaarheid**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Dagen** | Min 1 geselecteerd | "Selecteer minimaal 1 dag waarop je beschikbaar bent" |
| **Tijdstippen** | Min 1 geselecteerd | "Selecteer minimaal 1 tijdstip waarop je beschikbaar bent" |
| **Annulatiebeleid** | Verplicht | "Kies een annulatiebeleid" |

### **STAP 4: Badges (Optioneel, maar als ingevuld moet het geldig zijn)**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **Verzekeraar** | Min 2 tekens (als verzekering = ja) | "Vul de naam van de verzekeraar in" |
| **Polisnummer** | Min 3 tekens | "Vul een geldig polisnummer in" |
| **Vervaldatum** | Niet in verleden | "Verzekering is verlopen, vul een geldige verzekering in" |
| **BTW/KVK nummer** | Min 5 tekens | "BTW/KVK nummer moet minimaal 5 tekens zijn" |

### **STAP 5: Payout**

| Veld | Validatie | Error Melding |
|------|-----------|---------------|
| **IBAN** | Verplicht, geldig formaat | "IBAN is verplicht" |
| | 2 letters + 2 cijfers + rest | "Ongeldig IBAN formaat (bijv. BE71 0961 2345 6769)" |
| | Correcte lengte per land | "IBAN voor BE moet 16 tekens zijn" |
| **Rekeninghouder** | Verplicht, min 2 tekens | "Rekeninghouder is verplicht" |
| **Commissie** | Moet akkoord gaan | "Je moet akkoord gaan met de 20% commissie" |
| **Platformregels** | Moet akkoord gaan | "Je moet akkoord gaan met de platformregels" |

---

## 🧪 TEST SCENARIOS

### **Test 1: Ongeldige Postcode**
```
Owner/Caregiver Stap 1:
├─ Postcode: "1234" (te kort)
├─ Klik "Volgende"
└─ ✅ "Ongeldige Nederlandse postcode (bijv. 1012AB)"

Wijzig naar: "1012AB"
└─ ✅ "Gegevens opgeslagen!"
```

### **Test 2: Ongeldig Telefoonnummer**
```
Owner Stap 1:
├─ Telefoon: "123456" (geen +)
├─ Klik "Volgende"
└─ ✅ "Ongeldig telefoonnummer (bijv. +32 123 45 67 89)"

Wijzig naar: "+31612345678"
└─ ✅ "Gegevens opgeslagen!"
```

### **Test 3: Te Korte Bio**
```
Caregiver Stap 1:
├─ Bio: "Hallo" (5 tekens, moet min 50)
├─ Klik "Volgende"
└─ ✅ "Bio moet minimaal 50 tekens zijn (nu: 5)"

Typ meer...
└─ ✅ "Basisprofiel opgeslagen!"
```

### **Test 4: Te Lage Prijs**
```
Caregiver Stap 2:
├─ Hondenuitlaat: €2
├─ Klik "Volgende"
└─ ✅ "Hondenuitlaat: Prijs moet minimaal €5 zijn"

Wijzig naar: €25
└─ ✅ "Diensten en prijzen opgeslagen!"
```

### **Test 5: Verlopen Verzekering**
```
Caregiver Stap 4:
├─ Verzekering: Ja
├─ Vervaldatum: 2024-01-01 (verleden)
├─ Klik "Volgende"
└─ ✅ "Verzekering is verlopen, vul een geldige verzekering in"

Wijzig naar: 2026-12-31
└─ ✅ "Badges opgeslagen!"
```

### **Test 6: Ongeldig IBAN**
```
Caregiver Stap 5:
├─ IBAN: "BE123"
├─ Klik "Voltooien"
└─ ✅ "Ongeldig IBAN formaat (bijv. BE71 0961 2345 6769)"

Wijzig naar: "BE71 0961 2345 6769"
└─ ✅ "Profiel aangemaakt!"
```

### **Test 7: Te Jonge/Oude Huisdier**
```
Owner Stap 2:
├─ Huisdier naam: "Max"
├─ Leeftijd: 35 jaar
├─ Klik "Volgende"
└─ ✅ "Leeftijd moet tussen 0 en 30 jaar zijn"

Wijzig naar: 3
└─ ✅ "Max toegevoegd!"
```

### **Test 8: Meerdere Huisdieren**
```
Owner Stap 2:
├─ Aantal: [3] geselecteerd
├─ ✅ "Je hebt 3 huisdieren geselecteerd"
├─ Vul huisdier 1 in → "Max toegevoegd! Vul nu huisdier 2 in"
├─ Vul huisdier 2 in → "Luna toegevoegd! Vul nu huisdier 3 in"
└─ Vul huisdier 3 in → "Alle 3 huisdieren toegevoegd!"
```

---

## 📋 VALIDATIE FUNCTIES

Alle validatie is gecentraliseerd in `/src/lib/validation.ts`:

```typescript
✅ validatePostcode()    // NL: 1234AB, BE: 1000
✅ validatePhone()       // +32123456789 of +31612345678
✅ validateEmail()       // naam@voorbeeld.nl
✅ validateIBAN()        // BE71 0961 2345 6769
✅ validatePrice()       // €5 - €200
✅ validateBio()         // Min 50 tekens
✅ validateActionRadius()// 1-100 km
✅ validateCity()        // Min 2 tekens
✅ validateName()        // Min 2 tekens
✅ validateMaxAnimals()  // 1-20 dieren
```

---

## ✅ RESULTAAT

**ELKE gebruiker weet NU:**
- ❌ Wat er verkeerd is
- 📝 Hoe het moet
- 🔴 Waar de fout zit
- ✅ Wanneer het goed is

**Voorbeelden:**
- "Ongeldige Nederlandse postcode (bijv. 1012AB)"
- "Bio moet minimaal 50 tekens zijn (nu: 25)"
- "Leeftijd moet tussen 0 en 30 jaar zijn"
- "Prijs moet minimaal €5 zijn"
- "Verzekering is verlopen, vul een geldige verzekering in"

**Geen frustratie meer - altijd duidelijke feedback!** 🎯




































