import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import ServicesGrid from './(marketing)/components/ServicesGrid'

export const metadata: Metadata = {
  title: 'TailTribe - Betrouwbare dierenverzorging in België',
  description: 'Vind vertrouwde dierenverzorgers in België. Van hondenuitlaat tot dierenoppas, verbind met lokale professionals voor de beste zorg.',
  keywords: 'dierenverzorging, hondenuitlaat, dierenoppas, huisdieren, België, Vlaanderen, Wallonië, Brussel, hondentraining, dierenopvang, verzorging aan huis',
  openGraph: {
    title: 'TailTribe - Betrouwbare dierenverzorging in België',
    description: 'Vind vertrouwde dierenverzorgers in België. Van hondenuitlaat tot dierenoppas, verbind met lokale professionals.',
    type: 'website',
    locale: 'nl_BE',
    url: 'https://tailtribe.be',
    siteName: 'TailTribe',
    images: [
      {
        url: '/assets/tailtribe-logo.png',
        width: 1200,
        height: 630,
        alt: 'TailTribe - Dierenverzorging België',
      },
    ],
  },
}

export default async function HomePage() {
  // Structured data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TailTribe",
    "url": "https://tailtribe.be",
    "logo": "https://tailtribe.be/assets/tailtribe-logo.png",
    "description": "Betrouwbare dierenverzorging in België. Vind vertrouwde dierenverzorgers voor jouw huisdier.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BE"
    },
    "sameAs": [
      "https://tailtribe.be"
    ]
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dierenverzorging",
    "description": "Professionele dierenverzorging in België",
    "provider": {
      "@type": "Organization",
      "name": "TailTribe"
    },
    "areaServed": {
      "@type": "Country",
      "name": "België"
    },
    "serviceType": [
      "Hondenuitlaat",
      "Dierenoppas", 
      "Hondentraining",
      "Dierenopvang",
      "Verzorging aan huis"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-emerald-500/70 to-teal-600/80"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8"></div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] text-white tracking-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>
              <span className="font-display font-black">Vertrouwde</span>{' '}
              <span className="font-heading text-emerald-100">dierenverzorging</span>
              <br className="hidden md:block" />
              <span className="group font-display font-black text-emerald-200 relative inline-block mt-2 transition-colors duration-300 hover:text-emerald-50">
                op een klik afstand
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full shadow-md transition-all duration-300 group-hover:from-emerald-200 group-hover:to-teal-200 group-hover:shadow-lg group-hover:h-1.5"></div>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl mb-6 text-white/95 max-w-5xl mx-auto font-light leading-relaxed tracking-wide" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>
              <strong className="font-bold text-green-300 font-heading">Geverifieerde verzorgers</strong> klaar om jouw huisdier de <span className="font-semibold text-white">beste zorg</span> te geven
            </p>
            
            <div className="mb-8 max-w-4xl mx-auto">
              <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed tracking-wide" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.6)'}}>
                <span className="inline-flex items-center gap-2 mr-8">
                  <span className="text-emerald-300 text-xl">✓</span>
                  <span>Binnen 24 uur geboekt</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-300 text-xl">✓</span>
                  <span>Geverifieerde profielen</span>
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                href="/search" 
                prefetch={false}
                className="group border-3 border-white/90 bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 inline-flex items-center justify-center hover:scale-105 shadow-xl hover:shadow-white/25 tracking-wide"
                aria-label="Join our tribe voor huisdiereigenaren — zoek verzorgers"
                title="Join our tribe / Huisdiereigenaar"
              >
                <span className="font-heading">Join our tribe / Huisdiereigenaar</span>
              </Link>
              <Link 
                href="/auth/register?role=caregiver&callbackUrl=/profile/edit?role=caregiver" 
                prefetch={false}
                className="group border-3 border-white/90 bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 inline-flex items-center justify-center hover:scale-105 shadow-xl hover:shadow-white/25 tracking-wide"
                aria-label="Join our tribe voor dierenverzorgers — meld je aan"
                title="Join our tribe / Dierenverzorger"
              >
                <span className="font-heading">Join our tribe / Dierenverzorger</span>
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 py-8 border-y border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-center">
            <div className="flex items-center gap-2 text-emerald-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Geverifieerde verzorgers</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Veilig platform</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Transparante prijzen</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">24/7 beschikbaar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-white py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 to-white"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 font-display leading-tight tracking-tight">
            Waarom kiezen baasjes
            <br className="hidden md:block" />
            <span className="font-heading">voor ons platform?</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-6">
            <div className="group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-lg">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading tracking-wide">Binnen 24 uur geboekt</h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">Geen wachtlijsten. Directe beschikbaarheid van professionele verzorgers in jouw buurt.</p>
            </div>
            
            <div className="group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-lg">
                <span className="text-4xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading tracking-wide">Veilig & betrouwbaar</h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">Alle verzorgers worden gescreend en zijn persoonlijk geverifieerd.</p>
            </div>
            
            <div className="group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-lg">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading tracking-wide">Transparante prijzen</h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">Geen verborgen kosten of verrassingen. Je weet altijd precies wat je betaalt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Stats (tijdelijk verborgen totdat data beschikbaar is) */}

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hoe werkt het?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              In 3 simpele stappen verbonden met de perfecte verzorger
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-emerald-700">1</span>
                </div>
                {/* Connecting line */}
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zoek & vergelijk</h3>
              <p className="text-gray-600">
                Vind verzorgers in jouw buurt. Bekijk profielen, reviews en tarieven.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-teal-700">2</span>
                </div>
                {/* Connecting line */}
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-200 to-emerald-200"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Boek veilig</h3>
              <p className="text-gray-600">
                Stuur een bericht, plan een kennismaking en boek direct via het platform.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-emerald-700">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Geniet & review</h3>
              <p className="text-gray-600">
                Jouw huisdier krijgt de beste zorg. Deel jouw ervaring met anderen.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Services Section (6 items for performance; full list on /diensten) */}
      <ServicesGrid showAll={false} className="bg-gradient-to-br from-gray-50 to-white" />

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Voordelen voor baasjes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Waarom duizenden huisdiereigenaren kiezen voor ons platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Flexibel boeken</h3>
              <p className="text-gray-600 text-sm">Boek 24/7, annuleer tot 24u vooraf</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Veilig boeken</h3>
              <p className="text-gray-600 text-sm">Transparante afspraken en veilige communicatie</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lokaal netwerk</h3>
              <p className="text-gray-600 text-sm">Verzorgers in jouw buurt</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Kwaliteit</h3>
              <p className="text-gray-600 text-sm">Alleen de beste verzorgers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - hidden until real reviews are available */}
      {/* <section className="bg-gray-50 py-20">
        ... testimonials hidden for now ...
      </section> */}

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600"></div>
        <div className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-[600px] h-[600px] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
            Klaar om te beginnen?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-white/95 leading-relaxed" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>
            Sluit je aan bij tevreden huisdiereigenaren die ons platform vertrouwen 
            voor de beste dierenverzorging in België.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <Link 
              href="/search" 
              prefetch={false}
              className="group bg-white text-emerald-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-white/25 hover:scale-105 inline-flex items-center justify-center"
            >
              <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Zoek verzorgers
            </Link>
            <Link 
              href="/auth/register?role=caregiver&callbackUrl=/profile/edit?role=caregiver" 
              prefetch={false}
              className="group border-3 border-white/90 bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-emerald-600 transition-all duration-300 shadow-xl hover:shadow-white/25 hover:scale-105 inline-flex items-center justify-center"
            >
              <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Verdien als verzorger
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Gratis registratie</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">100% veilig</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Direct starten</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
