# TailTribe Setup Guide

## ✅ Wat is Nieuw Geïmplementeerd

### 1. **Onboarding Flows**
- ✅ **Verzorger onboarding** - 5-stappen wizard:
  - Stap 1: Profiel (bio, stad, telefoon)
  - Stap 2: Services selectie
  - Stap 3: Tarieven instellen
  - Stap 4: Beschikbaarheid
  - Stap 5: Certificaten (optioneel)
- ✅ **Eigenaar welcome** - Simpele welcome scherm met "Voeg huisdier toe"
- ✅ Automatische redirect naar juiste onboarding na registratie

### 2. **Admin Approval Systeem**
- ✅ Verzorgers moeten goedgekeurd worden voor zichtbaarheid
- ✅ `isApproved` vlag in database (standaard false)
- ✅ API endpoints voor admin approve/reject
- ✅ Pending caregivers lijst voor admin
- ✅ Email notificaties bij approval/rejection

### 3. **Booking Workflow**
- ✅ Verzorgers kunnen bookings accepteren/weigeren
- ✅ Status updates: PENDING → ACCEPTED/DECLINED → COMPLETED
- ✅ API endpoint voor status changes
- ✅ Email notificaties naar eigenaar bij accept/decline

### 4. **Stripe Payments (Complete Flow)**
- ✅ Payment Intent met 20% platform commissie
- ✅ Automatische transfer naar verzorger Stripe account
- ✅ Stripe Connect onboarding voor verzorgers
- ✅ Webhook voor payment confirmatie
- ✅ Payment tracking in database

### 5. **Email Notificaties**
- ✅ Booking request naar verzorger
- ✅ Booking confirmation naar eigenaar (accept/decline)
- ✅ Payment confirmation
- ✅ Review request na completed booking
- ✅ Caregiver approval notification
- ✅ Alle emails met HTML templates

### 6. **Empty States**
- ✅ Reusable EmptyState component
- ✅ Pre-configured empty states:
  - Geen boekingen
  - Geen huisdieren
  - Geen berichten
  - Geen reviews
  - Geen zoekresultaten
  - Profiel niet goedgekeurd
  - Profiel incompleet

### 7. **UI Improvements**
- ✅ Professionele dashboard card titels
- ✅ Moderne registratie formulier
- ✅ Consistent navigatie
- ✅ Video management header
- ✅ Search & booking pagina's gemoderniseerd

---

## 📋 Setup Instructies

### 1. **Database Setup**
```bash
# Push schema naar database
npm run db:push

# Seed database met demo data
npm run db:seed
```

