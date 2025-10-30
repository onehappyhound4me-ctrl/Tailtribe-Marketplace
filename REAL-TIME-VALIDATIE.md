# ✅ REAL-TIME VALIDATIE - DIRECT FEEDBACK

## 🎯 ALLE VELDEN GEVALIDEERD BIJ VERLATEN (BLUR)

**Nu krijg je DIRECT feedback zodra je een veld verlaat!**

---

## 👥 OWNER ONBOARDING

### **Stap 1: Basisgegevens**

| Veld | Wanneer | Wat gebeurt |
|------|---------|-------------|
| **Telefoon** | Veld verlaten | Toast: "Ongeldig telefoonnummer (bijv. +32 123 45 67 89)" |
| **Postcode** | Veld verlaten | Toast: "Ongeldige Nederlandse postcode (bijv. 1012AB)" |
| | | Indicator onder veld toont: "🇳🇱 NL: 1234AB" |
| **Stad** | Veld verlaten | Toast: "Stad moet minimaal 2 tekens zijn" |

**Test:**
```
1. Postcode: typ "1234"
2. Klik uit veld (tab of klik elders)
3. ✅ DIRECT toast: "Ongeldige Nederlandse postcode"
4. Wijzig naar "1012AB"
5. Klik uit veld
6. ✅ Geen error, kan verder
```

### **Stap 2: Huisdieren**

| Veld | Wanneer | Wat gebeurt |
|------|---------|-------------|
| **Aantal** | Selector blijft zichtbaar | Tekst: "Je hebt 3 huisdieren geselecteerd" |
| **Submit** | Klik "Volgende" | Validate: naam, type, leeftijd, gewicht |

**Test:**
```
1. Naam: typ "M"
2. Klik "Volgende huisdier"
3. ✅ Toast: "Naam moet minimaal 2 tekens zijn"
4. Kan NIET verder!
```

### **Stap 3: Voorkeuren**

| Veld | Wanneer | Wat gebeurt |
|------|---------|-------------|
| **Diensten** | Klik "Volgende" | Toast: "Selecteer minimaal 1 dienst" |
| **Frequentie** | Klik "Volgende" | Toast: "Selecteer hoe vaak je de dienst nodig hebt" |

---

## 💼 CAREGIVER ONBOARDING

### **Stap 1: Basisprofiel**

| Veld | Wanneer | Wat gebeurt |
|------|---------|-------------|
| **Postcode** | Veld verlaten (blur) | ✅ Toast: "Ongeldige postcode" |
| **Stad** | Veld verlaten (blur) | ✅ Toast: "Stad moet minimaal 2 tekens zijn" |
| **Actieradius** | Veld verlaten (blur) | ✅ Toast: "Actieradius moet minimaal 1 km zijn" |
| **Bio** | Veld verlaten (blur) | ✅ Toast: "Bio moet minimaal 50 tekens zijn (nu: 25)" |
| | | ✅ Teller wordt rood: "25/140 (nog 25 nodig)" |

**Test:**
```
1. Bio: typ "Hallo"
2. Klik uit veld
3. ✅ DIRECT toast: "Bio moet minimaal 50 tekens zijn (nu: 5)"
4. ✅ Teller wordt rood: "5/140 (nog 45 nodig)"
5. Typ meer tekst (50+)
6. ✅ Teller wordt grijs: "55/140"
```

### **Stap 2: Diensten & Prijzen**

| Veld | Wanneer | Wat gebeurt |
|------|---------|-------------|
| **Diensten** | Klik "Volgende" | Toast: "Selecteer minimaal 1 dienst" |
| **Prijzen** | Klik "Volgende" | Toast: "Hondenuitlaat: Prijs moet minimaal €5 zijn" |

**Test:**
```
1. Selecteer "Hondenuitlaat"
2. Prijs: €2
3. Klik "Volgende"
4. ✅ Toast: "Hondenuitlaat: Prijs moet minimaal €5 zijn"
5. Kan NIET verder!
```

### **Stap 5: Uitbetaling**

| Veld | Wanneer | Wat gebeurt |
|------|---------|-------------|
| **IBAN** | Veld verlaten (blur) | ✅ Toast: "Ongeldig IBAN formaat" |
| | | ✅ Toast: "IBAN voor BE moet 16 tekens zijn" |
| **Rekeninghouder** | Veld verlaten (blur) | ✅ Toast: "Rekeninghouder moet minimaal 2 tekens zijn" |

