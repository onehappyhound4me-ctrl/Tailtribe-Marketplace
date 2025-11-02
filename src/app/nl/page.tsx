import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Dierenoppas Nederland - Betrouwbare Dierenoppassers',
  description: 'Vind betrouwbare dierenoppassers in Nederland. Van hondenuitlaat tot dierenoppas aan huis, verbind met lokale professionals voor de beste zorg.',
  keywords: 'dierenoppas nederland, dierenoppasser amsterdam, hondenoppas rotterdam, hondenuitlaat utrecht, dierenopvang nederland, huisdieren nederland',
  openGraph: {
    title: 'TailTribe Nederland - Betrouwbare Dierenoppassers',
    description: 'Vind dierenoppassers in Nederland',
  }
}

export default function NetherlandsHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section - EXACT ZELFDE ALS BE */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
              Vind de perfecte <span className="text-green-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(134,239,172,0.8)] transition-all duration-300 cursor-default">dierenoppasser</span> voor je huisdier
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-green-50 max-w-3xl mx-auto">
              Hondenuitlaat, dierenoppas en dierenverzorging bij jou in de buurt
            </p>
            <p className="text-lg mb-8 text-green-100 max-w-2xl mx-auto">
              ✓ Lokale professionals  ✓ Betrouwbaar platform  ✓ Direct contact
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/nl/search" 
                className="group relative bg-white text-green-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Vind jouw dierenoppas
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </Link>
              
              <Link 
                href="/auth/register" 
                className="group relative bg-gradient-to-r from-green-500 to-blue-500 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 border-2 border-white/30 hover:border-white/50 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Word dierenoppasser
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>

            <p className="mt-6 text-sm text-green-100">
              Gratis registratie • Geen verborgen kosten • Direct aan de slag
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid - EXACT ZELFDE ALS BE */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Ontdek onze diensten
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
            Van wandelen tot oppassen - vind de perfecte service voor jouw huisdier
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Service Cards */}
            {[
              {
                title: 'Hondenuitlaat',
                desc: 'Dagelijkse wandelingen voor jouw hond',
                image: '/assets/Hondenuitlaat.png',
                href: '/diensten/hondenuitlaat'
              },
              {
                title: 'Groepsuitlaat',
                desc: 'Sociale uitstapjes met andere honden',
                image: '/assets/groepsuitlaat.png',
                href: '/diensten/groepsuitlaat'
              },
              {
                title: 'Hondentraining',
                desc: 'Professionele training en begeleiding',
                image: '/assets/hondentraining.png',
                href: '/diensten/hondentraining'
              },
              {
                title: 'Dierenoppas',
                desc: 'Betrouwbare oppas bij de verzorger',
                image: '/assets/hondenoppas.png',
                href: '/diensten/dierenoppas'
              },
              {
                title: 'Dierenopvang',
                desc: 'Verzorging in een veilige omgeving',
                image: '/assets/hondenopvang.png',
                href: '/diensten/dierenopvang'
              },
              {
                title: 'Verzorging aan huis',
                desc: 'Zorg in het comfort van je eigen huis',
                image: '/assets/verzorging kleinvee.png',
                href: '/diensten/verzorging-aan-huis'
              }
            ].map((service) => (
              <Link 
                key={service.href}
                href={service.href}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                  <Image 
                    src={service.image} 
                    alt={service.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 pt-7">
                  <h3 className="text-lg font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/diensten"
              className="inline-flex items-center text-green-700 font-semibold text-lg hover:text-green-800 transition-colors"
            >
              Bekijk alle diensten
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works - EXACT ZELFDE ALS BE */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Hoe werkt het?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            In 3 eenvoudige stappen naar de perfecte dierenoppas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Zoek & Ontdek',
                desc: 'Zoek dierenoppassers in jouw buurt en bekijk hun profielen, reviews en beschikbaarheid'
              },
              {
                step: '2',
                title: 'Boek & Bevestig',
                desc: 'Kies de perfecte dierenoppasser en boek direct online met een veilig betalingssysteem'
              },
              {
                step: '3',
                title: 'Relax & Geniet',
                desc: 'Laat jouw huisdier genieten van professionele oppas terwijl jij gerust kunt zijn'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for Caregivers - EXACT ZELFDE ALS BE */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Waarom dierenoppasser worden?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Verdien extra inkomen door te doen wat je leuk vindt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💰',
                title: 'Verdien extra inkomen',
                desc: 'Stel je eigen tarieven in en bepaal wanneer je werkt'
              },
              {
                icon: '📅',
                title: 'Flexibele planning',
                desc: 'Werk wanneer het jou uitkomt, geen verplichtingen'
              },
              {
                icon: '🤝',
                title: 'Direct contact',
                desc: 'Communiceer rechtstreeks met eigenaren via ons platform'
              }
            ].map((benefit) => (
              <div key={benefit.title} className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/auth/register"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start nu als dierenoppasser
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-gray-600">
              Inschrijven duurt slechts 2 minuten • Geen startkosten
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section - EXACT ZELFDE ALS BE */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent)]"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Klaar voor de beste dierenoppas?
          </h2>
          <p className="text-xl mb-4 text-green-50">
            Het platform dat eigenaren en dierenoppassers verbindt
          </p>
          <p className="text-lg mb-10 text-green-100">
            Start vandaag nog met het vinden van de perfecte match
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/nl/search"
              className="group relative bg-white text-green-700 px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.6)] transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                Vind dierenoppassers
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </Link>
            
            <Link 
              href="/auth/register"
              className="group bg-green-800/30 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-green-800/50 transition-all duration-300 border-2 border-white/30 hover:border-white/60 transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="flex items-center gap-2 justify-center">
                Word dierenoppasser
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-green-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Gratis aanmelden
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Geen verborgen kosten
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              24/7 support
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



