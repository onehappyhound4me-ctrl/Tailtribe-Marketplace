export type DispatchService = {
  id:
    | 'DOG_WALKING'
    | 'GROUP_DOG_WALKING'
    | 'DOG_TRAINING'
    | 'PET_SITTING'
    | 'PET_BOARDING'
    | 'HOME_CARE'
    | 'PET_TRANSPORT'
    | 'SMALL_ANIMAL_CARE'
    | 'EVENT_COMPANION'
  name: string
  desc: string
  slug: string
  image: string
  // optional, only for the service detail page (keeps cards short)
  detailTitle?: string
  // optional longer copy for service detail page
  longDescription?: {
    why: string[]
    includes: string[]
    whyText?: string
    includesText?: string
    tips?: string[]
  }
  /**
   * Optional: highlight an external provider/brand that currently delivers this service in a specific area.
   * This lets TailTribe scale to multiple providers later without hardcoding UI logic per page.
   */
  providerSpotlight?: {
    name: string
    href: string
    label?: string
    /**
     * Short, human-friendly availability sentence shown on the service page.
     * Example: "Momenteel beschikbaar in Antwerpen (rand) en Noord Antwerpen (Kapellen–Brasschaat–Kalmthout)."
     */
    availabilityText?: string
    /**
     * Optional list of areas (kept for future filtering/expansion).
     */
    areas: string[]
    /**
     * Button text override for the external link.
     */
    ctaLabel?: string
    note?: string
  }
}

