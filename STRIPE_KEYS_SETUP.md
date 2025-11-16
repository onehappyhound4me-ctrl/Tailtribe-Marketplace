# 💳 Stripe Keys Setup - Test & Live

## ✅ JA - Test Keys Kunnen Naast Live Keys Staan

Je kunt **beide** hebben in Vercel, maar je moet ze **correct configureren**.

---

## 🔑 Optie 1: Gebruik Environment Variables (Aanbevolen)

### Voor Productie (Live Keys):
**Environment:** `Production`

```
STRIPE_SECRET_KEY=sk_live_... (live key)
STRIPE_PUBLISHABLE_KEY=pk_live_... (live key)
STRIPE_WEBHOOK_SECRET=whsec_... (live webhook secret)
```

### Voor Testing (Test Keys):
**Environment:** `Preview` of `Development`

```
STRIPE_SECRET_KEY=sk_test_... (test key)
STRIPE_PUBLISHABLE_KEY=pk_test_... (test key)
STRIPE_WEBHOOK_SECRET=whsec_... (test webhook secret)
```

**Voordeel:** Automatisch de juiste keys per environment

---

## 🔑 Optie 2: Gebruik Aparte Variables (Als Je Beide Wilt Testen)

### In Vercel Environment Variables:

**Production Environment:**
```
STRIPE_SECRET_KEY=sk_live_... (live key)
STRIPE_PUBLISHABLE_KEY=pk_live_... (live key)
STRIPE_WEBHOOK_SECRET=whsec_... (live webhook secret)
```

**Preview/Development Environment:**
```
STRIPE_SECRET_KEY=sk_test_... (test key)
STRIPE_PUBLISHABLE_KEY=pk_test_... (test key)
STRIPE_WEBHOOK_SECRET=whsec_... (test webhook secret)
```

**Voordeel:** Je kunt testen met test keys zonder live keys te veranderen

---

## 🧪 Voor Testing: Gebruik Test Keys

### Waarom Test Keys?
- ✅ **Gratis** - Geen echte kosten
- ✅ **Veilig** - Geen echte betalingen
- ✅ **Test cards** - `4242 4242 4242 4242` werkt alleen met test keys
- ✅ **Geen risico** - Geen echte geld transacties

### Hoe Te Testen Met Test Keys:

**Optie A: Tijdelijk Test Keys In Production (Niet Aanbevolen)**
```
1. Ga naar Vercel → Environment Variables
2. Wijzig STRIPE_SECRET_KEY naar sk_test_...
3. Wijzig STRIPE_PUBLISHABLE_KEY naar pk_test_...
4. Redeploy
5. Test met test cards
6. Wijzig terug naar live keys
7. Redeploy
```

**Optie B: Gebruik Preview Environment (Aanbevolen)**
```
1. Maak preview deployment
2. Zet test keys in Preview environment
3. Test op preview URL
4. Production blijft met live keys
```

---

## ⚠️ BELANGRIJK: Test Cards Werken Alleen Met Test Keys

### Test Cards (zoals `4242 4242 4242 4242`):
- ✅ Werken met: `sk_test_...` (test keys)
- ❌ Werken NIET met: `sk_live_...` (live keys)

### Live Cards (echte credit cards):
- ✅ Werken met: `sk_live_...` (live keys)
- ❌ Werken NIET met: `sk_test_...` (test keys)

---

## 🔍 Hoe Te Checken Welke Keys Je Nu Gebruikt

### Check Vercel:
1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer:** TailTribe project
3. **Ga naar:** Settings → Environment Variables
4. **Check:** `STRIPE_SECRET_KEY`
   - Begint met `sk_test_` → Test keys
   - Begint met `sk_live_` → Live keys

### Check Code:
De code gebruikt altijd `process.env.STRIPE_SECRET_KEY`, dus welke key je in Vercel zet, die wordt gebruikt.

---

## 📋 Aanbevolen Setup

### Voor Testing (Nu):
**Production Environment:**
```
STRIPE_SECRET_KEY=sk_test_... (tijdelijk test key)
STRIPE_PUBLISHABLE_KEY=pk_test_... (tijdelijk test key)
STRIPE_WEBHOOK_SECRET=whsec_... (test webhook secret)
```

**Waarom?**
- Je kunt testen met test cards
- Geen risico op echte betalingen
- Makkelijk te switchen naar live keys later

