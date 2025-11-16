# 🧪 Test Accounts & Stripe Setup Guide

## 📋 Test Accounts

### ⚠️ BELANGRIJK: Maak Je Eigen Test Accounts Aan

**Er zijn GEEN vooraf gemaakte test accounts in de database.**

Je moet zelf test accounts aanmaken via de registratie pagina:

### Stap 1: Maak Eigenaar Account
1. **Ga naar:** https://www.tailtribe.be/auth/register
2. **Selecteer:** "Ik ben een eigenaar"
3. **Vul in:**
   - Email: `test-owner@example.com` (of je eigen test email)
   - Wachtwoord: `test123456` (of kies je eigen wachtwoord)
   - Naam, stad, etc.
4. **Klik:** "Registreer"
5. **Noteer:** Email + wachtwoord voor later gebruik

### Stap 2: Maak Verzorger Account
1. **Open incognito venster** (of andere browser)
2. **Ga naar:** https://www.tailtribe.be/auth/register
3. **Selecteer:** "Ik ben een verzorger"
4. **Vul in:**
   - Email: `test-caregiver@example.com` (of je eigen test email)
   - Wachtwoord: `test123456` (of kies je eigen wachtwoord)
   - Naam, stad, diensten, etc.
5. **Klik:** "Registreer"
6. **Noteer:** Email + wachtwoord voor later gebruik

### Stap 3: Vul Profielen In
- **Eigenaar:** Voeg huisdieren toe, vul profiel aan
- **Verzorger:** Vul diensten in, stel tarieven in, upload foto's

---

## 💳 Stripe Test Account Setup

### ✅ JA - Je Moet Een Stripe Test Account Aanmaken

**Stripe heeft 2 modes:**
- **Test Mode:** Voor testen (gratis, geen echte betalingen)
- **Live Mode:** Voor echte betalingen (kosten per transactie)

### Stap 1: Maak Stripe Account Aan
1. **Ga naar:** https://stripe.com
2. **Klik:** "Sign up" (rechtsboven)
3. **Vul in:** Email, wachtwoord, bedrijfsnaam
4. **Verifieer:** Email verificatie

### Stap 2: Haal Test Keys Op
1. **Log in** op Stripe Dashboard
2. **Zorg dat je in Test Mode bent** (toggle rechtsboven: "Test mode" moet aan staan)
3. **Ga naar:** Developers → API keys
4. **Kopieer:**
   - **Publishable key:** `pk_test_...` (begint met `pk_test_`)
   - **Secret key:** `sk_test_...` (begint met `sk_test_`) - klik "Reveal test key"

### Stap 3: Configureer Webhook (Belangrijk!)
1. **Ga naar:** Developers → Webhooks
2. **Klik:** "Add endpoint"
3. **Endpoint URL:** `https://www.tailtribe.be/api/stripe/webhook`
4. **Selecteer events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
5. **Klik:** "Add endpoint"
6. **Kopieer:** Signing secret (`whsec_...`)

### Stap 4: Voeg Keys Toe Aan Vercel
1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer:** TailTribe project
3. **Ga naar:** Settings → Environment Variables
4. **Voeg toe:**
   - `STRIPE_SECRET_KEY` = `sk_test_...` (je secret key)
   - `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (je publishable key)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (je webhook secret)
5. **Selecteer:** Production environment
6. **Klik:** "Save"
7. **Redeploy:** Ga naar Deployments → Latest → "Redeploy"

---

## 🧪 Stripe Test Cards

### Succesvolle Betaling
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Elke toekomstige datum (bijv. `12/25`)
- **CVC:** Elke 3 cijfers (bijv. `123`)
- **ZIP:** Elke postcode (bijv. `1000`)

### Gefaalde Betaling (Voor Testing)
- **Card:** `4000 0000 0000 0002` (declined card)
- **Expiry:** Elke toekomstige datum
- **CVC:** Elke 3 cijfers
- **ZIP:** Elke postcode

### Meer Test Cards:
Zie: https://stripe.com/docs/testing#cards

---

## 📝 Test Account Checklist

### Eigenaar Account
- [ ] Account aangemaakt
- [ ] Email: `_________________`
- [ ] Wachtwoord: `_________________`
- [ ] Profiel ingevuld
- [ ] Huisdieren toegevoegd

### Verzorger Account
- [ ] Account aangemaakt
- [ ] Email: `_________________`
- [ ] Wachtwoord: `_________________`
- [ ] Profiel ingevuld
- [ ] Diensten ingesteld
- [ ] Tarieven ingesteld
- [ ] Foto's geüpload

### Stripe Setup
- [ ] Stripe account aangemaakt
- [ ] Test mode actief
- [ ] API keys gekopieerd
- [ ] Webhook geconfigureerd
- [ ] Keys toegevoegd aan Vercel
- [ ] Redeploy gedaan

---

## 🔐 Wachtwoord Tips

### Veilige Test Wachtwoorden:
- `Test123456!` (met hoofdletter en leesteken)
- `test123456` (eenvoudig, makkelijk te onthouden)
- `TailTribe2024!` (project gerelateerd)

### ⚠️ BELANGRIJK:
- Gebruik **GEEN** echte wachtwoorden van productie accounts
- Gebruik **GEEN** wachtwoorden die je elders gebruikt
- Test accounts kunnen worden verwijderd

---

## 🚀 Quick Start

### 1. Maak Test Accounts (5 min)
```
Eigenaar:
- Email: test-owner@example.com
- Password: test123456

Verzorger:
- Email: test-caregiver@example.com
- Password: test123456
```

### 2. Setup Stripe (10 min)
```
1. Maak Stripe account
2. Haal test keys op
3. Configureer webhook
4. Voeg keys toe aan Vercel
5. Redeploy
```

### 3. Test Payment Flow (5 min)
```
1. Log in als Eigenaar
2. Maak boeking
3. Betaal met: 4242 4242 4242 4242
4. Check Stripe dashboard
```

---

## ❓ FAQ

### Q: Kan ik bestaande accounts gebruiken?
**A:** Ja, maar maak liever nieuwe test accounts om productie data niet te vervuilen.

### Q: Moet ik Stripe betalen voor test mode?
**A:** Nee, Stripe test mode is volledig gratis.

### Q: Werken test keys op live site?
**A:** Ja, maar alleen test betalingen worden verwerkt (geen echte geld).

### Q: Kan ik dezelfde Stripe account gebruiken voor BE en NL?
**A:** Ja, Stripe werkt wereldwijd. Je kunt dezelfde keys gebruiken.

### Q: Wat als webhook niet werkt?
**A:** Check:
- Webhook URL is correct
- Webhook secret is correct in Vercel
- Events zijn geselecteerd
- Site is gedeployed na webhook setup

---

## 📞 Support

### Als Stripe Setup Niet Werkt:
1. Check Stripe Dashboard → Developers → API keys
2. Check Vercel → Environment Variables
3. Check Vercel → Deployments → Logs
4. Test webhook: Stripe Dashboard → Webhooks → Test webhook

### Als Test Accounts Niet Werken:
1. Check of accounts zijn aangemaakt
2. Check email verificatie (als vereist)
3. Check of accounts zijn goedgekeurd (voor verzorgers)
4. Check browser console voor errors

---

**Laatste update:** 2025-01-13


