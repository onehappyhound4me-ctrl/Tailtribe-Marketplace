# ☁️ Cloudinary Setup voor Foto Uploads

## ⚡ SNELSTART (5 minuten)

### 1. Maak Cloudinary Account (Gratis)
1. Ga naar: https://cloudinary.com/users/register/free
2. Maak gratis account (gratis tier: 25GB storage, 25K transformations/maand)
3. Na registratie → Dashboard → Kopieer je credentials

### 2. Voeg Environment Variables toe in Vercel

Ga naar: **Vercel Dashboard → Jouw Project → Settings → Environment Variables**

Voeg deze 3 variabelen toe:

```
CLOUDINARY_CLOUD_NAME=je-cloud-name
CLOUDINARY_API_KEY=je-api-key
CLOUDINARY_API_SECRET=je-api-secret
```

**Waar vind je deze?**
- Cloudinary Dashboard → Settings → "Product environment credentials"
- Of: Dashboard → Account Details

**BELANGRIJK:**
- Selecteer alle environments: **Production**, **Preview**, **Development**
- Klik **Save**

### 3. Redeploy

Na toevoegen van env vars:
- Vercel zal automatisch redeployen
- Of: Ga naar Deployments → Redeploy

### 4. Test!

Na deployment (1-2 min):
- Ga naar profiel/onboarding
- Upload een foto
- **Moet nu werken!** ✅

---

## ✅ Wat is er gefixed?

- **Voor:** Uploads bleven steken op 90% (Vercel read-only filesystem)
- **Nu:** Uploads gaan naar Cloudinary CDN (werkt overal!)

---

## 💰 Kosten

**Gratis tier:**
- 25GB storage
- 25K transformations/maand
- Onbeperkt bandwidth
- CDN included

**Meer dan gratis tier nodig?**
- $99/maand voor 100GB + 100K transformations
- Maar voor jouw use case is gratis tier genoeg!

---

## 🛠️ Troubleshooting

**"Cloudinary is niet geconfigureerd" error:**
- Check of env vars in Vercel staan
- Check of je alle 3 hebt toegevoegd
- Redeploy na toevoegen

**Upload werkt nog niet:**
- Check Cloudinary dashboard → Media Library
- Zie je daar foto's? Dan werkt upload!
- Check browser console (F12) voor errors

---

**Klaar! Uploads werken nu op Vercel! 🚀**