### Voor Launch (Later):
**Production Environment:**
```
STRIPE_SECRET_KEY=sk_live_... (live key)
STRIPE_PUBLISHABLE_KEY=pk_live_... (live key)
STRIPE_WEBHOOK_SECRET=whsec_... (live webhook secret)
```

**Waarom?**
- Echte betalingen worden verwerkt
- Echte geld transacties
- Test cards werken niet meer (dat is goed!)

---

## 🚀 Quick Setup Guide

### Stap 1: Haal Test Keys Op
1. **Log in** op Stripe Dashboard
2. **Zorg dat je in Test Mode bent** (toggle rechtsboven)
3. **Ga naar:** Developers → API keys
4. **Kopieer:**
   - `pk_test_...` (Publishable key)
   - `sk_test_...` (Secret key - klik "Reveal")

### Stap 2: Configureer Test Webhook
1. **Ga naar:** Developers → Webhooks
2. **Klik:** "Add endpoint"
3. **URL:** `https://www.tailtribe.be/api/stripe/webhook`
4. **Events:** `payment_intent.succeeded`, `charge.succeeded`, etc.
5. **Kopieer:** `whsec_...` (Signing secret)

### Stap 3: Voeg Test Keys Toe Aan Vercel
1. **Ga naar:** Vercel → Settings → Environment Variables
2. **Wijzig:**
   - `STRIPE_SECRET_KEY` → `sk_test_...` (test key)
   - `STRIPE_PUBLISHABLE_KEY` → `pk_test_...` (test key)
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (test webhook secret)
3. **Selecteer:** Production environment
4. **Klik:** "Save"
5. **Redeploy:** Deployments → Latest → "Redeploy"

### Stap 4: Test Met Test Card
1. **Ga naar:** https://www.tailtribe.be/search
2. **Maak boeking**
3. **Betaal met:** `4242 4242 4242 4242`
4. **Check:** Stripe Dashboard → Payments (test mode)
5. **Verwacht:** Betaling wordt verwerkt

### Stap 5: Later - Switch Naar Live Keys
1. **Haal live keys op** van Stripe Dashboard (Live mode)
2. **Wijzig in Vercel:**
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (live webhook)
3. **Redeploy**

---

## ⚠️ Veiligheid

### Test Keys:
- ✅ Veilig om te delen (alleen test mode)
- ✅ Geen echte betalingen mogelijk
- ✅ Kan worden gebruikt voor development

### Live Keys:
- ❌ **NOOIT** delen of committen
- ❌ Alleen gebruiken in productie
- ❌ Echte betalingen mogelijk

---

## 🔄 Switchen Tussen Test & Live

### Van Test Naar Live:
```
1. Haal live keys op van Stripe
2. Wijzig in Vercel → Environment Variables
3. Redeploy
4. Test met echte credit card (klein bedrag)
```

### Van Live Naar Test:
```
1. Haal test keys op van Stripe
2. Wijzig in Vercel → Environment Variables
3. Redeploy
4. Test met test card (4242 4242 4242 4242)
```

---

## 📊 Stripe Dashboard

### Test Mode Dashboard:
- **URL:** https://dashboard.stripe.com/test
- **Toont:** Alleen test transacties
- **Gebruik:** Voor development/testing

### Live Mode Dashboard:
- **URL:** https://dashboard.stripe.com
- **Toont:** Echte transacties
- **Gebruik:** Voor productie

---

## ✅ Checklist

### Voor Testing:
- [ ] Stripe test account aangemaakt
- [ ] Test keys opgehaald (`sk_test_...`, `pk_test_...`)
- [ ] Test webhook geconfigureerd
- [ ] Test keys toegevoegd aan Vercel (Production environment)
- [ ] Redeploy gedaan
- [ ] Getest met test card (`4242 4242 4242 4242`)

### Voor Launch:
- [ ] Live keys opgehaald (`sk_live_...`, `pk_live_...`)
- [ ] Live webhook geconfigureerd
- [ ] Live keys toegevoegd aan Vercel (Production environment)
- [ ] Redeploy gedaan
- [ ] Getest met echte credit card (klein bedrag)

---

## 💡 Tips

1. **Gebruik test keys voor testing** - Veiliger en gratis
2. **Switch naar live keys alleen voor launch** - Echte betalingen
3. **Test altijd eerst** - Met test card voordat je live gaat
4. **Check Stripe dashboard** - Zie welke mode je gebruikt
5. **Webhook moet matchen** - Test webhook voor test keys, live webhook voor live keys

---

**Laatste update:** 2025-01-13


