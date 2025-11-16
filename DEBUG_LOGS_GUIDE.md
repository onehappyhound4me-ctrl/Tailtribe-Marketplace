# 🔍 Debug Logs Bekijken - Stap voor Stap

## 📍 Waar Zie Je Debug Logs?

### Stap 1: Open Browser Console

**Chrome / Edge:**
- Druk op `F12` (of `Ctrl + Shift + I`)
- Of: Rechts klik → "Inspecteren" → Tab "Console"

**Firefox:**
- Druk op `F12` (of `Ctrl + Shift + K`)
- Of: Rechts klik → "Element inspecteren" → Tab "Console"

**Safari:**
- Druk op `Cmd + Option + I`
- Of: Rechts klik → "Element inspecteren" → Tab "Console"

---

### Stap 2: Ga Naar Search Pagina

1. Open: https://www.tailtribe.nl/search (of https://www.tailtribe.be/search)
2. De console zou automatisch moeten openen (als je F12 hebt gedrukt)
3. Scroll naar beneden naar de kaart sectie

---

### Stap 3: Zoek Naar Debug Logs

**Wat je zou moeten zien:**

```
🗺️ Initial map load for country: NL Center: [52.3676, 4.9041]
```

Of voor België:
```
🗺️ Initial map load for country: BE Center: [50.8503, 4.3517]
```

**Bij country switch zou je moeten zien:**
```
🗺️ Country changed: BE → NL Updating map to: [52.3676, 4.9041]
```

---

## 🔍 Waar Zijn De Logs?

### In Browser Console:
- **Locatie:** Onderin je browser (of als apart venster)
- **Tab:** "Console" (niet "Elements" of "Network")
- **Filter:** Je kunt filteren op "🗺️" of "map" om alleen kaart logs te zien

### Screenshot Locatie:
```
┌─────────────────────────────────────┐
│ Browser Window                      │
│                                     │
│  [Website Content]                  │
│                                     │
├─────────────────────────────────────┤
│ Console (F12)                       │
│ ┌─────────────────────────────────┐ │
│ │ 🗺️ Initial map load for...      │ │ ← HIER!
│ │ 🗺️ Country changed: BE → NL     │ │ ← HIER!
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🐛 Als Je Geen Logs Ziet

### Mogelijke Oorzaken:

1. **Console is gefilterd:**
   - Check of "All levels" is geselecteerd (niet alleen "Errors")
   - Check of er geen filters actief zijn

2. **Logs zijn uitgezet:**
   - Check console settings (⚙️ icoon)
   - Zorg dat "Logs" aan staat

3. **Deployment is nog niet live:**
   - Wacht 2-5 minuten na git push
   - Check Vercel dashboard voor deployment status

4. **Browser cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) of `Cmd + Shift + R` (Mac)
   - Of: Open incognito venster

5. **Code is niet gedeployed:**
   - Check Vercel dashboard → Deployments → Latest
   - Check of deployment succesvol is (groene checkmark)

---

## 📸 Visual Guide

### Chrome Console Openen:
```
1. Druk F12
   ↓
2. Console tab selecteren
   ↓
3. Scroll naar beneden
   ↓
4. Zoek naar 🗺️ emoji
```

### Wat Je Ziet:
```
Console
├─ 🗺️ Initial map load for country: NL Center: [52.3676, 4.9041]
├─ 🗺️ Country changed: BE → NL Updating map to: [52.3676, 4.9041]
└─ (andere logs...)
```

---

## ✅ Quick Test

1. **Open console** (F12)
2. **Ga naar:** https://www.tailtribe.nl/search
3. **Scroll naar kaart**
4. **Check console voor:** `🗺️ Initial map load for country: NL`
5. **Switch country** (BE ↔ NL)
6. **Check console voor:** `🗺️ Country changed: ...`

---

## 🎯 Als Logs Niet Verschijnen

### Check Dit:

1. **Is de kaart zichtbaar?**
   - Als kaart niet laadt → logs verschijnen niet
   - Check of kaart component wordt gerenderd

2. **Is JavaScript enabled?**
   - Check browser settings
   - Zorg dat JavaScript aan staat

3. **Zijn er errors in console?**
   - Check voor rode errors
   - Errors kunnen logs blokkeren

4. **Is de juiste versie gedeployed?**
   - Check Vercel dashboard
   - Check deployment tijd (moet recent zijn)

---

## 📞 Debug Commands

### In Console Typen (voor testing):

```javascript
// Check of kaart component is geladen
console.log('Map check:', document.querySelector('.leaflet-container'))

// Check country
console.log('Current country:', window.location.pathname.includes('/nl') ? 'NL' : 'BE')

// Force map update (als kaart al geladen is)
// (Dit werkt alleen als je toegang hebt tot de map instance)
```

---

## 🔧 Troubleshooting

### Probleem: Console is leeg
**Oplossing:**
- Check console filter (moet "All levels" zijn)
- Refresh pagina (hard refresh: Ctrl+Shift+R)
- Check of JavaScript errors zijn

### Probleem: Logs zijn oud
**Oplossing:**
- Clear console (trash icon)
- Refresh pagina
- Check of nieuwe deployment is gedaan

### Probleem: Kaart werkt maar geen logs
**Oplossing:**
- Logs zijn optioneel (kaart kan werken zonder logs)
- Check of kaart correct center heeft (visueel)
- Test country switch (kaart zou moeten bewegen)

---

## ✅ Success Criteria

**Je weet dat het werkt als:**
- ✅ Console toont: `🗺️ Initial map load for country: NL/BE`
- ✅ Kaart center is correct (Brussel voor BE, Amsterdam voor NL)
- ✅ Bij country switch: kaart beweegt naar juiste locatie
- ✅ Console toont: `🗺️ Country changed: ...`

---

**Laatste update:** 2025-01-13