**Test:**
```
1. IBAN: typ "BE123"
2. Klik uit veld
3. ✅ DIRECT toast: "IBAN voor BE moet 16 tekens zijn"
4. Wijzig naar "BE71096123456769"
5. Klik uit veld
6. ✅ Geen error, geldig!
```

---

## 🔄 WANNEER VALIDATIE GEBEURT

### **Bij verlaten veld (onBlur):**
- ✅ Postcode
- ✅ Stad
- ✅ Actieradius
- ✅ Bio
- ✅ IBAN
- ✅ Rekeninghouder
- ✅ Telefoon

**Voordeel:** Gebruiker krijgt DIRECT feedback, hoeft niet tot submit te wachten!

### **Bij submit (onClick):**
- ✅ Alle verplichte selecties (diensten, tijden, dagen)
- ✅ Prijzen per dienst
- ✅ Checkboxes (commissie, platformregels)

**Voordeel:** Controle gebeurt VOOR data wordt verzonden!

---

## 📊 VALIDATIE OVERZICHT

```
┌──────────────────────────────────┐
│ GEBRUIKER TYP POSTCODE           │
│ "1234"                           │
└──────────────────────────────────┘
           ↓
      Veld verlaten (blur)
           ↓
┌──────────────────────────────────┐
│ VALIDATIE CHECK                  │
│ validatePostcode("1234", "NL")   │
│ → {valid: false, error: "..."}   │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│ TOAST VERSCHIJNT                 │
│ ❌ Ongeldige Nederlandse postcode│
│    (bijv. 1012AB)                │
└──────────────────────────────────┘
           ↓
      Gebruiker ziet error!
           ↓
┌──────────────────────────────────┐
│ GEBRUIKER WIJZIGT                │
│ "1012AB"                         │
└──────────────────────────────────┘
           ↓
      Veld verlaten (blur)
           ↓
┌──────────────────────────────────┐
│ VALIDATIE CHECK                  │
│ validatePostcode("1012AB", "NL") │
│ → {valid: true}                  │
└──────────────────────────────────┘
           ↓
      Geen toast = geldig! ✅
```

---

## 🧪 TEST NU DIRECT:

### **Test 1: Ongeldige Postcode**
```
1. http://localhost:3000/auth/register
2. Registreer als Owner
3. Onboarding stap 1
4. Postcode: typ "1234"
5. Klik BUITEN het veld (tab of klik elders)
6. ✅ DIRECT toast: "Ongeldige Nederlandse postcode (bijv. 1012AB)"
```

### **Test 2: Te Korte Stad**
```
1. Stad: typ "A"
2. Klik BUITEN het veld
3. ✅ DIRECT toast: "Stad moet minimaal 2 tekens zijn"
```

### **Test 3: Ongeldig IBAN (Caregiver)**
```
1. Registreer als Caregiver
2. Onboarding stap 5
3. IBAN: typ "BE123"
4. Klik BUITEN het veld
5. ✅ DIRECT toast: "IBAN voor BE moet 16 tekens zijn"
```

### **Test 4: Te Korte Bio (Caregiver)**
```
1. Stap 1: Bio: typ "Hallo"
2. Klik BUITEN het veld
3. ✅ DIRECT toast: "Bio moet minimaal 50 tekens zijn (nu: 5)"
4. ✅ Teller wordt rood: "5/140 (nog 45 nodig)"
```

---

## ✅ ALLE VALIDATIE REGELS

```typescript
Postcode (NL): 1234AB ✅ | 1234 ❌ | ABCD ❌
Postcode (BE): 1000 ✅ | 123 ❌ | 12345 ❌
Telefoon: +31612345678 ✅ | 123456 ❌
Stad: Amsterdam ✅ | A ❌
IBAN: BE71096123456769 ✅ | BE123 ❌
Bio: 50+ tekens ✅ | < 50 ❌
Actieradius: 1-100 km ✅ | 0 ❌ | 150 ❌
Prijs: €5-€200 ✅ | €2 ❌ | €500 ❌
Leeftijd: 0-30 jaar ✅ | 35 ❌
Gewicht: 0-200 kg ✅ | 300 ❌
```

---

## 🎉 RESULTAAT

**Gebruiker kan NU:**
- ✅ DIRECT zien wat er fout is (bij verlaten veld)
- ✅ Niet verder als data ongeldig is (bij submit)
- ✅ Exact weten wat het correcte formaat is
- ✅ Geen frustratie meer!

**Refresh de pagina en test het!** 🚀




































