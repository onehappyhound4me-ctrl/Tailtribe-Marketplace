'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { SERVICE_ICON_FILTER, withAssetVersion } from '@/lib/service-icons'

// Gebruik een lokale hero-afbeelding uit /public.
// Cache-buster query om harde refresh te forceren bij updates.
const HERO_IMG_PRIMARY = '/assets/hero.jpg?v=2'
const HERO_IMG_URL = encodeURI(HERO_IMG_PRIMARY)

export default function HomePage() {
  const { data: session } = useSession()
  
  // Smart booking link: ingelogde owners gaan naar dashboard, anderen naar publieke form
  const bookingHref = session?.user?.role === 'OWNER' 
    ? '/dashboard/owner/new-booking' 
    : '/boeken'

  // iOS Safari can sometimes show a blank page for long Google "search" URLs opened in a new tab.
  // Use a short Google Maps CID link on mobile for reliability (desktop keeps the existing behavior).
  const GOOGLE_REVIEWS_MOBILE_URL = 'https://www.google.com/maps?cid=3943987553262873468&hl=nl&gl=BE'
  const GOOGLE_REVIEWS_DESKTOP_URL =
    'https://www.google.com/search?sa=X&sca_esv=8e3f949f37700064&rlz=1C1GCEA_nlBE1182BE1182&sxsrf=ANbL-n7GXfUhpUSVoRCwb-PMSSbfQn8I6g:1767962687775&q=One+Happy+Hound+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2tjQxtrQwNzU1NjIzsjA3NjGz2MDI-IpR3D8vVcEjsaCgUsEjvzQvRSEotSwztbx4ESsuGQDsNANRTgAAAA&rldimm=3943987553262873468&tbm=lcl&hl=nl-NL&ved=2ahUKEwil-eufvv6RAxUth_0HHY3BLagQ9fQKegQIQhAG&cshid=1767962827872947&biw=1536&bih=695&dpr=1.25&aic=0#lkt=LocalPoiReviews'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref={bookingHref} primaryCtaLabel="Boek Nu" />

      {/* Hero with Image */}
      <section className="relative w-full min-h-[40vh] md:min-h-[50vh] overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${HERO_IMG_URL}")`,
            backgroundPosition: '50% 30%',
            backgroundSize: 'cover',
            filter: 'brightness(1.12) saturate(1.05) blur(2px)',
          }}
        />
        <div className="absolute inset-0 bg-black/12" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white"
              style={{ textShadow: '0 3px 12px rgba(0,0,0,0.55)' }}
            >
              Vind de juiste{' '}
              <span className="text-green-200 transition-colors duration-200 hover:text-white hover:drop-shadow-[0_0_12px_rgba(74,222,128,0.85)]">
                dierenoppaser
              </span>{' '}
              voor je huisdier
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-4 max-w-3xl mx-auto">
              <span
                className="inline-block px-1.5 py-0.5 rounded bg-black/18 backdrop-blur-[3px] font-semibold"
                style={{ color: '#eaffcc', textShadow: '0 3px 12px rgba(0,0,0,0.85)' }}
              >
                Hondenuitlaat, dierenoppas, dierenverzorging en meer bij jou in de buurt
              </span>
            </p>
            <p className="text-base sm:text-lg mb-6 max-w-2xl mx-auto">
              <span
                className="inline-block px-1.5 py-0.5 rounded bg-black/18 backdrop-blur-[3px] font-semibold"
                style={{ color: '#eaffcc', textShadow: '0 3px 12px rgba(0,0,0,0.85)' }}
              >
                ✓ Gescreende dierenverzorgers ✓ Snelle bevestiging ✓ Voor en door dierenverzorgers
              </span>
            </p>
            {/* Removed bottom line per request */}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href={bookingHref}
                className="group relative bg-white text-green-700 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Boek Nu
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </Link>
              <Link
                href="/verzorger-aanmelden"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full font-semibold bg-white/20 text-white border border-white/30 backdrop-blur hover:bg-white/30 transition shadow-lg"
              >
                Word verzorger: werk met dieren
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Ontdek onze diensten
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Van wandelen tot oppassen - vind de perfecte dienst voor jouw huisdier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 max-w-6xl mx-auto">
            {DISPATCH_SERVICES.map((service) => (
              <Link 
                key={service.id}
                href={`/diensten/${service.slug}`}
                className="group bg-gradient-to-br from-white via-white to-emerald-50 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-emerald-100 hover:border-emerald-200 transform hover:-translate-y-1"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
                  <Image 
                    src={withAssetVersion(service.image)} 
                    alt={service.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    style={{ filter: SERVICE_ICON_FILTER }}
                  />
                </div>
                <div className="p-6 pt-7">
                  <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 group-hover:from-emerald-600 group-hover:to-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-emerald-900/90 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Hoe werkt het?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              In 3 eenvoudige stappen naar de perfecte dierenoppas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {[
              {
                step: '1',
                title: 'Vul je aanvraag in',
                desc: 'Kies je dienst en datum, vul kort je gegevens in; klaar in 2 minuten'
              },
              {
                step: '2',
                title: 'Wij plannen de juiste verzorger',
                desc: 'We matchen je aanvraag, stemmen kort af en plannen de juiste verzorger'
              },
              {
                step: '3',
                title: 'Relax & Geniet',
                desc: 'Na bevestiging komt de verzorger langs; samen stemmen jullie planning en afspraken af'
              }
            ].map((item) => (
              <div
                key={item.step}
                className="text-center flex flex-col items-center h-full bg-white/70 rounded-2xl p-6 shadow-sm border border-emerald-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed px-2">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dispatch benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Waarom TailTribe?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Jij vraagt aan, wij nemen je gemoedsrust op ons: we regelen en volgen op met zorg
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Gescreende verzorgers',
                desc: 'We werken met betrouwbare verzorgers en zoeken de beste match voor jouw aanvraag'
              },
              {
                title: 'Snelle bevestiging',
                desc: 'We reageren snel: we bevestigen je aanvraag en stemmen de details kort af'
              },
              {
                title: 'Afspraak op maat',
                desc: 'Geen online betaling: we spreken prijs en details af op basis van jouw situatie'
              }
            ].map((benefit) => (
              <div key={benefit.title} className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.title === 'Gescreende verzorgers' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {benefit.title === 'Snelle bevestiging' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {benefit.title === 'Afspraak op maat' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* Offerte-knop verwijderd op verzoek */}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Reviews van baasjes</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Rust in je hoofd: echte ervaringen van klanten die hun huisdier aan ons toevertrouwen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Sophie Legrève',
                rating: 5,
                quote: 'Super professioneel en zorgzaam! Juno is dolgelukkig wanneer ze mee kan. Ik ben super blij en dankbaar voor deze oplossing.',
              },
              {
                name: 'Annika Vershaeve',
                rating: 5,
                quote: 'Super dienst! Helpt enorm met mijn actieve Weimaraner en maakte hem echt sociaal.',
              },
              {
                name: 'Ann Sourdeau',
                rating: 5,
                quote: 'Steven belde vrijwel meteen terug en kon snel langskomen. Hij gaf heel goede tips; onze hond is veel stabieler. Ook nadien bereikbaar voor raad!',
              },
            ].map((review) => (
              <div
                key={review.name}
                className="group bg-white rounded-2xl p-7 shadow-md hover:shadow-2xl transition-all duration-300 border border-emerald-100 hover:border-emerald-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 3.75 14.6 9l5.15.41c.36.03.5.49.23.73l-3.9 3.42 1.17 5.01c.09.36-.3.66-.62.46L12 16.98l-4.63 2.85c-.32.2-.71-.1-.62-.46l1.17-5.01-3.9-3.42a.44.44 0 0 1 .23-.73L9.4 9 12 3.75Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">{review.quote}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            {/* Mobile-only: route via internal page for iOS reliability */}
            <Link
              href="/google-reviews"
              className="inline-flex md:hidden items-center justify-center gap-2 text-emerald-800 font-semibold hover:text-emerald-600 transition-colors"
            >
              Bekijk alle Google reviews
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
              </svg>
            </Link>

            {/* Desktop-only: keep existing long URL/behavior */}
            <a
              href={GOOGLE_REVIEWS_DESKTOP_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden md:inline-flex items-center justify-center gap-2 text-emerald-800 font-semibold hover:text-emerald-600 transition-colors"
              onClick={(e) => {
                if (typeof window === 'undefined') return
                const ua = window.navigator?.userAgent ?? ''
                const isIOS = /iPad|iPhone|iPod/i.test(ua)
                // If the user requested "desktop site" on iPhone, CSS may show the desktop link.
                // Still force the iOS-safe short Maps link.
                if (isIOS) {
                  e.preventDefault()
                  window.location.href = GOOGLE_REVIEWS_MOBILE_URL
                }
              }}
            >
              Bekijk alle Google reviews
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
