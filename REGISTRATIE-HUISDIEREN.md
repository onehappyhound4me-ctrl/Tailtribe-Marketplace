# 🐾 MEERDERE HUISDIEREN IN REGISTRATIE

## ✅ TOEGEVOEGD

### 1. **Huisdieren Sectie in Registratie** (alleen voor OWNER)
✅ Verschijnt automatisch als rol "Eigenaar" is geselecteerd  
✅ Vraag "Hoeveel huisdieren heb je?" (1-5)  
✅ Voor elk huisdier een volledig formulier  
✅ Real-time validatie per huisdier

---

## 📋 **VELDEN PER HUISDIER**

### **Verplicht** ⭐
- **Naam**: Rex, Luna, Max, etc.
- **Diersoort**: Hond, Kat, Konijn, Vogel/Papegaai, Anders

### **Optioneel**
- **Ras**: Labrador, Pers, etc.
- **Leeftijd**: In jaren (0-30)

---

## 🎯 **HOE HET WERKT**

### **Scenario 1: Gebruiker selecteert Eigenaar**
```
1. Kies rol: "Eigenaar"
2. ✅ Huisdieren sectie verschijnt
3. Default: 1 huisdier formulier
4. Selecteer 2 huisdieren
5. ✅ 2 formulieren verschijnen
6. Vul elk formulier in
7. ✅ Validatie per huisdier
```

### **Scenario 2: Gebruiker selecteert Verzorger**
```
1. Kies rol: "Verzorger"
2. ✅ Geen huisdieren sectie
3. Alleen basis registratie velden
```

---

## 🎨 **UI OVERZICHT**

### **Aantal Knoppen:**
```
Hoeveel huisdieren heb je? *
┌───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │
└───┴───┴───┴───┴───┘
  ✅  [2 geselecteerd]
```

### **Per Huisdier Formulier:**
```
╔══════════════════════════════════╗
║ Huisdier 1 van 2                ║
╠══════════════════════════════════╣
║ Naam *                           ║
║ ┌──────────────────────────────┐ ║
║ │ Max                          │ ║
║ └──────────────────────────────┘ ║
║                                  ║
║ Diersoort *                      ║
║ ┌──────────────────────────────┐ ║
║ │ Hond ▼                       │ ║
║ └──────────────────────────────┘ ║
║                                  ║
║ Ras (optioneel)    Leeftijd     ║
║ ┌──────────────┐  ┌───────────┐ ║
║ │ Labrador     │  │ 3         │ ║
║ └──────────────┘  └───────────┘ ║
╚══════════════════════════════════╝

╔══════════════════════════════════╗
║ Huisdier 2 van 2                ║
╠══════════════════════════════════╣
║ [Zelfde formulier]               ║
╚══════════════════════════════════╝
```

---

## ✅ **VALIDATIE**

### **Per Huisdier:**
- ❌ Naam leeg → "Naam voor huisdier 1 is verplicht"
- ❌ Soort niet geselecteerd → "Soort voor huisdier 1 is verplicht"
- ✅ Naam + soort ingevuld → Groen, kan verder

### **Submit Knop:**
```
Als ALLE velden correct zijn:
✅ Knop wordt actief (emerald groen)

Als 1 huisdier naam mist:
❌ Knop blijft disabled (grijs)
📋 Error: "Naam voor huisdier 2 is verplicht"
```

---

## 🔄 **FLOW**

### **1. Registratie met 2 huisdieren:**
```
STAP 1: Basis info
├─ Voornaam: Jan
├─ Achternaam: Pieters
├─ Email: jan@test.nl
└─ Wachtwoord: ******

STAP 2: Rol selecteren
└─ ✅ Eigenaar (huisdieren sectie verschijnt)

STAP 3: Aantal huisdieren
└─ ✅ Klik "2"

STAP 4: Huisdier 1
├─ Naam: Max
├─ Soort: Hond
├─ Ras: Labrador
└─ Leeftijd: 3

STAP 5: Huisdier 2
├─ Naam: Luna
├─ Soort: Kat
├─ Ras: Pers
└─ Leeftijd: 2

STAP 6: Submit
└─ ✅ Account + 2 huisdieren aangemaakt!
```

### **2. Database:**
```
User created:
├─ id: abc123
├─ email: jan@test.nl
├─ firstName: Jan
└─ lastName: Pieters

Pets created:
├─ Pet 1:
│   ├─ ownerId: abc123
│   ├─ name: Max
│   ├─ type: DOG
│   ├─ breed: Labrador
│   └─ age: 3
│
└─ Pet 2:
    ├─ ownerId: abc123
    ├─ name: Luna
    ├─ type: CAT
    ├─ breed: Pers
    └─ age: 2
```

