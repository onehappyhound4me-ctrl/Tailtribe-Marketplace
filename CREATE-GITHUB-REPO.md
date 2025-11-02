# 🚀 GitHub Repository Aanmaken - Stap voor Stap

## Optie 1: Nieuwe Repository via GitHub Website

### Stap 1: Ga naar GitHub
Open in je browser:
```
https://github.com/new
```

Of log in op GitHub en klik rechtsboven op "New repository"

### Stap 2: Vul Repository Details In

**Repository name:** `Tailtribe-marketplace`  
**Description:** `SaaS marketplace voor dierenverzorgers`

**Public of Private?**
- Kies **Public** (gratis)
- Of **Private** (als je code niet publiek wil)

**BELANGRIJK:** 
- ☐ **LEEG** laten: "Add a README file"
- ☐ **NIET** vink "Add .gitignore"
- ☐ **NIET** vink "Choose a license"

Klik: **Create repository**

---

## Optie 2: Via GitHub CLI (Sneller)

Als je GitHub CLI geïnstalleerd hebt:

```bash
gh repo create Tailtribe-marketplace --public --source=. --remote=origin --push
```

---

## Na Repository Aanmaken

### Stap 3: Push Je Code

Terug in je terminal:

```bash
git push origin main
```

Of als eerste push:
```bash
git push -u origin main
```

### Stap 4: Connect Vercel aan GitHub

1. Ga naar: https://vercel.com/dashboard
2. Klik je project: **tailtribe**
3. Ga naar: **Settings** → **Git**
4. Klik: **Connect Git Repository**
5. Selecteer: **GitHub**
6. Kies je nieuwe repo: `Tailtribe-marketplace`
7. Klik: **Connect**

### Stap 5: Deploy!

Vercel triggert automatisch een nieuwe deployment.

Of manual:
1. Ga naar: **Deployments**
2. Klik op laatste deployment
3. Klik: **"..."** → **Redeploy**
4. **ZET BUILD CACHE UIT**
5. Klik: **Redeploy**

### Stap 6: Check Images!

Open:
```
https://tailtribe.vercel.app/diensten
```

Hard refresh: **Ctrl+F5**

---

## Troubleshooting

### Fout: "Repository already exists"
- Kies andere naam: `Tailtribe-marketplace-v2`
- Of maak repo onder andere account

### Fout: "Permission denied"
- Check GitHub inlog
- Maak nieuw Personal Access Token

### Fout: "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/JOUW-ACCOUNT/Tailtribe-marketplace.git
git push -u origin main
```

---

## Alternatief: Gebruik Bestaande Repo

Als je al een GitHub repo hebt:

1. Kopieer de URL van je bestaande repo
2. In terminal:
```bash
git remote remove origin
git remote add origin https://github.com/JOUW-ACCOUNT/JOUW-REPO.git
git push -u origin main
```

---

## Klaar! ✅

Na deze stappen zou Vercel automatisch je images moeten deployen.

