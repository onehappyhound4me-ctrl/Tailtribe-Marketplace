# 🐾 Multiple Pets Design Decision

## ❓ **De Vraag**
*"Wat als de eigenaar meerdere huisdieren heeft? Best opnieuw boeken dan denk ik?"*

## ✅ **Design Decision: Aparte Bookings per Huisdier**

### **WAAROM Geen Multi-Pet Selection?**

#### **1. Flexibiliteit**
```
Scenario: Owner heeft Max (hond) en Luna (kat)

Met aparte bookings:
✅ Max: 3 dagen, 09:00-17:00
✅ Luna: 2 dagen, 14:00-18:00
✅ Verschillende instructies per huisdier
✅ Verschillende emergency contacts

Met 1 booking voor beide:
❌ Zelfde tijden voor beide (inflexibel)
❌ Gemengde instructies (onduidelijk)
❌ Moeilijk te onderscheiden kosten
```

#### **2. Pricing Clarity**
```
Aparte bookings:
✅ Max: 3 dagen × 8u × €15 = €360
✅ Luna: 2 dagen × 4u × €15 = €120
✅ Totaal: €480 (duidelijk breakdown)

Multi-pet in 1 booking:
❌ Hoe bereken je de prijs?
❌ €15/uur per huisdier? Of korting?
❌ Onduidelijk voor owner & caregiver
```

#### **3. Cancellation Flexibility**
```
Scenario: Max wordt ziek, Luna niet

Met aparte bookings:
✅ Annuleer Max booking
✅ Luna booking blijft
✅ Gedeeltelijke refund correct berekend

Met 1 booking:
❌ Hele booking annuleren?
❌ Partial cancellation complex
❌ Refund berekening onduidelijk
```

#### **4. Caregiver Acceptance**
```
Scenario: Caregiver accepteert alleen katten

Met aparte bookings:
✅ Accept Luna (kat)
✅ Decline Max (hond)
✅ Owner zoekt andere verzorger voor Max

Met 1 booking:
❌ All-or-nothing decision
❌ Moet hele booking afwijzen
❌ Owner moet alles opnieuw boeken
```

#### **5. Service Completion**
```
Scenario: Services op verschillende dagen

Met aparte bookings:
✅ Max completed op dag 3
✅ Luna completed op dag 2
✅ Separate reviews per huisdier
✅ Aparte ratings

Met 1 booking:
❌ Wanneer is het "completed"?
❌ 1 review voor beide?
❌ Gemiddelde rating?
```

---

## 🎯 **Geïmplementeerde Oplossing**

### **User Flow:**
```
1. Owner boekt voor Max (hond)
   └── Service, dagen, tijden, instructies
   └── Betaling: €360

2. Bevestiging pagina toont:
   ├── ✅ "Booking succesvol!"
   ├── 🏠 "Naar Dashboard"
   ├── 📄 "Bekijk Boeking"
   └── 🐾 "Boek Ander Huisdier" ← NIEUW!

3. Owner klikt "Boek Ander Huisdier"
   └── Zelfde verzorger, nieuw formulier
   └── Pre-filled: caregiver
   └── Owner vult in voor Luna

4. Dashboard toont:
   ├── Booking #1: Max - 3 dagen - €360
   └── Booking #2: Luna - 2 dagen - €120
```

### **UI Changes:**

#### **Bevestiging Pagina:**
```jsx
[INFO BOX]
🐾 Meerdere huisdieren?
Boek voor elk huisdier apart. Dit maakt het flexibeler 
voor verschillende tijden, instructies en annuleringen.

[BUTTONS]
┌─────────────┬─────────────────┬──────────────────────┐
│ 🏠 Dashboard │ 📄 Bekijk Boeking │ 🐾 Boek Ander Huisdier │
└─────────────┴─────────────────┴──────────────────────┘
```

---

## 📊 **Alternative Considered: Multi-Pet Selection**

