import 'server-only'

export type BlogCategory = 'dog-walking' | 'pet-sitting' | 'transport' | 'training' | 'general'

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  tags: string[]
  coverImage?: string
  category?: BlogCategory
  content: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'hondenuitlaat-aan-huis-zo-werkt-het',
    title: 'Hondenuitlaat aan huis: zo werkt het',
    excerpt:
      'Professionele hondenuitlaat is meer dan wandelen. We leggen het proces uit van intake en planning tot veiligheid, gedrag en opvolging, met focus op welzijn en voorspelbaarheid.',
    date: '2026-01-05',
    readingTime: '18 min',
    tags: ['Hondenuitlaat', 'Routine', 'Veiligheid'],
    category: 'dog-walking',
    coverImage: '',
    content: [
      'Professionele hondenuitlaat is een georganiseerde dienst met duidelijke kwaliteitsnormen. Het gaat niet alleen om beweging, maar om een routine die aansluit op het karakter, de gezondheid en de context van de hond. Een goede uitlaatdienst werkt voorspelbaar, zorgvuldig en met aandacht voor welzijn op lange termijn. Dat is het verschil tussen iemand die even wandelt en een professionele service.',
      'De basis is een grondige intake. We verzamelen informatie over gedrag, tempo, prikkelgevoeligheid en medische aandachtspunten. Ook routines in huis en voorkeuren van de eigenaar worden besproken. Zonder deze informatie is de kans groter dat de wandeling te intens is of dat verwachtingen mislopen. Een duidelijke intake maakt het mogelijk om veilig en realistisch te plannen.',
      'Gezondheid bepaalt wat haalbaar is. Denk aan ouderdom, herstel, gewrichtsproblemen of medicatie. Dit heeft invloed op tempo, duur en het type beweging. Professionele hondenuitlaat houdt rekening met belastbaarheid en bouwt de wandeling op een veilige manier op. Het doel is ondersteuning, niet uitputting.',
      'Gedrag is even belangrijk. Sommige honden reageren sterk op verkeer, andere op onverwachte geluiden of andere honden. Die triggers bepalen de route en de manier van begeleiden. Door dit vooraf te kennen, kunnen we situaties vermijden die onnodige spanning veroorzaken en een wandelplan opbouwen dat rust geeft.',
      'Op basis van de intake maken we een plan op maat. Dat plan gaat niet alleen over tijd en duur, maar ook over ritme. Sommige honden hebben baat bij korte, frequente wandelingen, andere bij langere, rustige trajecten. We stemmen het tijdstip af op energieniveau en omgeving. Drukke momenten vermijden we waar dat nodig is.',
      'De keuze van de route is bewust. Voor sommige honden werkt een groene zone uitstekend, voor andere is een rustige woonwijk beter. Variatie kan verrijkend zijn, maar alleen als de hond er klaar voor is. We bouwen variatie gecontroleerd op en kiezen routes die passen bij het profiel van de hond.',
      'Veiligheid staat centraal. Dat betekent het juiste materiaal, een passend harnas of leiband en duidelijke afspraken rond loslopen. In een professionele context is loslopen geen standaard, maar een bewuste keuze met heldere criteria. We kiezen voor voorspelbaarheid en controle, omdat dat voor de hond rust geeft en voor de omgeving veiligheid.',
      'Tijdens de wandeling letten we op signalen. Honden tonen stress vaak subtiel: vertraagd tempo, vermijden van prikkels, fixatie of overmatig snuffelen. Door die signalen te herkennen, kunnen we het tempo aanpassen en prikkels doseren. Dat is essentieel om overprikkeling te vermijden en de wandeling opbouwend te houden.',
      'We houden ook rekening met weersomstandigheden. Hitte, ijs of stevige regen vragen een andere aanpak. Professionele uitlaat betekent dat we intensiteit aanpassen, water voorzien en routes kiezen die veilig blijven. Dit is basiszorg en voorkomt onnodige belasting.',
      'Mentale stimulatie hoort bij een goede wandeling. Snuffelmomenten, gecontroleerde verkenning en rustpauzes zijn waardevol. Het is een misvatting dat een hond alleen beweging nodig heeft. Professionele uitlaat combineert beweging met structuur en rust.',
      'Communicatie is een vast onderdeel. Na elke wandeling volgt een korte update: hoe het ging, hoe de hond reageerde en of er iets opviel. Dit maakt de service transparant en helpt om bij te sturen als gedrag of routine verandert. Transparantie is een kwaliteitskenmerk.',
      'Continuiteit is belangrijk. Een vaste verzorger zorgt voor herkenning en rust. Daarom plannen we waar mogelijk met dezelfde persoon en werken we met duidelijke overdrachten wanneer er een vervanger nodig is. Ook dat is professioneel werken.',
      'Een goede uitlaatdienst is eerlijk over grenzen. Niet elke hond past in elke setting. Soms is individuele begeleiding beter dan een groepswandeling. Een professionele dienst adviseert in het belang van het dier en kiest de aanpak die echt werkt.',
      'Kort samengevat: professionele hondenuitlaat combineert intake, planning, gedrag, veiligheid en opvolging. Wie dit goed organiseert, bouwt aan rust voor hond en eigenaar en aan een routine die betrouwbaar is op lange termijn.',
      'Ook de rol van de eigenaar is belangrijk. Duidelijke communicatie over veranderingen in gedrag, gezondheid of routine helpt om snel bij te sturen. Als een hond plots gevoelig reageert, is die informatie essentieel om de aanpak veilig te houden. Professionele uitlaat is dus een samenwerking, geen eenrichtingsdienst.',
      'Aansprakelijkheid en verzekering zijn vaak onderschat. Een professionele dienst werkt met duidelijke afspraken over verantwoordelijkheid, sleutelbeheer en incidenten. Dat is niet alleen juridisch, maar vooral praktisch: wanneer iedereen weet wat de afspraken zijn, is er minder risico op misverstanden.',
      'De waarde van professionele hondenuitlaat zit in de combinatie van ervaring en structuur. Het is geen vrijblijvende wandeling, maar een dienst die bijdraagt aan welzijn, gedrag en stabiliteit. Dat merk je in de dagelijkse routine en in het vertrouwen dat hond en eigenaar opbouwen.',
      'Wie dit traject serieus neemt, kiest voor kwaliteit boven toeval. Een professionele aanpak is voorspelbaar, veilig en gebaseerd op de noden van de hond. Dat is precies wat je verwacht wanneer je de zorg van je dier uit handen geeft.',
    ],
  },
  {
    slug: 'dierenoppas-tijdens-vakantie-checklist',
    title: 'Dierenoppas tijdens vakantie: de checklist',
    excerpt:
      'Een doordachte voorbereiding is de sleutel tot professionele oppas aan huis. Deze checklist helpt je om niets te vergeten en zorgt voor voorspelbare zorg.',
    date: '2026-01-08',
    readingTime: '18 min',
    tags: ['Oppas', 'Vakantie', 'Checklist'],
    category: 'pet-sitting',
    coverImage: '',
    content: [
      'Een goede voorbereiding voorkomt problemen. Start met een duidelijke routinefiche: voedertijden, hoeveelheden, wandelmomenten, medicatie en gedragsaandachtspunten. Hoe concreter je de routine beschrijft, hoe kleiner de kans op misverstanden. Dit is de basis van professionele opvolging.',
      'Regel veilige toegang tot je woning. Sleuteloverdracht, code of sleutelkluis kan allemaal, zolang de afspraken helder zijn. Noteer ook het alarm, de verlichting en eventuele beperkingen in de woning. Toegang is een praktische factor, maar vooral een veiligheidsfactor.',
      'Voorzie alle contactgegevens: dierenarts, noodcontact en jouw bereikbaarheid tijdens de reis. Als er iets gebeurt, is snel en correct handelen essentieel. Een duidelijke contactketen voorkomt onzekerheid en vertraging.',
      'Geef per dier extra info. Denk aan stresssignalen, gevoeligheden, interacties tussen dieren en wat wel of niet mag. Bij meerdere dieren is de onderlinge dynamiek belangrijk; een routine die werkt voor het ene dier kan spanning geven bij het andere.',
      'Maak praktische afspraken rond voeding en materiaal. Voorzie voldoende voorraad en zet alles op een vaste plek. Zo vermijden we improvisatie en kunnen we efficiënt en rustig werken.',
      'Plan een korte overdracht. Een rustige uitleg op locatie geeft vertrouwen en maakt de routine concreet. In die overdracht bespreek je ook waar je zelf grenzen ziet en wat je wel of niet wil dat er gebeurt.',
      'Denk aan veiligheid in huis: ramen, deuren, giftige planten en toegang tot balkons of trappen. Kleine details kunnen grote gevolgen hebben, zeker wanneer je afwezig bent.',
      'Laat duidelijk weten hoe je updates wil ontvangen. Een korte update per bezoek geeft je rust en zorgt voor transparantie zonder de dieren extra prikkels te geven.',
      'Hou rekening met veranderingen in routine. Een dier dat normaal elke dag naar buiten gaat, heeft een ander plan nodig dan een dier dat alleen binnen leeft. Dit bepaalt hoe we plannen en welke tijdsblokken het meest geschikt zijn.',
      'Voorzie duidelijke instructies rond medicatie. Vermeld dosering, timing en toedieningswijze. Zorg dat alles klaar ligt en dat er geen twijfel is over wat wanneer moet gebeuren.',
      'Leg vast wat te doen bij noodgevallen. Bijvoorbeeld: wanneer contact opnemen, wat de voorkeur is bij een spoedgeval en welke kostenlimieten er gelden. Duidelijkheid voorkomt stress en versnelt beslissingen.',
      'Tot slot: beschouw oppas aan huis als samenwerking. Hoe beter je informatie aanlevert, hoe beter de oppas kan werken. Dat is in het belang van je dieren en van jouw gemoedsrust.',
      'Denk ook aan praktische details zoals afval, schoonmaak en toegang tot extra materiaal. Als die zaken vooraf duidelijk zijn, blijft de oppas gefocust op zorg en niet op zoeken of improviseren.',
      'Plan het laatste moment van de oppasperiode. Wanneer kom je thuis, wie sluit af en wat moet er nog gebeuren? Door dit vooraf te bepalen, voorkom je onduidelijkheid over verantwoordelijkheid of timing.',
      'Maak afspraken over communicatie bij twijfel. Soms is er geen noodgeval, maar wel een situatie waarin een snelle vraag helpt. Geef aan hoe je bereikbaar bent en hoe snel je wil antwoorden. Dat maakt het proces professioneel en efficiënt.',
      'Een checklist is geen bureaucratie, maar een kwaliteitsinstrument. Hoe vollediger de informatie, hoe rustiger de oppas en hoe beter de dieren het ervaren. Dat is precies het doel van professionele oppas aan huis.',
      'Voor dieren met specifieke routines is timing cruciaal. Voeding en medicatie op vaste momenten kan het verschil maken in gedrag en welzijn. Door dit nauwkeurig te noteren, ontstaat er een stabiel ritme dat de oppas kan volgen.',
      'Ook de omgeving heeft invloed. Geluid, bezoek en veranderingen in huis kunnen stress verhogen. Vraag de oppas om die prikkels zo veel mogelijk te beperken en houd de routine compact en rustig.',
      'Bij langere oppasperiodes is het nuttig om tussentijds te evalueren. Een korte check-in over verloop, eetlust en gedrag helpt om tijdig bij te sturen en zorgt voor professionele opvolging.',
      'Tot slot: zorg dat de oppas weet waar belangrijke documenten liggen, zoals inentingen, medische info of noodnummers. Dit verhoogt de paraatheid en maakt het verschil wanneer snelheid nodig is.',
    ],
  },
  {
    slug: 'groepsuitlaat-wanneer-geschikt',
    title: 'Groepsuitlaat: wanneer is het geschikt?',
    excerpt:
      'Groepsuitlaat werkt alleen als de hond en de groep goed matchen. Dit zijn de kerncriteria voor veiligheid, gedrag en welzijn.',
    date: '2026-01-11',
    readingTime: '18 min',
    tags: ['Groepsuitlaat', 'Gedrag', 'Socialisatie'],
    category: 'dog-walking',
    coverImage: '',
    content: [
      'Groepsuitlaat is alleen geschikt als hond en groep goed matchen. Dat begint met stabiel sociaal gedrag en voorspelbare reacties in prikkelrijke situaties. Zonder die basis is een groepswandeling onnodig risicovol en vaak te stressvol.',
      'We beoordelen prikkelgevoeligheid. Sommige honden raken snel overprikkeld in groep; voor hen is individuele begeleiding vaak beter. Dat is geen oordeel, maar een keuze voor welzijn. Kwaliteit is belangrijker dan de groepsvorm.',
      'De samenstelling van de groep is cruciaal. We kijken naar energie, leeftijd, grootte en temperament. Een goede match voorkomt spanning en maakt de wandeling rustig en beheersbaar. Een verkeerde match vergroot het risico op conflict en stress.',
      'Groepsuitlaat is geen loslopende chaos. Het is begeleide beweging met duidelijke regels rond afstand, interactie en leiband. Loslopen gebeurt alleen als het veilig is, de omgeving het toelaat en de honden er klaar voor zijn.',
      'We houden rekening met individuele grenzen. Een hond die het ene moment ontspannen is, kan in een andere setting toch spanning tonen. Daarom blijven we observeren en sturen we bij wanneer nodig.',
      'Niet elke hond is geschikt voor elk tijdstip. Drukke momenten, veel prikkels of harde omgevingen kunnen te intens zijn. We kiezen dus ook tijdsblokken die passen bij de hond en de groep.',
      'Socialisatie betekent niet alles toelaten. Het betekent gecontroleerde interactie in een veilige setting. Daar hoort ook bij dat we grenzen bewaken en gedrag tijdig bijsturen.',
      'We bespreken dit altijd vooraf in de intake. Als we adviseren om niet in groep te lopen, is dat uit zorg voor veiligheid en welzijn. Een individuele aanpak kan dan beter passen.',
      'Een goede groepsuitlaat levert structuur, beweging en positieve sociale ervaring op. Dat lukt alleen met een professionele aanpak, duidelijke selectie en consequente begeleiding.',
      'Kort samengevat: groepsuitlaat werkt als veiligheid, gedrag en groepsdynamiek op elkaar afgestemd zijn. Dat is exact waar professionele begeleiding het verschil maakt.',
      'Voorafgaande screening is essentieel. We kijken niet alleen naar basisgehoorzaamheid, maar ook naar impulscontrole en herstel na prikkels. Een hond die snel ontspant na spanning, is doorgaans beter geschikt voor groepswandeling dan een hond die blijft escaleren.',
      'Groepsgrootte is een sturingsmiddel. Kleine groepen zijn overzichtelijker en geven meer controle, zeker bij gemengde profielen. Professionele begeleiding kiest groepsgrootte op basis van gedrag en context, niet op basis van maximale capaciteit.',
      'De omgeving bepaalt de moeilijkheidsgraad. Een rustige omgeving met voldoende ruimte is vaak beter dan drukke zones. We kiezen locaties waar we afstand kunnen houden en de dynamiek kunnen sturen, zodat honden ontspannen kunnen bewegen.',
      'Veiligheidsregels zijn niet optioneel. Interactie wordt begeleid, en er is altijd een plan voor wat te doen bij spanning of conflict. Dat is precies waarom groepsuitlaat professioneel moet worden georganiseerd.',
      'Een hond kan in de ene groep uitstekend functioneren en in een andere minder goed. Daarom blijven we evalueren en passen we samenstellingen aan wanneer nodig. Dit is een continue kwaliteitscontrole, geen eenmalige beslissing.',
      'De meerwaarde van groepsuitlaat zit in gecontroleerde sociale ervaring. Het leert honden omgaan met andere honden in een voorspelbare setting, zonder dat het ontaardt in chaos. Dat is het verschil tussen socialisatie en overprikkeling.',
    ],
  },
  {
    slug: 'kattenoppas-aan-huis-wat-te-verwachten',
    title: 'Kattenoppas aan huis: wat te verwachten',
    excerpt:
      'Katten zijn gevoelig voor verandering. Dit is wat professionele oppas aan huis inhoudt en waarom het vaak de meest rustige oplossing is.',
    date: '2026-01-15',
    readingTime: '18 min',
    tags: ['Katten', 'Oppas', 'Thuiszorg'],
    category: 'pet-sitting',
    coverImage: '',
    content: [
      'Katten hechten sterk aan hun omgeving. Oppas aan huis behoudt de vertrouwde routine en beperkt stress, vooral bij katten die gevoelig zijn voor verandering. Dat is vaak de grootste reden waarom oppas aan huis de voorkeur krijgt.',
      'Tijdens elk bezoek verzorgen we voeding, water en kattenbak. Daarnaast doen we een korte welzijnscheck: we letten op eetlust, gedrag, vacht en algemene alertheid. Kleine signalen kunnen belangrijk zijn, zeker bij katten die van nature minder tonen.',
      'Bij meerdere katten houden we rekening met hun onderlinge dynamiek. We vermijden onnodige spanning door de routine te behouden en de benadering aan te passen aan wat voor de groep werkt.',
      'Een professionele oppas dwingt geen contact af. Sommige katten zoeken contact, andere niet. Respect voor grenzen is essentieel om stress te beperken.',
      'We werken met duidelijke afspraken rond voeding, toegang en rustplekken. Katten voelen zich veiliger als routines herkenbaar blijven en de omgeving voorspelbaar is.',
      'Updates horen erbij. Een korte boodschap na elk bezoek geeft je inzicht zonder extra prikkels voor de dieren. Transparantie en rust gaan hand in hand.',
      'Katten zijn gevoelig voor prikkels zoals geluid, bezoek en ongewone geuren. Daarom houden we de bezoekmomenten rustig en efficiënt, zonder de katten te forceren.',
      'Oppas aan huis is vaak de meest rustige oplossing, zeker voor katten die niet graag verplaatsen of voor wie een opvangomgeving te intens is.',
      'Een goede voorbereiding helpt: duidelijke instructies, voldoende voorraad en contactgegevens zorgen voor voorspelbaarheid en veiligheid.',
      'Kort samengevat: professionele kattenoppas aan huis is gericht op rust, routine en welzijn. Dat is precies wat katten het meeste nodig hebben wanneer jij afwezig bent.',
      'Katten reageren sterk op geur en territorium. Daarom vermijden we onnodige veranderingen in hun omgeving. Zelfs het verplaatsen van voer- of waterbakken kan stress veroorzaken, dus we houden de opstelling stabiel.',
      'Bij katten met medische noden is observatie extra belangrijk. Kleine veranderingen in eetlust of gedrag kunnen een vroeg signaal zijn. Een professionele oppas let hierop en geeft het tijdig door, zodat er snel kan worden bijgestuurd.',
      'Multikat huishoudens vragen specifieke aandacht. Meer dan een kattenbak, voldoende rustplekken en duidelijke scheiding van hulpbronnen verminderen spanning. Dat zijn basisprincipes die we ook tijdens oppas hanteren.',
      'Contact met de kat gebeurt op zijn of haar tempo. Een kat die afstand houdt, krijgt ruimte. Een kat die contact zoekt, krijgt rustige aandacht. Dat respect voor grens en ritme vermindert stress en versterkt vertrouwen.',
      'Ook de veiligheid van de woning telt mee: ramen, balkons en buitendeuren vragen extra aandacht. Een professionele oppas handelt altijd met veiligheidsbewustzijn en controleert afsluitingen bij vertrek.',
      'Professionele kattenoppas is uiteindelijk een combinatie van routine, observatie en respect voor gedrag. Dat klinkt eenvoudig, maar vraagt consistentie en kennis. Dat is precies waar professionele zorg het verschil maakt.',
    ],
  },
  {
    slug: 'veilig-transport-van-huisdieren',
    title: 'Veilig transport van huisdieren',
    excerpt:
      'Transport vraagt voorbereiding. Zo garanderen we veiligheid, rust en welzijn onderweg, met aandacht voor gedrag, comfort en risicovermijding.',
    date: '2026-01-18',
    readingTime: '18 min',
    tags: ['Transport', 'Veiligheid', 'Dierenzorg'],
    category: 'transport',
    coverImage: '',
    content: [
      'Veilig transport begint met het juiste materiaal: een geschikte bench of passend harnas. De keuze hangt af van het dier, de reisduur en het gedrag. Dit is geen detail, maar een basisvoorwaarde voor veiligheid.',
      'Een goede voorbereiding vermindert stress. We bespreken vooraf hoe het dier reageert op vervoer en stemmen de aanpak daarop af. Rust en voorspelbaarheid helpen om spanning te beperken.',
      'We plannen de rit met aandacht voor prikkels. Zeker bij stressgevoelige dieren vermijden we drukke momenten en kiezen we voor een rustige aanpak.',
      'Medische aandachtspunten moeten vooraf duidelijk zijn. Zo kunnen we het transport veilig organiseren en risico’s beperken. Bij twijfel nemen we geen risico.',
      'Temperatuur, ventilatie en comfort zijn cruciaal. Dit klinkt vanzelfsprekend, maar in de praktijk bepaalt het vaak hoe veilig en rustig het transport verloopt.',
      'We hanteren duidelijke procedures voor instappen, vastmaken en uitstappen. Veiligheid is niet alleen tijdens de rit belangrijk, maar ook bij het begin en het einde.',
      'Transport is onderdeel van professionele dierenzorg. Een rustige verplaatsing kan veel verschil maken in welzijn en gedrag, zeker bij gevoelige dieren.',
      'Ook korte ritten vragen dezelfde aandacht als lange ritten. Veiligheid en rust zijn niet afhankelijk van afstand.',
      'Wanneer nodig adviseren we alternatieven of extra maatregelen. Dit gebeurt altijd in het belang van het dier.',
      'Kort samengevat: professioneel transport combineert voorbereiding, veiligheid, gedrag en comfort. Dat is de standaard die we hanteren.',
      'Voor sommige dieren is vervoer extra belastend. In zulke gevallen plannen we extra tijd in en kiezen we een zo rustig mogelijke route. Het doel is spanning verlagen, niet snelheid maximaliseren.',
      'Instappen en uitstappen zijn momenten met verhoogd risico. Daarom hanteren we duidelijke procedures en nemen we geen shortcuts. Controle en rust zijn hier net zo belangrijk als tijdens de rit zelf.',
      'Ook hygiëne en veiligheid in het voertuig zijn belangrijk. We zorgen voor een schone, stabiele omgeving en vermijden los materiaal dat kan verschuiven of extra stress veroorzaakt.',
      'Bij langere trajecten houden we rekening met pauzes en evalueren we de toestand van het dier. Dat is geen luxe, maar een basisregel voor professioneel vervoer.',
      'Documentatie kan relevant zijn, bijvoorbeeld bij medische afspraken of specifieke vereisten. Daarom vragen we vooraf alle informatie die nodig is om het transport correct en veilig te organiseren.',
      'Professioneel transport is in essentie risicobeheer. Het combineert voorbereiding, gedrag, materiaalkeuze en veilige uitvoering. Dat is de reden waarom het meer is dan alleen van A naar B rijden.',
    ],
  },
]

const normalizePost = (post: BlogPost): BlogPost => ({
  ...post,
  coverImage: post.coverImage ?? '',
  category: post.category ?? 'general',
})

export const getBlogPosts = () => {
  return [...BLOG_POSTS].map(normalizePost).sort((a, b) => b.date.localeCompare(a.date))
}

export const getBlogPostBySlug = (slug: string) => {
  const post = BLOG_POSTS.find((item) => item.slug === slug)
  return post ? normalizePost(post) : undefined
}

export const getBlogPostSlugs = () => BLOG_POSTS.map((post) => post.slug)
