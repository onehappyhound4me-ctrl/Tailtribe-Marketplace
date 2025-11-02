# ❌ Annulering Systeem - Owner & Verzorger

## 🔍 **HUIDIGE SITUATIE**

### **Backend:** ✅ Volledig Geïmplementeerd
- ✅ API: `/api/bookings/[id]/cancel` (voor owners)
- ✅ API: `/api/bookings/[id]/status` (voor caregivers - ACCEPT/DECLINE)
- ✅ Cancellation logic met refund berekening
- ✅ Authorization checks

### **Frontend:** ❌ ONTBREEKT
- ❌ Geen cancel knop in booking detail pagina
- ❌ Geen accept/decline knoppen zichtbaar
- ❌ Geen cancellation policy weergave

---

## 📋 **ANNULERING REGELS**

### **OWNER Kan Annuleren:**

#### **100% Terugbetaling:**
```
Voorwaarden:
✅ >24 uur voor booking start
✅ Vóór 12:00 uur (middag)

Voorbeeld:
Booking: Vrijdag 10:00
Annuleer: Woensdag 11:00
→ 100% refund (€360)
```

#### **50% Terugbetaling:**
```
Voorwaarden:
✅ Vóór booking start
❌ MAAR na 12:00 of binnen 24u

Voorbeeld:
Booking: Vrijdag 10:00
Annuleer: Donderdag 15:00
→ 50% refund (€180, fee €180)
```

#### **0% Terugbetaling:**
```
Voorwaarden:
❌ Booking al gestart of voorbij

Voorbeeld:
Booking: Vrijdag 10:00
Annuleer: Vrijdag 14:00
→ 0% refund (fee €360)
```

---

### **CAREGIVER Kan:**

#### **ACCEPT (Accepteren):**
```
Status: PENDING → ACCEPTED
Wanneer: Voor startAt
Effect:
- Owner krijgt bevestiging
- Betaling wordt verwerkt
- Service gaat door
```

#### **DECLINE (Afwijzen):**
```
Status: PENDING → DECLINED
Wanneer: Voor startAt
Effect:
- Owner krijgt notificatie
- 100% refund automatisch
- Owner moet andere verzorger zoeken
```

#### **CANNOT Cancel:**
```
❌ Verzorgers kunnen NIET annuleren
❌ Alleen via support (steven@tailtribe.be)

Waarom?
- Voorkomt last-minute cancels
- Beschermt owners
- Platform heeft oversight
```

---

## 🎨 **UI IMPLEMENTATIE (TE DOEN)**

### **1. Owner - Booking Detail Pagina**

#### **Cancel Knop (Conditionally):**
```jsx
{booking.status === 'PENDING' || booking.status === 'ACCEPTED' ? (
  <CancellationWidget 
    booking={booking}
    onCancel={(bookingId) => handleCancel(bookingId)}
  />
) : null}
```

#### **UI Design:**
```
┌─────────────────────────────────────────────┐
│ Booking Details                             │
│ Status: PENDING / ACCEPTED                  │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠️ Annulering                               │
│                                             │
│ Huidige refund percentage:                  │
│ • >24u & vóór 12:00: 100% (€360)           │
│ • Anders: 50% (€180)                        │
│                                             │
│ [Toon Refund Calculator] [Annuleer Boeking]│
│                                             │
└─────────────────────────────────────────────┘
```

---

### **2. Caregiver - Booking Detail Pagina**

#### **Accept/Decline Knoppen:**
```jsx
{booking.status === 'PENDING' && iAmCaregiver ? (
  <div className="flex gap-4">
    <Button 
      onClick={() => handleAccept(booking.id)}
      className="bg-green-600"
    >
      ✓ Accepteren
    </Button>
    <Button 
      onClick={() => handleDecline(booking.id)}
      className="bg-red-600"
    >
      ✗ Afwijzen
    </Button>
  </div>
) : null}
```

#### **UI Design:**
```
┌─────────────────────────────────────────────┐
│ Nieuwe Booking Aanvraag                     │
│ Van: Jan Janssen                            │
│ Huisdier: Max (Hond - Golden Retriever)    │
│ Datum: 25-27 oktober 2025                  │
│ Totaal: €360                                │
├─────────────────────────────────────────────┤
│                                             │
│ [✓ Accepteren]  [✗ Afwijzen]               │
│                                             │
│ ℹ️ Na acceptatie kun je niet annuleren.    │
│    Neem contact op met support bij nood.   │
│                                             │
└─────────────────────────────────────────────┘
```