---

## 📊 **BACKEND API**

### **Request:**
```json
POST /api/auth/register
{
  "email": "jan@test.nl",
  "password": "test123456",
  "firstName": "Jan",
  "lastName": "Pieters",
  "role": "OWNER",
  "pets": [
    {
      "name": "Max",
      "type": "DOG",
      "breed": "Labrador",
      "age": "3"
    },
    {
      "name": "Luna",
      "type": "CAT",
      "breed": "Pers",
      "age": "2"
    }
  ]
}
```

### **Response:**
```json
{
  "user": {
    "id": "abc123",
    "email": "jan@test.nl",
    "firstName": "Jan",
    "lastName": "Pieters",
    "role": "OWNER"
  },
  "message": "Account succesvol aangemaakt."
}
```

---

## 🧪 **TEST INSTRUCTIES**

### **Test 1: 1 Huisdier**
```
1. http://localhost:3000/auth/register
2. Klik "Eigenaar"
3. Vul basisgegevens in
4. Default: 1 huisdier formulier zichtbaar
5. Vul naam + soort in
6. ✅ Registreer
7. Check dashboard: 1 huisdier zichtbaar
```

### **Test 2: Meerdere Huisdieren**
```
1. Klik "Eigenaar"
2. Vul basisgegevens in
3. Klik "3" bij aantal huisdieren
4. ✅ 3 formulieren verschijnen
5. Vul elk formulier in:
   - Huisdier 1: Max (Hond)
   - Huisdier 2: Luna (Kat)
   - Huisdier 3: Pip (Vogel)
6. ✅ Registreer
7. Check dashboard: 3 huisdieren zichtbaar!
```

### **Test 3: Test Knop (Quick Fill)**
```
1. Klik "Test Eigenaar" knop
2. ✅ Alle velden + 2 huisdieren ingevuld
3. ✅ Direct kunnen registreren
4. Check dashboard: Max + Luna zichtbaar
```

### **Test 4: Validatie**
```
1. Klik "2" bij aantal huisdieren
2. Vul alleen huisdier 1 in
3. Laat huisdier 2 naam leeg
4. Probeer te registreren
5. ❌ "Naam voor huisdier 2 is verplicht"
6. ❌ Knop blijft disabled
7. Vul naam in
8. ✅ Knop wordt actief
```

### **Test 5: Rol Wisselen**
```
1. Selecteer "Eigenaar"
2. ✅ Huisdieren sectie zichtbaar
3. Selecteer "Verzorger"
4. ✅ Huisdieren sectie verdwijnt
5. Selecteer weer "Eigenaar"
6. ✅ Huisdieren sectie terug (data behouden!)
```

---

## 🎯 **VOORDELEN**

### **Voor Gebruiker:**
- ✅ Alles in 1 keer invullen
- ✅ Geen aparte onboarding stap nodig
- ✅ Direct duidelijk hoeveel huisdieren
- ✅ Snellere registratie

### **Voor Platform:**
- ✅ Complete data direct beschikbaar
- ✅ Betere matching mogelijk
- ✅ Hogere conversie (minder stappen)
- ✅ Direct zichtbaar in dashboard

---

## 🔄 **ONBOARDING IMPACT**

### **Voorheen:**
```
Registratie (basis) 
  → Onboarding stap 1 (telefoon, stad)
  → Onboarding stap 2 (huisdieren toevoegen)
  → Onboarding stap 3 (voorkeuren)
  → Dashboard
```

### **Nu:**
```
Registratie (basis + huisdieren)
  → Onboarding stap 1 (telefoon, stad)
  → Onboarding stap 2 (SKIP - al ingevuld!)
  → Onboarding stap 3 (voorkeuren)
  → Dashboard
```

**Onboarding stap 2 kan nu automatisch overgeslagen worden als huisdieren al zijn toegevoegd!**

---

## ✅ **RESULTAAT**

**Eigenaren kunnen nu direct bij registratie:**
- ✅ 1-5 huisdieren toevoegen
- ✅ Naam + soort verplicht per huisdier
- ✅ Ras + leeftijd optioneel
- ✅ Real-time validatie per huisdier
- ✅ Direct zichtbaar in dashboard
- ✅ Snellere registratie flow

**Test nu met "Test Eigenaar" knop en zie 2 huisdieren direct ingevuld!** 🐾




































