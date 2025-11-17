# 🌐 Vercel Domains Setup voor TailTribe

## 📋 Huidige Situatie:

Je hebt waarschijnlijk:
- ✅ Eén Vercel project voor `tailtribe.be`
- ❌ `tailtribe.nl` is niet geconfigureerd OF is een alias van hetzelfde project

## 🔧 Oplossing: Voeg tailtribe.nl toe als Domain Alias

### Optie 1: tailtribe.nl als Alias (Aanbevolen)

Als beide sites dezelfde code gebruiken, voeg `tailtribe.nl` toe als **domain alias** aan hetzelfde project:

### Stap 1: Ga naar Vercel Project Settings
1. Log in op https://vercel.com
2. Selecteer je TailTribe project
3. Ga naar **Settings** → **Domains**

### Stap 2: Voeg tailtribe.nl toe
1. Klik op **"Add Domain"**
2. Voer in: `tailtribe.nl`
3. Klik op **"Add"**
4. Vercel geeft je DNS records die je moet toevoegen

### Stap 3: Configureer DNS bij je Domain Provider
Voor `tailtribe.nl` moet je DNS records toevoegen:

**Voor root domain (tailtribe.nl):**
- Type: `A`
- Name: `@` of leeg
- Value: `76.76.21.21` (Vercel IP)

**Voor www subdomain (www.tailtribe.nl):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Stap 4: Wacht op DNS Propagation
- DNS wijzigingen kunnen 5 minuten tot 24 uur duren
- Check status in Vercel → Domains

### Stap 5: Environment Variables
**BELANGRIJK:** Voor één project met meerdere domains:
- Alle environment variables zijn **gelijk** voor beide domains
- `NEXTAUTH_SECRET` moet hetzelfde zijn
- `NEXTAUTH_URL` kan leeg blijven (NextAuth detecteert automatisch)
- OF: Gebruik de primary domain in `NEXTAUTH_URL`

---

## 🔍 Check Huidige Configuratie:

### Stap 1: Check Domains in Vercel
1. Ga naar Vercel → je project → **Settings** → **Domains**
2. Check welke domains er staan:
   - [ ] `tailtribe.be` (of `www.tailtribe.be`)
   - [ ] `tailtribe.nl` (of `www.tailtribe.nl`)

### Stap 2: Check Environment Variables
1. Ga naar **Settings** → **Environment Variables**
2. Check of deze bestaan:
   - [ ] `NEXTAUTH_SECRET`
   - [ ] `DATABASE_URL`
   - [ ] `NEXTAUTH_URL` (optioneel)

---

## ⚠️ Als tailtribe.nl een Apart Project Is:

Als `tailtribe.nl` een **apart Vercel project** is:

### Stap 1: Check Project
1. Ga naar Vercel Dashboard
2. Check of er een apart project is voor `tailtribe.nl`
3. Als ja: Ga naar dat project → Settings → Environment Variables

### Stap 2: Voeg Environment Variables toe
Voor het `.nl` project, voeg toe:
- `NEXTAUTH_SECRET` = **ZELFDE** als in `.be` project
- `DATABASE_URL` = **ZELFDE** als in `.be` project
- `NEXTAUTH_URL` = `https://www.tailtribe.nl` (of leeg)

### Stap 3: Link Repository
Als het `.nl` project niet is gelinkt aan GitHub:
1. Ga naar project → Settings → Git
2. Link aan dezelfde repository als `.be` project
3. Zorg dat beide projects dezelfde branch gebruiken (`main`)

---

## 🎯 Aanbevolen Setup:

### Optie A: Eén Project, Twee Domains (Aanbevolen)
```
Vercel Project: TailTribe
├── Domain: tailtribe.be
├── Domain: tailtribe.nl (alias)
└── Environment Variables (gelijk voor beide)
```

**Voordelen:**
- Eén codebase
- Eén deployment
- Makkelijker te onderhouden

### Optie B: Twee Projects, Eén Repository
```
Vercel Project 1: TailTribe-BE
├── Domain: tailtribe.be
└── Environment Variables

Vercel Project 2: TailTribe-NL
├── Domain: tailtribe.nl
└── Environment Variables (gelijk)
```

**Voordelen:**
- Aparte deployments mogelijk
- Aparte configuratie mogelijk

---

## 🔐 Environment Variables Checklist:

### Voor beide domains (of één project):

**Verplicht:**
- [ ] `NEXTAUTH_SECRET` - **MOET HETZELFDE ZIJN** voor beide domains
- [ ] `DATABASE_URL` - **MOET HETZELFDE ZIJN** voor beide domains

**Optioneel maar aanbevolen:**
- [ ] `NEXTAUTH_URL` - Kan leeg blijven (NextAuth detecteert automatisch)
  - OF: `https://www.tailtribe.be` voor .be project
  - OF: `https://www.tailtribe.nl` voor .nl project

**Andere variables:**
- [ ] `GOOGLE_CLIENT_ID` (als gebruikt)
- [ ] `GOOGLE_CLIENT_SECRET` (als gebruikt)
- [ ] `STRIPE_SECRET_KEY` (als gebruikt)
- [ ] `STRIPE_PUBLISHABLE_KEY` (als gebruikt)

---

## 🐛 Troubleshooting:

### Probleem: tailtribe.nl werkt niet
**Oplossing:**
1. Check of domain is toegevoegd in Vercel → Domains
2. Check DNS records bij domain provider
3. Wacht op DNS propagation (kan tot 24 uur duren)
4. Check Vercel → Deployments → Logs

### Probleem: Login werkt niet op .nl maar wel op .be
**Oplossing:**
1. Check of `NEXTAUTH_SECRET` hetzelfde is voor beide
2. Check of `DATABASE_URL` hetzelfde is voor beide
3. Check Vercel logs voor errors
4. Redeploy na het toevoegen van variables

### Probleem: Twee aparte projects gebruiken verschillende code
**Oplossing:**
1. Zorg dat beide projects linken naar dezelfde GitHub repository
2. Zorg dat beide projects dezelfde branch gebruiken (`main`)
3. Zorg dat beide projects dezelfde environment variables hebben

---

## 📞 Volgende Stappen:

1. **Check huidige setup:**
   - Ga naar Vercel → je project → Settings → Domains
   - Noteer welke domains er staan

2. **Voeg tailtribe.nl toe (als ontbreekt):**
   - Voeg domain toe als alias
   - Configureer DNS records
   - Wacht op propagation

3. **Check Environment Variables:**
   - Zorg dat `NEXTAUTH_SECRET` bestaat
   - Zorg dat `NEXTAUTH_SECRET` hetzelfde is voor beide domains
   - Redeploy na wijzigingen

4. **Test:**
   - Test login op `tailtribe.be`
   - Test login op `tailtribe.nl`
   - Check browser console voor errors

---

**Laatste update:** 2025-01-13