---

### **3. Dashboard - Bookings Overview**

#### **Status Badges:**
```jsx
<StatusBadge status={booking.status} />

PENDING   → 🟡 In afwachting
ACCEPTED  → 🟢 Geaccepteerd
DECLINED  → 🔴 Afgewezen
PAID      → 💰 Betaald
COMPLETED → ✅ Voltooid
CANCELLED → ❌ Geannuleerd
REFUNDED  → 💸 Terugbetaald
```

#### **Quick Actions:**
```jsx
{isOwner && status === 'PENDING' && (
  <button>❌ Annuleer</button>
)}

{isCaregiver && status === 'PENDING' && (
  <>
    <button>✓ Accept</button>
    <button>✗ Decline</button>
  </>
)}

{status === 'ACCEPTED' && (
  <button>💬 Bericht</button>
)}
```

---

## 🛠️ **TE IMPLEMENTEREN COMPONENTEN**

### **Component 1: CancellationWidget**
```typescript
// src/components/booking/CancellationWidget.tsx

interface Props {
  booking: Booking
  onCancel: (bookingId: string) => Promise<void>
}

export function CancellationWidget({ booking, onCancel }: Props) {
  // Show cancellation calculator
  // Show refund percentage
  // Confirm dialog
  // Handle cancel API call
}
```

### **Component 2: CaregiverBookingActions**
```typescript
// src/components/booking/CaregiverBookingActions.tsx

interface Props {
  booking: Booking
  onAccept: (bookingId: string) => Promise<void>
  onDecline: (bookingId: string) => Promise<void>
}

export function CaregiverBookingActions({ booking, onAccept, onDecline }: Props) {
  // Show accept/decline buttons
  // Confirmation dialogs
  // Handle API calls
}
```

### **Component 3: StatusBadge**
```typescript
// src/components/booking/StatusBadge.tsx

interface Props {
  status: string
}

export function StatusBadge({ status }: Props) {
  const config = {
    PENDING: { color: 'yellow', icon: '🟡', label: 'In afwachting' },
    ACCEPTED: { color: 'green', icon: '🟢', label: 'Geaccepteerd' },
    DECLINED: { color: 'red', icon: '🔴', label: 'Afgewezen' },
    // etc...
  }
}
```

---

## 📱 **USER STORIES**

### **Story 1: Owner Annuleert Vroeg**
```
Gegeven: Jan heeft Max geboekt voor vrijdag 10:00
Wanneer: Jan annuleert woensdag 09:00
Dan:
  ✅ Refund calculator toont: 100% (€360)
  ✅ Bevestiging: "Weet je het zeker?"
  ✅ API call naar /cancel
  ✅ Status: CANCELLED
  ✅ Owner ziet: "€360 wordt terugbetaald"
  ✅ Caregiver krijgt notificatie
```

### **Story 2: Owner Annuleert Laat**
```
Gegeven: Jan heeft Max geboekt voor vrijdag 10:00
Wanneer: Jan annuleert donderdag 18:00
Dan:
  ⚠️ Refund calculator toont: 50% (€180)
  ⚠️ Warning: "Je krijgt €180 terug, €180 annuleringskosten"
  ✅ Bevestiging: "Weet je het zeker?"
  ✅ API call naar /cancel
  ✅ Status: CANCELLED
  ✅ Owner ziet: "€180 wordt terugbetaald"
  ✅ Caregiver krijgt €180 (50% fee)
```

### **Story 3: Verzorger Accepteert**
```
Gegeven: Marie krijgt booking aanvraag van Jan
Wanneer: Marie klikt "Accepteren"
Dan:
  ✅ Status: PENDING → ACCEPTED
  ✅ Jan krijgt notificatie
  ✅ Betaling wordt verwerkt
  ✅ Marie kan niet meer annuleren
```

