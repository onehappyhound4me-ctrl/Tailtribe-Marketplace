# PLAN: Diensten Landingspagina's SEO

## Overzicht
Uitbreiding van TailTribe met SEO-geoptimaliseerde landingspagina's per dienst, inclusief homepage service-grid en volledige content strategie.

## Diensten Mapping
| Slug | Titel | Korte Beschrijving | Gerelateerde Diensten |
|------|-------|-------------------|----------------------|
| hondenuitlaat | Hondenuitlaat | Dagelijkse wandelingen voor jouw viervoeter in de buurt | groepsuitlaat, hondentraining |
| groepsuitlaat | Groepsuitlaat voor honden | Sociale wandelingen met andere honden voor extra plezier | hondenuitlaat, hondentraining |
| hondentraining | Hondentraining | Professionele gedragstraining en gehoorzaamheid | hondenuitlaat, groepsuitlaat |
| dierenoppas | Dierenoppas | Optimale zorg in de vertrouwde thuisomgeving | dierenopvang, verzorging-aan-huis |
| dierenopvang | Dierenopvang | Professionele opvang in een veilige, huiselijke omgeving | dierenoppas, verzorging-aan-huis |
| verzorging-aan-huis | Verzorging aan huis | Zorg voor kortere periodes bij je thuis als je weg bent | dierenoppas, dierenopvang |
| begeleiding-events | Begeleiding events | Speciale zorg tijdens bruiloften en belangrijke momenten | dierenoppas, transport-huisdieren |
| transport-huisdieren | Transport huisdieren | Veilig en comfortabel transport naar elke bestemming | begeleiding-events, dierenoppas |
| verzorging-kleinvee | Verzorging kleinvee | Verzorging van boerderijdieren | dierenoppas, dierenopvang |

## Bestanden te Maken/Wijzigen

### Nieuwe Bestanden
1. `app/(marketing)/components/ServicesGrid.tsx` - Service grid component
2. `app/(marketing)/components/ServiceFAQ.tsx` - FAQ accordion component  
3. `app/diensten/page.tsx` - Diensten overzichtspagina
4. `app/diensten/[slug]/page.tsx` - Dynamische dienst pagina
5. `lib/services.ts` - Service data en metadata
6. `lib/seo/jsonld.ts` - JSON-LD helpers
7. `app/sitemap.ts` - Sitemap generatie

### Te Wijzigen Bestanden
1. `src/app/page.tsx` - Homepage service grid toevoegen
2. `src/app/layout.tsx` - Footer diensten links toevoegen

## Content Strategie per Dienst

### Hondenuitlaat
- **H1**: "Professionele hondenuitlaatservice in België"
- **Intro**: Dagelijkse wandelingen voor jouw viervoeter door ervaren verzorgers
- **Waarom kiezen**: Gezondheid, socialisatie, routine, gemoedsrust
- **Wat houdt het in**: Wandeltijden, routes, veiligheid, communicatie
- **FAQ**: Frequentie, duur, kosten, veiligheid, annulering

### Groepsuitlaat  
- **H1**: "Groepsuitlaat voor honden - sociale wandelingen"
- **Intro**: Sociale wandelingen met andere honden voor extra plezier
- **Waarom kiezen**: Socialisatie, energie, vriendschappen, kostenbesparing
- **Wat houdt het in**: Groepsgrootte, compatibiliteit, veiligheid, locaties
- **FAQ**: Groepsgrootte, leeftijden, gedrag, kosten, veiligheid

### Hondentraining
- **H1**: "Professionele hondentraining in België"
- **Intro**: Gedragstraining en gehoorzaamheid door ervaren trainers
- **Waarom kiezen**: Gedragsproblemen, gehoorzaamheid, veiligheid, band
- **Wat houdt het in**: Methoden, sessies, thuiswerk, voortgang
- **FAQ**: Methoden, duur, kosten, thuiswerk, certificering

## SEO Techniek

### Metadata per Dienst
- **Title**: "[Dienst] in België | TailTribe" (max 60 chars)
- **Description**: "Professionele [dienst] door geverifieerde verzorgers. [Voordelen]. Ontdek verzorgers in jouw buurt." (max 155 chars)
- **Canonical**: `/diensten/[slug]`
- **Open Graph**: title, description, type: article, image placeholder

### JSON-LD Schema
- **Service**: naam, description, areaServed: "België", provider: TailTribe
- **FAQPage**: vragen/antwoorden uit accordion
- **BreadcrumbList**: Home › Diensten › [Dienst]

### Interne Linking
- Gerelateerde diensten (2-3 per pagina)
- Link terug naar /diensten
- CTA naar `/map-search?service=<slug>`

## UI/UX Specificaties

### ServicesGrid
- Tailwind cards met `rounded-2xl`
- Hover scale (subtiel)
- Icons bovenaan (placeholder SVGs)
- Mobile-first: 1→2→3 kolommen
- Lazy loading images
- Focus states voor toegankelijkheid

### Service Pagina
- H1, intro, 3 secties (waarom/wat/hoe)
- FAQ accordion
- CTA blok
- Gerelateerde diensten
- Breadcrumbs

## Acceptatiecriteria
- [ ] Alle 9 diensten hebben eigen pagina
- [ ] Unieke metadata per dienst
- [ ] JSON-LD (Service + FAQ + Breadcrumbs)
- [ ] Interne links naar gerelateerde diensten
- [ ] CTA naar map-search filtert correct
- [ ] Toegankelijk (focus states, aria-labels)
- [ ] Performance (geen CLS, lazy loading)
- [ ] Mobile responsive
- [ ] TypeScript errors opgelost

## Implementatie Volgorde
1. ServicesGrid component
2. Service data en types
3. Diensten overzichtspagina
4. Dynamische dienst pagina
5. SEO metadata en JSON-LD
6. FAQ component
7. Footer navigatie
8. Testing en optimalisatie
