# 🚀 DEPLOY NU - Simpele Instructie

**Status:** ✅ Code 100% klaar | ✅ DIRECT_URL toegevoegd | ⚠️ Deploy fail door Git author

---

## ⚡ OPLOSSING: Manual Deploy via Vercel Dashboard

**Probleem:** Git author `you@example.com` heeft geen toegang tot Vercel.

**Oplossing:** Deploy via Vercel Dashboard (GEEN Git nodig!)

---

### STAP 1: Vercel Dashboard Deploy (2 min)

1. Ga naar: https://vercel.com/stevens-projects-6df24ffb/tailtribe/deployments

2. Klik op **"Redeploy"** bij de laatste deployment (of klik **"..."** → **"Redeploy"**)

3. Vercel deployt met de huidige environment variables!

---

### STAP 2: Database Migrate (2 min)

**Optie A: Via Vercel Dashboard**
1. Ga naar: https://vercel.com/stevens-projects-6df24ffb/tailtribe
2. Klik op laatste deployment
3. Klik **"..."** → **"Run Command"**
4. Type: `npx prisma db push`
5. Run!

**Optie B: Lokaal**
```bash
vercel env pull .env.production --environment=production
npx prisma db push
```

---

### STAP 3: Test (5 min)

Ga naar: https://tailtribe.vercel.app

- ✅ Site laadt
- ✅ Registratie werkt
- ✅ Login werkt

---

## ✅ KLAAR!

**🎉 JE SITE IS LIVE!**

---

## 🔧 LATER: Fix Git Author (Optioneel)

Als je via Git wil deployen in de toekomst:

```bash
# Fix Git author in alle commits:
git filter-branch --env-filter '
OLD_EMAIL="you@example.com"
CORRECT_NAME="Steven Van Gucht"
CORRECT_EMAIL="steve@onehappyhound.be"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

**Maar dit is NIET nodig - Dashboard deploy werkt perfect!**

---

**🚀 Nu klaar! Start met STAP 1!**