### **Story 4: Verzorger Wijst Af**
```
Gegeven: Marie krijgt booking aanvraag van Jan
Wanneer: Marie klikt "Afwijzen"
Dan:
  ✅ Status: PENDING → DECLINED
  ✅ Jan krijgt notificatie
  ✅ 100% refund automatisch
  ✅ Jan zoekt andere verzorger
```

### **Story 5: Verzorger Probeert Te Annuleren**
```
Gegeven: Marie heeft booking geaccepteerd
Wanneer: Marie wil annuleren
Dan:
  ❌ Geen cancel knop
  ℹ️ Banner: "Neem contact op met support"
  ℹ️ Support email: steven@tailtribe.be
  ✅ Admin kan booking handmatig annuleren
```

---

## ⚙️ **IMPLEMENTATIE PRIORITEIT**

### **CRITICAL (Must Have):**
1. **Owner cancel knop** - In booking detail pagina
2. **Caregiver accept/decline** - In dashboard & detail pagina
3. **Status badges** - Overal waar bookings getoond worden
4. **Refund calculator** - Voor owner annulering

### **IMPORTANT (Should Have):**
5. **Cancellation policy pagina** - `/cancellation-policy`
6. **Email notificaties** - Bij alle status changes
7. **Refund tracking** - Admin dashboard

### **NICE TO HAVE:**
8. **Cancel reason selection** - Waarom annuleer je?
9. **Partial cancellation** - Annuleer enkele dagen (complex!)
10. **Automatic reminders** - "Accept booking binnen 24u"

---

## 🚀 **IMPLEMENTATIE PLAN**

### **Task 1: CancellationWidget Component (1 uur)**
```bash
src/components/booking/CancellationWidget.tsx
├── Refund calculator UI
├── Confirmation dialog
├── API integration
└── Error handling
```

### **Task 2: CaregiverBookingActions Component (1 uur)**
```bash
src/components/booking/CaregiverBookingActions.tsx
├── Accept/Decline buttons
├── Confirmation dialogs
├── API integration
└── Optimistic updates
```

### **Task 3: Update Booking Detail Page (30 min)**
```bash
src/app/booking/[id]/page.tsx
├── Import nieuwe components
├── Conditionally render based on user role
├── Add status badge
└── Test all scenarios
```

### **Task 4: Update Dashboard (30 min)**
```bash
src/components/dashboard/BookingsList.tsx
├── Add cancel button voor owners
├── Add accept/decline voor caregivers
└── Add status badges
```

**TOTAL: ~3 uur werk**

---

## 📊 **CURRENT vs NEEDED**

### **Wat er NU is:**
```
✅ Backend API's compleet
✅ Cancellation logic werkt
✅ Refund berekening correct
✅ Authorization rules ingesteld
❌ MAAR: Geen UI knoppen!
```

### **Wat er MOET komen:**
```
┌──────────────┬──────────┬─────────┐
│ Feature      │ Backend  │ Frontend│
├──────────────┼──────────┼─────────┤
│ Owner Cancel │ ✅ Done  │ ❌ TODO │
│ Caregiver    │          │         │
│  Accept      │ ✅ Done  │ ❌ TODO │
│ Caregiver    │          │         │
│  Decline     │ ✅ Done  │ ❌ TODO │
│ Refund Calc  │ ✅ Done  │ ❌ TODO │
│ Status Badge │ ✅ Done  │ ❌ TODO │
└──────────────┴──────────┴─────────┘
```

---

## 💡 **QUICK FIX GUIDE**

### **Tijdelijke Oplossing (tot UI klaar is):**

#### **Voor Owners:**
```
1. Ga naar booking detail pagina
2. Klik "Bericht Sturen"
3. Typ: "Ik wil graag annuleren"
4. Admin verwerkt handmatig

OF gebruik Prisma Studio:
1. Open booking in database
2. Change status naar "CANCELLED"
3. Process refund manually
```

#### **Voor Caregivers:**
```
1. Ga naar booking in dashboard
2. Klik "Details"
3. Klik "Bericht Sturen"
4. Typ: "Ik accepteer" of "Ik moet afwijzen"
5. Admin update status handmatig

OF gebruik Prisma Studio:
1. Open booking in database
2. Change status naar "ACCEPTED" of "DECLINED"
```

---

## 🎯 **RECOMMENDED NEXT STEPS**