// Canonical services list (match SaaS labels + use original assets)
export const DISPATCH_SERVICES: DispatchService[] = [
  {
    id: 'DOG_WALKING',
    name: 'Hondenuitlaat',
    desc: 'Dagelijkse wandelingen met focus op welzijn, tempo en veiligheid',
    slug: 'hondenuitlaat',
    image: '/assets/Hondenuitlaat.png',
    longDescription: {
      why: [
        'Beweging verlaagt stresshormonen en bevordert herstel; snuffelen verrijkt en werkt kalmerend.',
        'We wandelen op tempo en belastbaarheid: leeftijd, conditie, gewrichten en hitte worden meegenomen.',
        'Veiligheid en voorspelbaarheid: duidelijke routes, materiaalcheck en afgestemde duur/frequentie.',
        'We letten op signalen: ademhaling, hijgen, tempo, ruglijn, staplengte en afleidingstolerantie.',
        'Snuffelen = mentale verrijking: kortere, rijkere wandelingen zijn vaak beter dan lange, gehaaste.',
      ],
      whyText:
        'Wandelen is meer dan “energie kwijt”: het reguleert stress (lager cortisol), ondersteunt spier- en gewrichtsgezondheid en biedt mentale verrijking via snuffelen. We stemmen duur, tempo en ondergrond af op leeftijd, conditie, bouw en klimaat (hitte/koude). Bij elk traject kijken we naar signalen als ademhalingsfrequentie, hijgpatroon, romphouding, staplengte en herstel. Zo houden we belasting binnen gezonde marges en verminderen we risico op oververhitting of overbelasting.\n\nSnuffelen is geen “pauze” maar een kernonderdeel van welzijn. Korte, snuffelrijke wandelingen kunnen kalmerend werken en mentale vermoeidheid geven zonder het lichaam te overbelasten. Daarom plannen we snuffelmomenten bewust in.',
      includes: [
        'Afgestemd plan: duur, tempo, solo of duo/kleine groep (indien passend).',
        'Snuffel- en herstelmomenten ingebouwd; geen “gejaagde” rondes.',
        'Veilig ophalen/terugbrengen, materiaalcheck (harnas/leiband) en weer-/hitte-inschatting.',
        'Korte update mogelijk (indien gewenst).',
      ],
      includesText:
        'We starten met een korte intake: leeftijd, conditie, medische aandachtspunten, warmte/koude-tolerantie, gewenst tempo en gedragszaken (prikkelgevoeligheid, reactiviteit). Daarna plannen we:\n\n- Duur & tempo: korter/snuffelrijk voor pups/oudere honden; gematigd voor fitte honden.\n- Veiligheid: materiaalcheck (goed passend Y-harnas, stevige leiband), zichtbaarheid (licht/reflectie), route met ondergrond die past bij gewrichten/poten.\n- Klimaat: bij hitte korter en rustiger, bij kou eventueel jas/handdoek; altijd waterpauzes waar nodig.\n- Rust & herstel: we bouwen pauzes en snuffelmomenten in, en letten op signalen om tijdig af te bouwen.\n- Communicatie: optionele korte update na afloop.',
      tips: [
        'Meld medische aandachtspunten (gewrichten, hart/luchtwegen, hittegevoeligheid) en huidig bewegingsniveau.',
        'Een goed passend Y-harnas vermindert druk op nek en wervelkolom; wij stemmen materiaal graag met je af.',
        'Bij warm weer plannen we korter, trager of vroeger/later; bij kou regen: eventueel jas/handdoek klaarleggen.',
        'Sleuteloverdracht kan met contract; we volgen vooraf afgesproken routes/regels (geen losloop zonder akkoord).',
      ],
    },
  },
  {
    id: 'GROUP_DOG_WALKING',
    name: 'Groepsuitlaat',
    desc: 'Sociale uitstapjes met andere honden',
    slug: 'groepsuitlaat',
    image: '/assets/groepsuitlaat.png',
    detailTitle: 'Groepsuitlaat-avontuurlijke daguitstappen',
    providerSpotlight: {
      name: 'One Happy Hound',
      href: 'https://onehappyhound.be/?utm_source=tailtribe&utm_medium=referral&utm_campaign=groepsuitlaat',
      label: 'onehappyhound.be',
      areas: ['Kalmthout', 'Kapellen', 'Brasschaat', 'Antwerpen (rand)'],
      availabilityText: 'Momenteel beschikbaar in Antwerpen (+rand) en Antwerpen Noord (Kapellen-Brasschaat-Kalmthout).',
      ctaLabel: 'Boek via onehappyhound.be',
      note: 'Boeken kan via One Happy Hound.',
    },
    longDescription: {
      why: [
        'Ideaal voor honden die sociaal zijn en graag samen wandelen.',
        'Meer prikkels en variatie, met aandacht voor veiligheid en compatibiliteit.',
      ],
      whyText:
        'Verveelt je hond zich als hij alleen thuis is of wanneer je bent gaan werken? Heb je gewoon even wat weinig tijd voor je viervoeter? Zou je ook graag een iets kalmere hond willen op het einde van de dag? Denk je dat je hond te dik is en kampt hij met overgewicht? Kauwt hij je meubels stuk?\n\nGeen nood, je kan nu beroep doen op onze uitlaatservice voor honden! Uw hond wordt opgehaald en na een volledige dagtocht moe en voldaan terug gebracht. Op die manier krijgt het baasje na een werkdag een kalme en zelfverzekerde hond terug.\n\nWetenschappelijke bevindingen tonen immers aan dat honden voldoende activiteit en contact nodig hebben met prikkels uit de omgeving. Hierbij hebben ze contact nodig met zowel andere honden als de natuur en mensen. Dit is wat wij deze dieren dan ook aanbieden.',
      includesText:
        'Je hond komt terecht in een groep van sociale honden waar er veel interactie is.\n\nVia veilig transport worden de honden ’s voormiddags bij de eigenaar opgepikt en ’s namiddags weer thuis afgezet.\n\nDe honden in de groep worden fysiek en mentaal uitgedaagd door allerlei activiteiten, zoals lopen, balspelletjes, wandelingen in bossen en velden, en uitdagingen met water om het natuurlijke gedrag van de hond te stimuleren. Uiteraard lassen we regelmatig rustpauzes in en houden we rekening met oudere honden, kleine honden en pups (vanaf 8–9 maanden).\n\nVeiligheid van hond en omstanders is een prioriteit en wordt voortdurend opgevolgd.\n\nVoor verzorgers die groepsuitlaat aanbieden voorzien we een kort zorg- & veiligheidstraject (gedrag, risico-inschatting en klantcommunicatie), zodat kwaliteit en veiligheid consistent blijven.\n\nHet kennismakingsgesprek is volledig gratis. Zo kan je meer te weten komen zonder verplichtingen. Hierbij kijken we ook of je hond geschikt is om mee te gaan met een groep honden. Is dat positief, dan volgt er een testdag. Daarna kan je hond mee op de uitlaatdagen.',
      includes: [
        'Afstemming op karakter en energie (indien mogelijk).',
        'Duidelijke afspraken over ophalen/terugbrengen en timing.',
      ],
    },
  },
  {
    id: 'DOG_TRAINING',
    name: 'Hondentraining',
    desc: 'Professionele training en begeleiding',
    slug: 'hondentraining',
    image: '/assets/hondentraining.png',
    detailTitle: 'Hondentraining',
    longDescription: {
      why: [
        'Gerichte begeleiding bij gedrag, basiscommando’s of specifieke uitdagingen.',
        'Praktisch en haalbaar: we stemmen af op jouw hond en jouw situatie.',
      ],
      whyText:
        'Goede training is geen “trucje”, maar leerpsychologie in de praktijk. Honden leren via consequenties (beloning/uitkomst), timing en herhaling. Onderzoek wijst uit dat beloningsgerichte training (positive reinforcement) niet alleen effectief is, maar ook het welzijn ondersteunt: je bouwt gewenst gedrag op, in plaats van ongewenst gedrag enkel te onderdrukken.\n\nDaarom werken we met duidelijke criteria, korte oefenmomenten en veel succeservaringen. We houden rekening met prikkels, stress en opwinding (“drempelwaarde”): een hond kan pas leren als hij zich voldoende veilig en rustig voelt. Daarnaast trainen we op generalisatie: gedrag moet niet alleen “in de les”, maar ook thuis, op straat en in nieuwe situaties werken.\n\nWe vertrekken vanuit jouw doel (bv. trekken aan de lijn, opspringen, komen op commando, bezoekmomenten, alleen thuis, onzekerheid/reactiviteit) en maken een plan dat past bij je dagritme. Je krijgt concrete stappen, zodat je na elke sessie weet wat je exact moet doen en waarom het werkt.',
      includes: [
        'Intake en duidelijke doelen.',
        'Oefeningen en tips om thuis verder te trainen.',
      ],
      includesText:
        'We starten met een korte intake: context, routine, triggers, motivatie (beloningen) en wat je al geprobeerd hebt. Daarna formuleren we meetbare doelen (wat wil je wél zien?) en kiezen we de juiste aanpak.\n\nIn de sessies werken we met:\n- beloningsstrategie (voeding, spel of aandacht) en timing\n- stap-voor-stap opbouw (van makkelijk naar moeilijk)\n- management & veiligheid (voorkomen dat probleemgedrag “oefent”)\n- duidelijke afspraken voor thuis (oefenschema, frequentie, duur)\n\nNa de sessie krijg je een concreet plan om thuis verder te oefenen. Indien we signalen zien dat er een medische oorzaak kan meespelen (bv. pijn), adviseren we om dit eerst met een dierenarts te bespreken.\n\nPuppytraining is ook mogelijk.\nWanneer start de training van een pup? Vanaf de eerste dag: bouw een connectie op met je hond.\n\nWe werken leeftijdsgericht (de grenzen zijn richtlijnen) en focussen op welzijn, veiligheid en een stevige basis:\n\n- Pup 8–12 weken (basis & socialisatie)\nVeilig socialiseren (mensen, honden, geluiden, ondergronden) en gewenning aan handling (oren, poten, borstelen). We leggen de basis voor zindelijkheid, alleen blijven, rustmomenten en bijtrem.\n\n- Pup 12–16 weken (basiscommando’s & zelfcontrole)\nWe bouwen verder met “Kom”, “Zit”, “Los”, “Kijk” en een duidelijke beloningsmarker. Daarnaast werken we aan zelfcontrole (wachten, niet opspringen) en starten we met wandelen aan de leiband.\n\n- Pup 4–8 maanden (puberteitsstart & generalisatie)\nGedrag moet overal werken: thuis, op straat en met afleiding. We versterken recall (hierkomen), wandelen zonder/aan de leiband, stoppen, wachten en kalm blijven bij prikkels.\n\n- Pup 8–18 maanden (gevorderd & maatwerk)\nGevorderde training op jouw doel: bv. stabiel wandelen, focus tussen prikkels, “plaats”, omgaan met bezoek, alleen thuis, of specifieke uitdagingen. We stellen een concreet plan op om resultaten te onderhouden.',
    },
  },
  {
    id: 'PET_SITTING',
    name: 'Dierenoppas',
    desc: 'De verzorger past op je huisdier in het comfort van je eigen woonst',
    slug: 'dierenoppas',
    image: '/assets/hondenoppas.png',
    longDescription: {
      why: [
        'Oppas is ideaal wanneer je een betrouwbare plek zoekt terwijl jij weg bent.',
        'We stemmen verwachtingen af: routine, voeding, wandelingen en comfort.',
      ],
      whyText:
        'Dierenoppas is de ideale oplossing wanneer je even geen opvang hebt, maar wél zekerheid wil dat je huisdier aandacht, rust en structuur krijgt. Bij deze dienst komt de verzorger bij jou thuis en past op je huisdier in het comfort van je eigen woonst. We werken met duidelijke afspraken en stemmen de zorg af op het karakter en de routine van je dier.\n\nHet doel is simpel: jouw huisdier voelt zich veilig en comfortabel in de eigen omgeving, en jij kan met een gerust hart weg. We houden rekening met gewoontes, energiepeil, eventuele gevoeligheden en (waar van toepassing) medicatie volgens jouw instructies.',
      includes: [
        'Afspraak op maat (dag, nacht of meerdere dagen).',
        'Duidelijke afspraken over voeding, medicatie en gewoontes.',
      ],
      includesText:
        'We starten met een korte afstemming (telefonisch of via bericht): wie is je huisdier, wat is de routine, wat zijn de do’s & don’ts en welke momenten zijn belangrijk (voeding, wandelingen, rust, speeltijd).\n\nTijdens de oppasperiode (bij jou thuis) zorgen we voor:\n- voeding en water volgens jouw schema\n- wandelingen of beweging op maat (indien nodig)\n- aandacht, rustmomenten en toezicht\n- opvolging van afspraken rond gedrag (bv. geen zetel, bench, …)\n\nIndien gewenst spreken we ook af hoe vaak je een update ontvangt (kort berichtje of foto).',
      tips: [
        'Neem favoriete voeding/snacks mee (en vermeld eventuele allergieën).',
        'Geef duidelijke instructies rond routine en grenzen (bench, sofa, bezoek, …).',
        'Noteer noodcontacten en dierenartsgegevens (voor de zekerheid).',
      ],
    },
  },
  {
    id: 'PET_BOARDING',
    name: 'Dierenopvang',
    desc: 'Verzorging in een veilige omgeving',
    slug: 'dierenopvang',
    image: '/assets/hondenopvang.png',
    longDescription: {
      why: [
        'Voor langere periodes of wanneer je extra opvang nodig hebt.',
        'Focus op comfort en veilige afspraken vooraf.',
      ],
      whyText:
        'Dierenopvang is bedoeld voor situaties waar je huisdier voor een langere periode een veilige, stabiele plek nodig heeft — bijvoorbeeld tijdens vakantie, herstel of wanneer je tijdelijk extra ondersteuning nodig hebt.\n\nWe zetten in op rust, voorspelbaarheid en duidelijke afspraken. Elk dier heeft zijn eigen tempo: daarom stemmen we de opvang af op routine, energie, prikkelgevoeligheid en eventuele medische noden. Zo krijgt je huisdier zorg op maat en weet jij precies wat je mag verwachten.',
      includes: [
        'Afstemming op planning en verblijfsduur.',
        'Duidelijke afspraken over voeding, routine en eventuele medicatie.',
      ],
      includesText:
        'Vooraf stemmen we de praktische details af: duur van de opvang, voeding, wandelingen, rustmomenten, gewenst contact met andere dieren, en eventuele medicatie.\n\nTijdens de opvang zorgen we voor:\n- voeding en water volgens jouw schema\n- beweging op maat (waar van toepassing)\n- rust, toezicht en een veilige omgeving\n- opvolging van routine en afspraken (bench, alleenmomenten, …)\n\nIndien gewenst spreken we af hoe vaak je een update ontvangt (kort berichtje of foto).',
      tips: [
        'Neem voldoende voeding mee (en vermeld eventuele allergieën).',
        'Geef duidelijke info over routine, grenzen en eventuele angsten (bv. vuurwerk, alleen zijn).',
        'Voorzie medicatie + toedieningsinstructies (indien van toepassing).',
        'Noteer noodcontacten en dierenartsgegevens (voor de zekerheid).',
      ],
    },
  },
  {
    id: 'HOME_CARE',
    name: 'Verzorging aan huis',
    desc: 'Verzorging aan huis voor je huisdier',
    slug: 'verzorging-aan-huis',
    image: '/assets/home-visit.png',
    longDescription: {
      why: [
        'Handig voor huisdieren die liever thuis blijven (minder stress).',
        'Flexibel: bezoekmomenten op maat (voeding, wandeling, check-in).',
      ],
      whyText:
        'Verzorging aan huis is ideaal voor huisdieren die zich het best voelen in hun eigen omgeving. Thuis blijven vermindert stress, vooral bij katten, oudere dieren of dieren die gevoelig zijn voor verandering.\n\nJe kiest zelf hoe vaak en hoe lang we langskomen. We volgen jouw routine zo nauw mogelijk, zodat je huisdier rust en voorspelbaarheid behoudt — en jij met een gerust hart weg kan.',
      includes: [
        'Bezoek aan huis volgens afspraak.',
        'Zorg op maat: voeding, water, korte wandeling of toezicht.',
      ],
      includesText:
        'We spreken vooraf af wat je precies nodig hebt: een dagelijkse check-in, voeding geven, water verversen, kattenbak verschonen, een korte wandeling, speeltijd of gewoon even toezicht.\n\nTijdens het huisbezoek zorgen we voor:\n- voeding en water volgens jouw schema\n- hygiëne en basiszorg (bv. kattenbak/kooi, indien afgesproken)\n- beweging of korte wandeling (waar van toepassing)\n- aandacht, rustmomenten en controle van welzijn\n\nDaarnaast kunnen we — in overleg — ook andere kleine taken bij je thuis opnemen (bv. planten water geven of post binnenhalen).\n\nIndien gewenst sturen we een korte update na elk bezoek (berichtje of foto).',
      tips: [
        'Bespreek vooraf hoe de dierenverzorger toegang kan krijgen (sleuteloverdracht, code, buur of sleutelkluisje) en maak duidelijke afspraken.',
        'Een sleutelcontract is mogelijk.',
        'Noteer routine (uren), voeding en eventuele medicatie + instructies.',
        'Voorzie noodcontacten en dierenartsgegevens (voor de zekerheid).',
      ],
    },
  },
  {
    id: 'PET_TRANSPORT',
    name: 'Transport huisdieren',
    desc: 'Veilig transport voor jouw huisdier',
    slug: 'transport-huisdieren',
    image: '/assets/transport van huisdieren.png',
    longDescription: {
      why: [
        'Voor dierenartsbezoeken, verhuis, ophalen/wegbrengen of speciale situaties.',
        'Veilig en met duidelijke afspraken vooraf.',
      ],
      whyText:
        'Veilig transport voorkomt stress en risico’s bij verplaatsingen. We stemmen af wat er precies moet gebeuren (ophalen/afzetten, dierenarts, verhuis, opvang) en zorgen voor een veilige setup met bench of harnas, afhankelijk van het dier en de rit.\n\nWe bekijken de gezondheidstoestand van het dier (indien relevant), plannen tijdig en voorzien voldoende marge zodat het dier rustig kan reizen. Duidelijke afspraken rond timing en contact zijn cruciaal.',
      includes: [
        'Transport volgens planning (ophalen/afzetten).',
        'Afstemming over bench, veiligheid en bijzonderheden.',
      ],
      includesText:
        'Vooraf bespreken we bestemming, timing en veiligheidsvereisten. We gebruiken een bench of passend harnas/veiligheidssysteem, afgestemd op het dier en de situatie.\n\nTijdens het transport voorzien we:\n- veilige bevestiging (bench/harnas) en toezicht\n- zorg voor comfort (ventilatie, rust, korte stops indien nodig)\n- opvolging van jouw instructies (bv. medicijnen meenemen, korte update na aankomst)\n\nLaat ons weten of er medische aandachtspunten zijn en of er documentatie mee moet.',
      tips: [
        'Voorzie een geschikte bench of harnas dat past bij je dier, of meld het als je dit niet hebt.',
        'Geef duidelijke bestemming(en), timings en eventuele papieren/medicatie mee.',
        'Meld medische bijzonderheden (stress, sedatie, gevoeligheden) vooraf.',
      ],
    },
  },
  {
    id: 'SMALL_ANIMAL_CARE',
    name: 'Verzorging van boerderijdieren',
    desc: 'Verzorging van kleinvee',
    slug: 'verzorging-boerderijdieren',
    image: '/assets/verzorging kleinvee.png',
    longDescription: {
      why: [
        'Voor boerderijdieren en kleine dieren is routine essentieel.',
        'We stemmen af op voeding, hokken/stallen en praktische taken.',
      ],
      whyText:
        'Boerderijdieren vragen consequente zorg: voeding, water, stal- of hokonderhoud en controle op welzijn. We werken met duidelijke afspraken per diersoort en passen het ritme aan wat het dier gewend is.\n\nWe stemmen vooraf af welke taken prioriteit hebben (voeding, water, uitmesten, korte check) en welke bijzonderheden er zijn (gevoeligheden, kudde-dynamiek, schrik voor onweer, enz.). Het doel is rust en voorspelbaarheid voor de dieren, ook wanneer jij er even niet bent.',
      includes: [
        'Voeding en water volgens schema.',
        'Controle en basiszorg volgens afspraak.',
      ],
      includesText:
        'Vooraf bespreken we de routines per diersoort (bv. kippen, geiten, schapen) en leggen we een duidelijke checklist vast.\n\nTijdens het bezoek zorgen we voor:\n- voeding en water volgens schema\n- basiscontrole van hokken/stallen (netheid, sluiting, ventilatie)\n- korte welzijnscheck (alertheid, wondjes, gedrag)\n- in overleg: basis schoonmaak/uitmesten op afgesproken frequentie\n\nMeld medische bijzonderheden of dieren die gescheiden moeten blijven. Indien nodig sturen we een korte update na het bezoek.',
      tips: [
        'Voorzie voldoende voeding/hooi/stro op locatie en beschrijf per diersoort de hoeveelheden.',
        'Geef door welke dieren gescheiden moeten blijven en hoe de hokken/stallen moeten worden afgesloten.',
        'Noteer dierenarts/noodcontact en eventuele medische aandachtspunten.',
      ],
    },
  },
  {
    id: 'EVENT_COMPANION',
    name: 'Begeleiding events',
    desc: 'Begeleiding tijdens events (bv. bruiloft)',
    slug: 'begeleiding-events',
    image: '/assets/Begleider Bruiloft.png',
    longDescription: {
      why: [
        'Zorg dat je huisdier mee kan naar een event zonder stress voor jou.',
        'Begeleiding op maat: timing, locatie, rustmomenten en veiligheid.',
      ],
      whyText:
        'Een event kan druk zijn voor je huisdier. Met begeleiding houd je zelf de handen vrij terwijl je huisdier veilig en rustig wordt opgevolgd. We stemmen de planning af (aankomst, foto’s, ceremonie, ontvangst) en voorzien voldoende pauzes.\n\nWe focussen op rust, veiligheid en goede afspraken met de locatie (binnen/buiten, looplijnen, rustplek). Zo kan je dier aanwezig zijn zonder dat jij je zorgen hoeft te maken.',
      includes: [
        'Afstemming op programma en locatie.',
        'Praktische ondersteuning tijdens het event.',
      ],
      includesText:
        'Vooraf bespreken we het draaiboek: waar en wanneer je huisdier aanwezig moet zijn (foto’s, ceremonie, ontvangst, groepsmomenten). We plannen rustmomenten en een veilige plek.\n\nTijdens het event voorzien we:\n- begeleiding van/naar de juiste locaties en momenten\n- toezicht, water/voeding volgens afspraak\n- kalme rustpauzes op een afgesproken plek\n- korte updates indien gewenst\n\nLaat ons weten of je huisdier gevoelig is voor lawaai, menigten of specifieke prikkels; we passen het plan daarop aan.',
      tips: [
        'Check bij de locatie of huisdieren zijn toegelaten en waar ze rustig kunnen wachten.',
        'Voorzie een vertrouwde riem/tuig en eventueel een kleedje of bench voor rustmomenten.',
        'Geef aan of je dier gevoelig is voor vuurwerk, luide muziek of menigten.',
      ],
    },
  },
]

export const SERVICE_LABELS: Record<DispatchService['id'], string> = DISPATCH_SERVICES.reduce(
  (acc, s) => {
    acc[s.id] = s.name
    return acc
  },
  {} as Record<DispatchService['id'], string>
)

export function getDispatchServiceBySlug(slug: string) {
  return DISPATCH_SERVICES.find((s) => s.slug === slug)
}



