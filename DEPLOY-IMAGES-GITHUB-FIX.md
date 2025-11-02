# 🚀 Fix: Images naar Vercel via GitHub

## Situatie
✅ Images staan lokaal  
✅ Images staan in Git  
❌ Vercel krijgt ze niet (broken GitHub link)

## Oplossing: Herstel GitHub Link

### Stap 1: Check of GitHub repo bestaat

Open in browser:
```
https://github.com/onehappyhound4me-ctrl/Tailtribe-marketplace
```

**Als repo bestaat:**
- Ga verder met Stap 2

**Als repo NIET bestaat:**
- Maak nieuwe repo op GitHub
- Of gebruik bestaande repo

### Stap 2: Update Git Remote

```bash
# Check huidige remote
git remote -v

# Als verkeerde URL, pas aan:
git remote set-url origin https://github.com/JOUW-ACCOUNT/Tailtribe-marketplace.git

# Of nieuwe remote toevoegen
git remote remove origin
git remote add origin https://github.com/JOUW-ACCOUNT/Tailtribe-marketplace.git
```

### Stap 3: Push naar GitHub

```bash
git push origin main
```

**Als dit faalt:** Check GitHub credentials of maak nieuw token.

### Stap 4: Vercel Dashboard - Connect GitHub

1. Ga naar: https://vercel.com/dashboard
2. Klik: Settings → Git
3. Klik: Connect Git Repository
4. Selecteer: GitHub
5. Kies je repo: `Tailtribe-marketplace`
6. Klik: Connect

### Stap 5: Manual Redeploy

1. Ga naar: Deployments
2. Klik op laatste deployment
3. Klik: "..." → Redeploy
4. **ZET BUILD CACHE UIT**
5. Klik: Redeploy

### Stap 6: Verify

Open:
```
https://tailtribe.vercel.app/diensten
```

Hard refresh: Ctrl+F5

---

## Alternatief: NIEUWE GitHub Repo

Als oude repo weg is, maak nieuwe:

1. Ga naar: https://github.com/new
2. Repo naam: `Tailtribe-marketplace`
3. **NIET** initialiseer met README
4. Klik: Create repository

Dan:

```bash
# In je project folder
git remote set-url origin https://github.com/JOUW-ACCOUNT/Tailtribe-marketplace.git
git push -u origin main
```

Dan Vercel dashboard → Connect Git

---

## Quick Fix: Disconnect Git (Tijdelijke Oplossing)

Als GitHub niet werkt, upload via CLI:

1. Vercel Dashboard → Settings → Git → Disconnect
2. Dan:
   ```bash
   npx vercel --prod
   ```

Maar dit is minder ideaal - GitHub is better voor toekomstige deployments.