### **Optie A: Minimale UI (1 uur)**
Alleen de essentiële knoppen toevoegen zonder fancy UI

### **Optie B: Volledige UI (3 uur)**
Complete cancellation widgets met calculators en confirmatie dialogs

### **Optie C: Admin Dashboard (2 uur)**
Admin tool om alle cancellations handmatig te verwerken

**🎯 AANBEVELING: Start met Optie A (minimaal maar werkend)**

---

## ⚠️ **BELANGRIJKE NOTES**

### **Verzorger Bescherming:**
```
Waarom kunnen verzorgers niet zelf annuleren?

1. Voorkomt last-minute cancellations
2. Owner heeft zekerheid
3. Platform mediation bij disputes
4. Verzorger rating blijft eerlijk

Maar wel:
✅ Kunnen DECLINE bij nieuwe booking
✅ Kunnen support contacteren voor annulering
✅ Admin kan altijd annuleren met reden
```

### **Refund Timing:**
```
Wanneer krijgt owner refund?

Auto-refund (Stripe):
- Bij DECLINED door caregiver: Instant
- Bij owner cancel >24u: 5-10 werkdagen
- Bij owner cancel <24u: 5-10 werkdagen (50%)

Manual refund (Admin):
- Bij caregiver cancel via support: 1-3 werkdagen
- Bij dispute: Na resolutie
```

---

## 📞 **SUPPORT FLOW**

### **Caregiver Wil Annuleren:**
```
1. Caregiver ziet in booking detail:
   ℹ️ "Kan niet annuleren? Contact support:
       steven@tailtribe.be"

2. Caregiver stuurt email met:
   - Booking ID
   - Reden voor annulering
   - Voorgestelde oplossing

3. Admin checkt:
   - Is reden geldig?
   - Hoeveel tijd tot booking?
   - Impact op owner

4. Admin besluit:
   - Annuleer + full refund owner
   - Annuleer + partial refund owner
   - Decline annulering (caregiver moet doorgaan)

5. Admin update status + notificeert beide partijen
```

---

## 📈 **METRICS TE TRACKEN**

### **Cancellation Rates:**
- % bookings cancelled door owner
- % bookings declined door caregiver
- Average time between booking & cancellation
- Refund percentages (100% vs 50% vs 0%)

### **Abuse Detection:**
- Owners die >50% annuleren → Flag
- Caregivers die >30% decline → Flag
- Last-minute cancellations (owner) → Track
- Frequent support requests (caregiver) → Track

### **Financial Impact:**
- Total refunds per maand
- Platform fees lost to cancellations
- Average cancellation fee collected

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Backend (Already Done):**
- [x] Cancel API endpoint
- [x] Status update API
- [x] Cancellation logic
- [x] Refund calculation
- [x] Authorization rules
- [x] Database schema

### **Frontend (TO DO):**
- [ ] CancellationWidget component
- [ ] CaregiverBookingActions component
- [ ] StatusBadge component
- [ ] Update booking detail page (owner view)
- [ ] Update booking detail page (caregiver view)
- [ ] Update dashboard bookings list
- [ ] Confirmation dialogs
- [ ] Error handling
- [ ] Loading states
- [ ] Success messages

### **Testing:**
- [ ] Owner cancel (>24h, <12:00) → 100% refund
- [ ] Owner cancel (<24h) → 50% refund
- [ ] Owner cancel (after start) → 0% refund, error
- [ ] Caregiver accept → status ACCEPTED
- [ ] Caregiver decline → status DECLINED, 100% refund
- [ ] Caregiver try cancel → error message
- [ ] Non-authorized user → 403 error

---

## 🚨 **URGENT ACTION NEEDED**

**Het annuleer systeem werkt op de backend maar is NIET toegankelijk voor users!**

**Tijdelijke oplossing:**
- Verwerk annuleringen via support email
- Update status handmatig in Prisma Studio

**Permanente oplossing:**
- Implementeer UI componenten (~3 uur werk)
- Test alle scenario's
- Deploy

**Prioriteit:** ⚠️ HIGH (voor productie launch)

---

**Last Updated:** 2025-01-20  
**Status:** ❌ Backend ✅ / Frontend ❌  
**Owner:** Steven @ TailTribe




















