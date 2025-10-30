# 🐾 TailTribe - Pet Care Marketplace

Een moderne, volledig functionele marketplace voor dierenverzorging in België, gebouwd met Next.js 14 en TypeScript.

## ✨ Functies

### 🔐 Authenticatie
- Nederlandse login/registratie pagina's
- Ondersteuning voor eigenaren en oppassen
- Veilige gebruikersauthenticatie

### 🔍 Zoeken & Ontdekken
- Geavanceerd zoeksysteem met filters
- Zoeken op stad, service type, tarief
- Professionele oppas profielen met reviews

### 📅 Boekingssysteem
- Volledige boekingsflow met 3 stappen
- Kalender integratie
- Automatische kostencalculatie
- Bevestigingssysteem

### 💬 Berichten
- Real-time messaging tussen gebruikers
- Berichtgeschiedenis
- Online status indicatoren
- Bestandsdeling ondersteuning

### ⭐ Reviews & Ratings
- 5-sterren beoordelingssysteem
- Uitgebreide review formulieren
- Review moderatie
- Publieke review weergave

### 📊 Dashboards
- Eigenaar dashboard met boekingsoverzicht
- Oppas dashboard met inkomsten tracking
- Statistieken en analyses
- Berichtenbeheer

### 🛡️ Admin Panel
- Volledig admin dashboard
- Gebruikersbeheer
- Boekingen monitoring
- Platform instellingen

## 🚀 Technische Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Custom CSS met moderne design
- **TypeScript**: Volledig type-safe
- **Database Ready**: Prisma schema gedefinieerd
- **Payment Ready**: Stripe integratie voorbereid

## 🎯 Nederlandse Localisatie

Alle teksten en interfaces zijn volledig vertaald naar het Nederlands:
- UI elementen
- Formulieren en labels
- Error berichten
- Navigatie
- Content

## 📱 Responsive Design

- Volledig responsive op alle apparaten
- Mobile-first ontwerp
- Touch-friendly interfaces
- Optimized performance

## 🔧 Installatie & Setup

1. **Clone het project**
   ```bash
   cd TailTribe-Final
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 OneDrive Compatibility (Windows)

Als je dit project in een OneDrive folder draait op Windows, zijn er speciale instellingen vereist:

### Vereiste OneDrive Instellingen:
1. **Files On-Demand** moet UIT staan voor deze folder
2. Rechtermuisklik op de projectfolder → "Always keep on this device"
3. Optioneel: Pauzeer OneDrive sync tijdens development

### Wat is al geconfigureerd:
- ✅ `CHOKIDAR_USEPOLLING=1` - File watching met polling
- ✅ `WATCHPACK_POLLING=true` - Webpack polling enabled
- ✅ Webpack watchOptions met 1000ms poll interval
- ✅ 300ms aggregate timeout voor betere prestaties
- ✅ Custom `.next-local` build directory

Deze configuratie voorkomt:
- ❌ "UNKNOWN: unknown error, read" errors
- ❌ "os error 32" (file in use) 
- ❌ "os error 383" (cloud provider failed)
- ❌ Infinite compilation loops

### Troubleshooting:
Als je nog steeds problemen hebt:
```bash
# Verwijder cache en rebuild
Remove-Item -Path ".next-local", "node_modules" -Recurse -Force
npm install
npm run dev
```

## 📄 Beschikbare Pagina's

### Publieke Pagina's
- `/` - Homepage met service overzicht
- `/search` - Zoek oppassen
- `/caregiver/[id]` - Oppas profiel
- `/auth/signin` - Inloggen
- `/auth/register` - Registreren

### Gebruikerspagina's
- `/dashboard` - Persoonlijk dashboard
- `/booking/[id]` - Boekingsflow
- `/messages/[id]` - Berichten
- `/reviews/[id]` - Review schrijven

### Admin Pagina's
- `/admin` - Admin dashboard

## 🎨 Design Features

- **Moderne UI**: Schone, professionele interface
- **Gradient Backgrounds**: Mooie kleurovergangen
- **Card-based Layout**: Duidelijke informatie structuur
- **Interactive Elements**: Hover effecten en animaties
- **Consistent Branding**: TailTribe huisstijl door hele site

## 🔒 Veiligheid & Privacy

- Input validatie op alle formulieren
- Veilige gebruikersauthenticatie
- Privacy-bewuste review systeem
- Admin toegangscontrole

## 🌟 Klaar voor Productie

Dit is een volledig functionele marketplace die klaar is voor:
- Database integratie (Prisma schema included)
- Payment processing (Stripe ready)
- Email services (Resend ready)
- File uploads (UploadThing ready)
- Analytics (PostHog ready)

## 📞 Support

Voor vragen of ondersteuning, neem contact op via het TailTribe platform.

---

**© 2024 TailTribe. Alle rechten voorbehouden.**

