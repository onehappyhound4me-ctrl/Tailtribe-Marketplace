import Image from 'next/image'

export const revalidate = 86400

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
        {/* Decorative shapes */}
        <div className="pointer-events-none select-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none select-none absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl">
            <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 rounded-full">
              <span className="text-sm font-semibold text-emerald-700 tracking-wide">Vertrouwd door honderden baasjes</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700" style={{
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.4)'
            }}>Join our tribe</h1>
            <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed">We verbinden baasjes en betrouwbare verzorgers met technologie, expertise en een warm netwerk.</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      {/* Intro & Missie */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-8 leading-relaxed text-gray-800">
          <p>
            TailTribe is een platform gemaakt door en voor dierenverzorgers. Met jarenlange praktijkervaring in de professionele dierenzorg begrijpen wij de uitdagingen waarmee verzorgers dagelijks geconfronteerd worden. Die ervaring stelt ons in staat om dierenoppassers persoonlijk te adviseren en te ondersteunen bij het opbouwen van hun praktijk.
          </p>
          <p>
            We zagen hoe moeilijk het voor baasjes is om betrouwbare hulp te vinden, en tegelijk hoeveel gepassioneerde dierenliefhebbers hun kennis en tijd graag willen delen. Daarom bouwden we TailTribe: een platform dat die twee werelden op een veilige en transparante manier samenbrengt, met unieke ondersteuning voor verzorgers die hun dienstverlening naar een hoger niveau willen tillen.
          </p>

          <span className="text-xs tracking-wider uppercase text-emerald-700/80">Missie</span>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">Onze missie</h2>
          <p>
            We willen de standaard in dierenzorg verhogen – door technologie te combineren met menselijke betrokkenheid en echte ervaring uit het veld. Onze missie is eenvoudig: huisdieren de beste zorg bieden, en de mensen die daarvoor zorgen de waardering en middelen geven die ze verdienen.
          </p>
          <p>
            TailTribe creëert vertrouwen, maakt communicatie eenvoudiger en zorgt dat dierenliefde ook professioneel kan worden gedeeld.
          </p>

          <div className="h-px w-full bg-gray-100 my-6" />
          <span className="text-xs tracking-wider uppercase text-emerald-700/80">Werking</span>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">Hoe TailTribe werkt</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-emerald-600">
            <li>Zoek en ontdek betrouwbare verzorgers in jouw buurt.</li>
            <li>Bekijk profielen met ervaring, certificaten en echte beoordelingen.</li>
            <li>Boek veilig via het platform – betalingen en communicatie verlopen volledig binnen TailTribe.</li>
            <li>Volg alles centraal via het persoonlijke dashboard, van chat tot betalingen.</li>
          </ul>
          <p>
            Alles is ontworpen om zorg voor dieren zo persoonlijk en zorgeloos mogelijk te maken – voor zowel baasjes als verzorgers.
          </p>

          <div className="h-px w-full bg-gray-100 my-6" />
          <span className="text-xs tracking-wider uppercase text-emerald-700/80">Voor wie</span>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">Voor wie TailTribe er is</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-emerald-600">
            <li>Voor huisdiereigenaren die zekerheid en gemoedsrust willen bij elke vorm van dierenzorg.</li>
            <li>Voor verzorgers die hun passie voor dieren professioneel willen inzetten, ondersteund door een betrouwbaar platform.</li>
          </ul>
          <p>
            Van hondenuitlaters tot kattenoppassers, van kleinveeverzorgers tot trainers: TailTribe biedt één plek waar kwaliteit, vertrouwen en dierenliefde samenkomen.
          </p>

          <div className="h-px w-full bg-gray-100 my-6" />
          <span className="text-xs tracking-wider uppercase text-emerald-700/80">Waarden</span>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">Onze waarden</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white shadow-md hover:shadow-xl hover:border-emerald-300 transition-all">
              <h3 className="font-bold text-xl mb-3 text-emerald-800">Vertrouwen</h3>
              <p className="text-gray-700">Gebouwd op jarenlange praktijkervaring en een zorgvuldig selectieproces van verzorgers.</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-100 via-teal-50 to-white shadow-md hover:shadow-xl hover:border-teal-300 transition-all">
              <h3 className="font-bold text-xl mb-3 text-teal-800">Kwaliteit</h3>
              <p className="text-gray-700">Professionele dierenzorg betekent kennis, structuur en toewijding.</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white shadow-md hover:shadow-xl hover:border-emerald-300 transition-all">
              <h3 className="font-bold text-xl mb-3 text-emerald-800">Transparantie</h3>
              <p className="text-gray-700">Heldere communicatie, duidelijke tarieven en een veilig boekingsproces.</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-100 via-teal-50 to-white shadow-md hover:shadow-xl hover:border-teal-300 transition-all">
              <h3 className="font-bold text-xl mb-3 text-teal-800">Verantwoordelijkheid</h3>
              <p className="text-gray-700">Respect voor dier, natuur en mens staat centraal.</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white shadow-md hover:shadow-xl hover:border-emerald-300 transition-all md:col-span-2">
              <h3 className="font-bold text-xl mb-3 text-emerald-800">Gemeenschap</h3>
              <p className="text-gray-700">We verbinden dierenvrienden en professionals in België tot een warme tribe.</p>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100 my-6" />
          <span className="text-xs tracking-wider uppercase text-emerald-700/80">Belofte</span>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">Onze belofte</h2>
          <p>
            TailTribe is meer dan een platform – het is een beweging binnen de moderne dierenzorg. We bouwen aan een gemeenschap die professionaliteit en passie combineert, en die de zorg voor dieren toegankelijker, veiliger en beter maakt.
          </p>
          <p>
            Met onze ervaring uit het veld weten we wat werkt, waar eigenaars naar op zoek zijn, en wat verzorgers nodig hebben om te groeien. TailTribe vertaalt die kennis in technologie die écht het verschil maakt.
          </p>

          {/* Prominent Quote */}
          <div className="my-12">
            <div className="relative rounded-2xl p-10 md:p-14 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200 shadow-lg overflow-hidden">
              <div className="absolute -top-10 -left-6 text-emerald-200/40 text-[160px] leading-none select-none">"</div>
              <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-100/50 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-teal-100/50 rounded-full blur-3xl"></div>
              <p className="relative text-center text-2xl md:text-4xl italic font-medium text-gray-900 max-w-4xl mx-auto">
                The greatness of a nation and its moral progress can be judged by the way its animals are treated.
              </p>
              <div className="relative mt-4 text-center text-emerald-700 font-semibold">— Mahatma Gandhi</div>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100 my-6" />
          <span className="text-xs tracking-wider uppercase text-emerald-700/80">Roots</span>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">Onze roots</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white shadow-md hover:shadow-xl hover:border-emerald-300 transition-all">
              <h3 className="font-bold text-xl text-emerald-800 mb-2">Oorsprong</h3>
              <p className="text-gray-700">TailTribe werd opgericht in België door het team van One Happy Hound, actief sinds 2018 als gespecialiseerde hondenuitlaatservice met een sterke reputatie in betrouwbaarheid en dierenkennis.</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-100 via-teal-50 to-white shadow-md hover:shadow-xl hover:border-teal-300 transition-all">
              <h3 className="font-bold text-xl text-teal-800 mb-2">Evolutie</h3>
              <p className="text-gray-700">Wat begon als een lokale dienst groeide uit tot een professionele organisatie met een groeiende klantengroep, meerdere verzorgers en honderden tevreden baasjes.</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white shadow-md hover:shadow-xl hover:border-emerald-300 transition-all">
              <h3 className="font-bold text-xl text-emerald-800 mb-2">Visie</h3>
              <p className="text-gray-700">Vanuit die ervaring ontstond het idee om dierenzorg slimmer en beter georganiseerd te maken – voor álle huisdieren. TailTribe staat voor persoonlijke, professionele zorg met moderne technologie.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* Footer CTA intentionally removed */}
    </div>
  )
}


