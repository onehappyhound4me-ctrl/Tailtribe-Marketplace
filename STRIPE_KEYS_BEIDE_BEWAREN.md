# 💳 Stripe Keys Beide Bewaren - Praktische Oplossing

## ⚠️ Probleem
- Live secret key kun je maar **1 keer zien** in Stripe
- Je wilt **beide** kunnen gebruiken (test EN live)
- Je wilt niet steeds switchen

## ✅ Oplossing: Bewaar Beide Keys Veilig

### Stap 1: Bewaar Live Keys Nu (BELANGRIJK!)

**⚠️ VOOR JE IETS WIJZIGT:**

1. **Ga naar Stripe Dashboard** (Live Mode)
2. **Ga naar:** Developers → API keys
3. **Kopieer EN BEWAAR:**
   - `sk_live_...` (Secret key - je ziet hem maar 1 keer!)
   - `pk_live_...` (Publishable key - altijd zichtbaar)
   - `whsec_...` (Webhook secret - altijd zichtbaar)

4. **Bewaar ze veilig:**
   - In een password manager (1Password, LastPass, etc.)
   - In een versleuteld bestand
   - In een veilige notitie app
   - **NIET** in code of GitHub!

### Stap 2: Haal Test Keys Op

1. **Ga naar Stripe Dashboard** (Test Mode - toggle rechtsboven)
2. **Ga naar:** Developers → API keys
3. **Kopieer:**
   - `sk_test_...` (Secret key)
   - `pk_test_...` (Publishable key)
   - `whsec_...` (Test webhook secret)

---

## 🔑 Optie 1: Verschillende Environment Variables (Aanbevolen)

### In Vercel Environment Variables:

**Production Environment:**
```
STRIPE_SECRET_KEY=sk_live_... (live key)
STRIPE_PUBLISHABLE_KEY=pk_live_... (live key)
STRIPE_WEBHOOK_SECRET=whsec_... (live webhook)
```

**Preview/Development Environment:**
```
STRIPE_SECRET_KEY=sk_test_... (test key)
STRIPE_PUBLISHABLE_KEY=pk_test_... (test key)
STRIPE_WEBHOOK_SECRET=whsec_... (test webhook)
```

**Voordeel:** 
- Beide keys blijven beschikbaar
- Automatisch de juiste key per environment
- Geen switchen nodig

---

## 🔑 Optie 2: Code Aanpassen Voor Dual Mode

Als je beide keys tegelijk wilt kunnen gebruiken, kun je de code aanpassen:

### Nieuwe Environment Variables:
```
STRIPE_SECRET_KEY=sk_live_... (live key - voor productie)
STRIPE_SECRET_KEY_TEST=sk_test_... (test key - voor testing)
STRIPE_PUBLISHABLE_KEY=pk_live_... (live key)
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_... (test key)
```

**Maar dit vereist code wijzigingen** - niet aanbevolen tenzij nodig.

---

## 🔑 Optie 3: Tijdelijk Test Keys (Eenvoudigste)

### Voor Nu (Testing):
**Production Environment:**
```
STRIPE_SECRET_KEY=sk_test_... (test key)
STRIPE_PUBLISHABLE_KEY=pk_test_... (test key)
STRIPE_WEBHOOK_SECRET=whsec_... (test webhook)
```

**Bewaar live keys veilig** voor later gebruik.

### Voor Later (Launch):
**Production Environment:**
```
STRIPE_SECRET_KEY=sk_live_... (live key - die je hebt bewaard)
STRIPE_PUBLISHABLE_KEY=pk_live_... (live key)
STRIPE_WEBHOOK_SECRET=whsec_... (live webhook)
```

---

## 📝 Wat Je Nu Moet Doen

### 1. Bewaar Live Keys (NU - VOOR JE IETS WIJZIGT!)

**Stripe Dashboard → Live Mode → Developers → API keys:**
- [ ] Kopieer `sk_live_...` → Bewaar veilig
- [ ] Kopieer `pk_live_...` → Bewaar veilig
- [ ] Kopieer `whsec_...` (live webhook) → Bewaar veilig

**Waar bewaren?**
- Password manager (1Password, LastPass, Bitwarden)
- Versleuteld bestand op je computer
- Veilige notitie app
- **NIET** in code, GitHub, of plain text!

