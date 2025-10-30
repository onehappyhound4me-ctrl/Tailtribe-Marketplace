# ⚡ TAILTRIBE - QUICK START

## 🚀 Start de site (30 seconden)

```bash
cd C:\dev\TailTribe-Final.bak_20251007_233850
npm run dev
```

Open: **http://localhost:3000**

---

## 🧪 TEST ACCOUNTS

```
Verzorger: sarah.janssens@example.com / password123
Eigenaar:  jan.vermeersch@example.com / password123
Admin:     admin@tailtribe.be / password123
```

---

## 📝 SNELLE TEST SCENARIO

### 1️⃣ **Als Eigenaar (Jan)**
```
1. Login → jan.vermeersch@example.com
2. Ga naar /search
3. Klik op Sarah Janssens
4. Klik "Boek Sarah Janssens"
5. Selecteer morgen, 10:00 - 12:00
6. Klik "Bevestig boeking"
7. Zie boeking in /dashboard
```

### 2️⃣ **Als Verzorger (Sarah)**
```
1. Login → sarah.janssens@example.com
2. Ga naar /dashboard
3. Zie nieuwe boeking van Jan
4. Klik "Accepteren"
5. Boeking status = ACCEPTED
```

### 3️⃣ **Berichten sturen**
```
1. Als Jan: /messages/[bookingId]
2. Type "Hoi Sarah!"
3. Als Sarah: Zie bericht (auto-refresh 5 sec)
4. Reply "Hoi Jan! Zie je morgen!"
```

### 4️⃣ **Als Admin**
```
1. Login → admin@tailtribe.be
2. Ga naar /admin
3. Zie stats: users, bookings, revenue (20%)
4. Goedkeur nieuwe verzorgers
```

---

## 🛠️ HANDIGE COMMANDS

```bash
# Database opnieuw inladen met test data
npm run db:seed:advanced

# Prisma Studio (database UI)
npm run db:studio

# Check productie-gereedheid
npm run production:check

# Type checking
npm run typecheck

# Build voor productie
npm run build
```

---

## 🎯 FEATURES OM TE TESTEN

✅ **Homepage** - Marketing pagina met diensten  
✅ **Registratie** - Nieuwe account (eigenaar of verzorger)  
✅ **Login** - Inloggen met test account  
✅ **Zoeken** - Filter op stad/service/prijs  
✅ **Booking maken** - Modal met datum/tijd  
✅ **Booking accepteren** - Als verzorger  
✅ **Messaging** - Chat per boeking  
✅ **Review schrijven** - Na boeking  
✅ **Profile edit** - Foto upload + bio  
✅ **Stripe onboarding** - Connect account  
✅ **Admin dashboard** - Stats + user management  

---

## 💰 COMMISSIE TESTEN

1. Maak boeking van €50
2. Check database:
   - `amountCents`: 5000
   - `platformFeeCents`: 1000 (20%)
   - `caregiverAmountCents`: 4000

3. Admin kan payout doen via:
   ```
   POST /api/stripe/payout
   { "bookingId": "..." }
   ```

---

## 🐛 TROUBLESHOOTING

**"Port 3000 in use":**
```bash
Get-Process -Name node | Stop-Process -Force
npm run dev
```

**"Database error":**
```bash
npm run db:push
npm run db:seed:advanced
```

**"Can't read .env":**
- Check dat `.env.local` bestaat
- Bevat: `DATABASE_URL`, `NEXTAUTH_SECRET`, etc.

---

## 📱 MOBILE TESTEN

1. Start server
2. Find je local IP: `ipconfig` → IPv4
3. Open op telefoon: `http://[YOUR-IP]:3000`
4. Test responsive design

---

## ✨ DE SITE IS COMPLEET - TEST EN GENIET!

**Alles werkt. Have fun! 🎉🐾**