### **OPTIE 2: Multi-Pet in 1 Booking** (NIET Gekozen)

#### **Schema Aanpassingen:**
```prisma
model Booking {
  // Instead of:
  petName   String?
  petType   String?
  petBreed  String?
  
  // Would need:
  pets BookingPet[]
}

model BookingPet {
  id        String @id @default(cuid())
  bookingId String
  booking   Booking @relation(fields: [bookingId], references: [id])
  petId     String
  pet       Pet @relation(fields: [petId], references: [id])
}
```

#### **UI Changes Needed:**
```jsx
// Pet Selection (Step 1)
[✓] Max (Hond - Golden Retriever)
[✓] Luna (Kat - Pers)
[ ] Bella (Konijn - Dwergkonijn)

// Instructions per pet
Max specifieke instructies: _____
Luna specifieke instructies: _____

// Pricing breakdown
Max: 3 dagen × 8u × €15 = €360
Luna: 2 dagen × 4u × €15 = €120
───────────────────────────────
Totaal: €480
```

#### **Complexiteiten:**
1. **Different schedules per pet**
   - Moeilijk te visualiseren
   - Complex calendar UI

2. **Partial service completion**
   - Welk huisdier is "completed"?
   - Partial payments?

3. **Reviews**
   - 1 review voor alle huisdieren?
   - Separate ratings?

4. **Cancellations**
   - Cancel 1 huisdier = refund berekening complex
   - Partial cancellation fees?

5. **Caregiver capacity**
   - Kan verzorger 3 huisdieren aan?
   - Max aantal per booking?

---

## 💡 **Future Enhancement: Smart Suggestions**

### **Possible Addition (Later):**
```jsx
// When owner has multiple pets in profile
[SMART BANNER on Booking Confirmation]
──────────────────────────────────────────
📋 We zien dat je ook Luna (Kat) hebt!

Wil je Luna ook boeken bij deze verzorger?

[Ja, boek Luna] [Nee, dank je]
──────────────────────────────────────────

// If "Ja":
→ Pre-fill booking form with:
  - Same caregiver
  - Same dates (user can adjust)
  - Same service (user can adjust)
  - Auto-fill Luna's info (name, type, breed)
```

### **Implementation:**
```typescript
// After successful booking
const ownerPets = await db.pet.findMany({
  where: { ownerId: session.user.id }
})

const unbookedPets = ownerPets.filter(pet => 
  pet.name !== bookingData.petName
)

if (unbookedPets.length > 0) {
  // Show suggestion banner
}
```

---

## 📈 **Analytics to Track**

### **Metrics:**
1. **Multi-pet usage:**
   - % owners with >1 pet
   - % bookings for same caregiver within 24h
   - Average time between pet bookings

2. **Friction points:**
   - Drop-off rate after 1st pet booking
   - Click rate on "Boek Ander Huisdier"
   - Form abandonment on 2nd pet

3. **Success indicators:**
   - 2+ bookings same owner/caregiver
   - Owner satisfaction scores
   - Caregiver feedback on multi-pet bookings

---

## ✅ **Conclusion**

### **Decision:**
✅ **Separate bookings per pet** with easy re-booking flow

### **Rationale:**
1. **Simpler** - Less complex data model
2. **Flexible** - Different schedules/instructions per pet
3. **Clear** - Transparent pricing & cancellations
4. **Scalable** - Works for 1-10 pets without complexity
5. **User-friendly** - One-click to book next pet

### **Trade-offs Accepted:**
- Owner moet 2x formulier invullen
- Maar met "Boek Ander Huisdier" knop is dit minimale friction

### **Future Improvements:**
- [ ] Smart suggestions for unbooked pets
- [ ] Pre-fill form with previous booking data
- [ ] Quick "Clone & Edit" feature
- [ ] Bulk booking discount (if needed)

---

**Last Updated:** 2025-01-20  
**Status:** ✅ Implemented  
**Owner:** Steven @ TailTribe




