### 2. Haal Test Keys Op

**Stripe Dashboard → Test Mode → Developers → API keys:**
- [ ] Kopieer `sk_test_...`
- [ ] Kopieer `pk_test_...`
- [ ] Configureer test webhook → Kopieer `whsec_...`

### 3. Zet Test Keys In Vercel (Voor Testing)

**Vercel → Settings → Environment Variables → Production:**
- [ ] `STRIPE_SECRET_KEY` → `sk_test_...`
- [ ] `STRIPE_PUBLISHABLE_KEY` → `pk_test_...`
- [ ] `STRIPE_WEBHOOK_SECRET` → `whsec_...` (test webhook)
- [ ] Save
- [ ] Redeploy

### 4. Test Met Test Card

- [ ] Ga naar site
- [ ] Maak boeking
- [ ] Betaal met: `4242 4242 4242 4242`
- [ ] Check Stripe Dashboard (test mode)

### 5. Later - Switch Naar Live Keys

**Wanneer je klaar bent voor launch:**
- [ ] Haal bewaarde live keys op
- [ ] Wijzig in Vercel → Environment Variables
- [ ] Redeploy
- [ ] Test met echte credit card (klein bedrag)

---

## 🔐 Veilige Opslag Opties

### Password Manager (Aanbevolen):
- **1Password:** https://1password.com
- **LastPass:** https://www.lastpass.com
- **Bitwarden:** https://bitwarden.com (gratis)

**Voeg toe als "Secure Note":**
```
Stripe Live Keys:
- Secret: sk_live_...
- Publishable: pk_live_...
- Webhook: whsec_...
```

### Versleuteld Bestand:
```bash
# Maak versleuteld bestand
openssl enc -aes-256-cbc -salt -in stripe-keys.txt -out stripe-keys.enc

# Decrypt later
openssl enc -aes-256-cbc -d -in stripe-keys.enc -out stripe-keys.txt
```

### Veilige Notitie App:
- **Standard Notes:** https://standardnotes.com (encrypted)
- **Joplin:** https://joplinapp.org (encrypted)

---

## ⚠️ BELANGRIJK: Live Secret Key Verloren?

### Als je de live secret key al hebt gewijzigd:

**Optie A: Maak Nieuwe Live Key**
1. **Stripe Dashboard → Live Mode → Developers → API keys**
2. **Klik:** "Create secret key"
3. **Kopieer EN BEWAAR** de nieuwe key
4. **Oude key wordt automatisch gedeactiveerd**

**Optie B: Gebruik Test Keys Voor Nu**
- Gebruik test keys voor testing
- Maak nieuwe live key wanneer je klaar bent voor launch
- Bewaar nieuwe live key veilig

---

## 📋 Checklist

### Nu (Testing):
- [ ] Live keys veilig bewaard (password manager/versleuteld)
- [ ] Test keys opgehaald van Stripe
- [ ] Test webhook geconfigureerd
- [ ] Test keys in Vercel gezet (Production environment)
- [ ] Redeploy gedaan
- [ ] Getest met test card (`4242 4242 4242 4242`)

### Later (Launch):
- [ ] Bewaarde live keys opgehaald
- [ ] Live webhook geconfigureerd
- [ ] Live keys in Vercel gezet (Production environment)
- [ ] Redeploy gedaan
- [ ] Getest met echte credit card (klein bedrag)

---

## 💡 Tips

1. **Bewaar live keys ALTIJD** voordat je iets wijzigt
2. **Gebruik password manager** voor veilige opslag
3. **Test eerst met test keys** voordat je live gaat
4. **Check Stripe dashboard** om te zien welke mode je gebruikt
5. **Webhook moet matchen** - test webhook voor test keys, live webhook voor live keys

---

## 🚨 Als Live Key Verloren Is

### Maak Nieuwe Live Key:
1. **Stripe Dashboard → Live Mode**
2. **Developers → API keys**
3. **Klik:** "Create secret key"
4. **Kopieer EN BEWAAR** (je ziet hem maar 1 keer!)
5. **Update Vercel** met nieuwe key
6. **Redeploy**

**Oude key wordt automatisch gedeactiveerd** - geen probleem!

---

**Laatste update:** 2025-01-13


