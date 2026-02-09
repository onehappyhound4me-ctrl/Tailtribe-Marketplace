'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { SERVICE_ICON_FILTER, withAssetVersion } from '@/lib/service-icons'
import { routes } from '@/lib/routes'

// Gebruik een lokale hero-afbeelding uit /public.
// Cache-buster query om harde refresh te forceren bij updates.
const HERO_IMG_PRIMARY = '/assets/hero-marketplace.jpg?v=1'
const HERO_IMG_URL = encodeURI(HERO_IMG_PRIMARY)
export default function HomePage() {
  const { data: session } = useSession()
  
  // Smart booking link: ingelogde owners gaan naar dashboard, anderen naar publieke form
  const bookingHref = session?.user?.role === 'OWNER' 
    ? '/dashboard/owner/new-booking' 
    : '/boeken'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref={bookingHref} primaryCtaLabel="Boek Nu" />

      {/* Hero with Image */}
      <section className="relative w-full min-h-[40vh] md:min-h-[50vh] overflow-hidden flex items-start sm:items-center">
        <img
          src={HERO_IMG_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[60%_35%] sm:object-[50%_30%] md:object-[50%_30%]"
          style={{ filter: 'brightness(1.08) saturate(1.04) blur(0.6px)' }}
        />
        <div className="absolute inset-0 bg-black/12" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-10 pb-12 sm:py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 sm:mb-6 leading-tight text-white"
              style={{ textShadow: '0 3px 12px rgba(0,0,0,0.55)' }}
            >
              Vind de juiste{' '}
              <span className="text-green-200 transition-colors duration-200 hover:text-white hover:drop-shadow-[0_0_12px_rgba(74,222,128,0.85)]">
                dierenoppasser
              </span>{' '}
              voor je huisdier
            </h1>
          </div>
        </div>
      </section>

      {/* Move hero copy + CTAs below the photo (no card/kader) */}
      <section className="pt-4 pb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Hondenuitlaat, dierenoppas, dierenverzorging en meer bij jou in de buurt
            </p>
            <p className="mt-2 text-sm sm:text-base text-emerald-900/90 font-semibold">
              Voor en door dierenverzorgers
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <Link href={bookingHref} className="btn-brand w-full inline-flex justify-center min-h-[48px]">
                Boek Nu
              </Link>
              <Link
                href="/verzorger-aanmelden"
                className="w-full inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition min-h-[48px]"
              >
                Join our tribe: werk met dieren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">
              Ontdek onze diensten
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Van wandelen tot oppassen - vind de perfecte dienst voor jouw huisdier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
            {DISPATCH_SERVICES.map((service) => (
              <Link 
                key={service.id}
                href={routes.dienst(service.slug)}
                data-nav="service"
                data-component="HomePage.ServicesGrid"
                data-service-id={service.id}
                data-service-slug={service.slug}
                className="group bg-gradient-to-br from-white via-white to-emerald-50 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-emerald-100 hover:border-emerald-200 transform hover:-translate-y-1"
              >
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
                  {/* Use plain <img> for local /assets icons: more reliable on mobile Safari than Next/Image optimizer. */}
                  <img
                    src={withAssetVersion(service.image)}
                    alt={service.name}
                    loading="eager"
                    decoding="async"
                    className="block h-full w-full max-w-full object-contain md:group-hover:scale-105 md:transition-transform md:duration-300 md:[filter:hue-rotate(28deg)_saturate(0.62)_brightness(0.98)_contrast(1.08)]"
                  />
                </div>
                <div className="p-5 sm:p-6 pt-6">
                  <h3 className="text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 group-hover:from-emerald-600 group-hover:to-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-emerald-900/90 leading-relaxed line-clamp-3">
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
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">
              Hoe werkt het?
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed px-2">
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
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">
              Waarom TailTribe?
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
              <div key={benefit.title} className="group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
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
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{benefit.desc}</p>
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
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">Reviews van baasjes</h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{review.quote}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            {/* Always route via internal page for reliability (avoids iOS Safari white Google page). */}
            <Link
              href="/google-reviews"
              className="inline-flex items-center justify-center gap-2 text-emerald-800 font-semibold hover:text-emerald-600 transition-colors"
            >
              Bekijk alle Google reviews (binnenkort)
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
