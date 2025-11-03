# 🔧 Database Migrations Draaien

## Simpel: Via Vercel Dashboard

### Optie 1: Via Vercel Deployment Shell (Aanbevolen)

1. Ga naar Vercel Dashboard → jouw project
2. Klik op **Deployments** tab
3. Klik op je laatste deployment
4. Klik op **"..."** → **View Function Logs** of **Shell**
5. Run deze commands:

```bash
npx prisma migrate deploy
npx prisma generate
```

### Optie 2: Lokaal (als DATABASE_URL correct is)

1. Zorg dat je DATABASE_URL in `.env.local` staat (de Neon URL)
2. Run in PowerShell:

```bash
cd C:\Dev\TailTribe-Final.bak_20251007_233850
$env:DATABASE_URL="postgresql://neondb_owner:npg_sgm2TtwEL4oH@ep-steep-sunset-abldtj20.eu-west-2.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy
npx prisma generate
```

### Check of het werkt:

Na migrations, test op live site:
- Ga naar https://tailtribe.vercel.app
- Probeer te registreren
- Als het werkt → Database is correct! ✅

---

## Als migrations falen:

Check:
- DATABASE_URL correct in Vercel?
- Database toegankelijk? (check Neon dashboard)
- Alle env vars aanwezig?