### 2. **Environment Variables**
Maak `.env.local` met:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-met-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optioneel, maar aanbevolen)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (verplicht voor payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (verplicht voor emails)
RESEND_API_KEY="re_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLATFORM_COMMISSION_PERCENTAGE=20
```

### 2.5. **Google OAuth Setup** (Optioneel)
1. Ga naar https://console.cloud.google.com
2. Maak een nieuw project aan
3. Enable Google+ API
4. Ga naar Credentials → Create OAuth 2.0 Client ID
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Kopieer Client ID en Secret naar .env.local

**Zonder Google OAuth:**
- Users kunnen alleen registreren met email/wachtwoord
- Dat werkt prima, Google is alleen extra convenience

### 3. **Stripe Setup**
1. Maak account op https://stripe.com
2. Ga naar Developers → API Keys
3. Kopieer Secret Key en Publishable Key
4. Installeer Stripe CLI: https://stripe.com/docs/stripe-cli
5. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
6. Kopieer webhook signing secret

### 4. **Resend Setup (Email)**
1. Maak account op https://resend.com
2. Verify je domein (of gebruik dev email)
3. Genereer API key
4. Update RESEND_API_KEY in .env.local

### 5. **Start Development Server**
```bash
npm run dev
```

---

## 🧪 Testen

### Test Accounts Aanmaken

**Eigenaar:**
```
Email: eigenaar@test.nl
Password: test123
```

**Verzorger:**
```
Email: verzorger@test.nl  
Password: test123
```

**Admin:**
Maak een user aan en update in database:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@test.nl';
```

### Test Flow - Eigenaar (Email/Wachtwoord)
1. Registreer als eigenaar → selecteer role → welcome scherm
2. Voeg huisdier toe (optioneel)
3. Zoek verzorgers → maar je ziet er geen (nog niet approved)
4. Wacht tot admin goedkeurt

### Test Flow - Eigenaar (Google OAuth)
1. Klik "Registreer met Google" → Google login
2. Nieuwe user → Role selection scherm
3. Kies "Huisdiereigenaar" → welcome scherm
4. Voeg huisdier toe
5. Zoek verzorgers

### Test Flow - Verzorger (Email/Wachtwoord)
1. Registreer als verzorger → selecteer role → onboarding wizard (5 stappen)
2. Voltooi alle stappen (profiel, services, tarieven, beschikbaarheid, certificaten)
3. Profiel status: "In review" 
4. Admin keurt goed → email ontvangen
5. Nu zichtbaar in search results
6. Stel Stripe Connect in (Settings → Payments)

### Test Flow - Verzorger (Google OAuth)
1. Klik "Registreer met Google" → Google login
2. Nieuwe user → Role selection scherm
3. Kies "Dierenverzorger" → onboarding wizard (5 stappen)
4. Voltooi wizard
5. Wacht op admin approval
6. Email ontvangen → nu zichtbaar

### Test Flow - Booking
1. Eigenaar zoekt verzorger → "Boek Nu"
2. Verzorger ontvangt email + ziet booking in dashboard
3. Verzorger accepteert → eigenaar krijgt email
4. Eigenaar betaalt via Stripe
5. Na service: eigenaar krijgt review request email

### Test Flow - Admin
1. Login als admin
2. Ga naar `/admin`
3. Zie pending caregivers
4. Approve/reject verzorgers
5. Bekijk platform stats

---

### 7. **Profile Completion System** ✅
- ✅ Profile completion indicator in caregiver dashboard
- ✅ Dynamic percentage calculation
- ✅ Missing items lijst
- ✅ Approval status warnings
- ✅ Call-to-action buttons

### 8. **Availability Calendar** ✅
- ✅ Interactive monthly calendar
- ✅ Conflict detection met bookings
- ✅ Block/unblock dates
- ✅ Past dates disabled
- ✅ Visual indicators (available, booked, blocked)
- ✅ Real-time updates

### 9. **Form Validation Library** ✅
- ✅ Email validation
- ✅ Phone validation (Dutch format)
- ✅ Password strength checker
- ✅ Price validation
- ✅ Bio/text length validation
- ✅ Date validation
- ✅ Booking time validation
- ✅ Services selection validation
- ✅ XSS prevention (sanitization)
- ✅ Error handling wrapper
- ✅ Debounce function
- ✅ Toast integration

## 🚀 Volgende Stappen (Optioneel)

### Nice to Have Features

### Prioriteit 2 (Nice to Have)
- [ ] Real-time chat met WebSockets
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Loyalty program
- [ ] Referral system

---

## 📁 Belangrijke Files

### New Files Created
```
# Onboarding & Auth
/src/app/onboarding/caregiver/page.tsx      # Verzorger onboarding wizard (5 steps)
/src/app/onboarding/owner/page.tsx          # Eigenaar welcome scherm
/src/app/auth/role-selection/page.tsx       # Role selectie voor Google OAuth users

# API Endpoints
/src/app/api/profile/create-caregiver/route.ts  # Profiel aanmaken API
/src/app/api/profile/caregiver/route.ts     # Profiel ophalen API
/src/app/api/profile/set-role/route.ts      # Role instellen voor Google users
/src/app/api/admin/caregivers/pending/route.ts  # Pending verzorgers lijst
/src/app/api/admin/caregivers/[id]/approve/route.ts  # Approve/reject API
/src/app/api/bookings/[id]/status/route.ts  # Booking status update
/src/app/api/stripe/create-payment-intent/route.ts  # Payment met commissie

# Services & Utilities
/src/lib/email-notifications.ts             # Email templates & functions
/src/lib/validation.ts                      # Form validation utilities

# Components
/src/components/common/EmptyState.tsx       # Empty state component
/src/components/caregiver/ProfileCompletion.tsx  # Profile completion indicator
/src/components/caregiver/AvailabilityCalendar.tsx  # Availability calendar

# Documentation
SETUP_GUIDE.md                              # Complete setup & test guide
```

### Modified Files
```
/src/app/auth/signin/page.tsx               # Google OAuth button toegevoegd
/src/app/auth/register/page.tsx             # Google OAuth button toegevoegd
/src/app/dashboard/page.tsx                 # Role check & redirect logic
/src/app/dashboard/caregiver/page.tsx       # ProfileCompletion integration
/src/lib/auth.ts                            # JWT callback voor role updates
/src/app/api/caregivers/search/route.ts     # Alleen approved verzorgers
/src/app/api/bookings/[id]/status/route.ts  # Email notifications integration
/src/app/api/stripe/webhook/route.ts        # Payment confirmation handling
/prisma/schema.prisma                       # isApproved, stripeAccountId, payment fields
```

---

## ⚠️ Belangrijke Opmerkingen

1. **ID Upload** - Bewust NIET geïmplementeerd (privacy/GDPR)
2. **Email Verzending** - Werkt alleen met geldige Resend API key
3. **Stripe Payments** - Test mode keys gebruiken voor development
4. **Admin Role** - Moet handmatig in database gezet worden
5. **Approval System** - Alle nieuwe verzorgers zijn standaard niet approved

---

## 🐛 Known Issues / Limitations

1. Availability systeem is nog basic (geen conflict detection)
2. Profile completion percentage wordt nog niet berekend
3. Review request emails worden nog niet automatisch verstuurd na 24u
4. Geen real-time updates (polling nodig of WebSockets)

---

## 📞 Support

Voor vragen over de implementatie, check de code comments of vraag de AI agent! 🤖

Veel succes met je marketplace! 🐾

