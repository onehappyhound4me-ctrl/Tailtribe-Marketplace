'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useEffect } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    videoEl.muted = true
    const tryPlay = async () => {
      try {
        await videoEl.play()
      } catch {
        const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
        if (posterEl) {
          posterEl.classList.remove('hidden')
        }
      }
    }

    void tryPlay()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      {/* Hero with Video */}
      <section className="hero-root relative w-full min-h-[85vh] md:min-h-[95vh] overflow-hidden flex items-center">
        <video
          ref={videoRef}
          className="hero-video absolute inset-0 w-full h-full object-cover object-[50%_70%]"
          poster="/assets/tail 1_1751975512369.png"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => {
            const v = videoRef.current
            if (!v) return
            v.muted = true
            v.play().then(() => {
              const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
              if (posterEl) posterEl.classList.add('hidden')
            }).catch(() => {})
          }}
          onPlay={() => {
            const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
            if (posterEl) posterEl.classList.add('hidden')
          }}
        >
          <source src="/hero.webm?v=6" type="video/webm" />
          <source src="/hero.mp4?v=6" type="video/mp4" />
        </video>
        
        <img
          src="/assets/tail 1_1751975512369.png"
          alt=""
          className="hero-poster hidden absolute inset-0 w-full h-full object-cover object-[50%_70%]"
          loading="eager"
        />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 md:top-6 z-20">
            <button
              onClick={() => {
                const v = videoRef.current
                if (v) {
                  v.muted = true
                  v.play().then(() => {
                    const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
                    if (posterEl) posterEl.classList.add('hidden')
                  }).catch(() => {})
                }
              }}
              className="hidden md:inline-flex bg-white/80 backdrop-blur text-gray-900 px-4 py-2 rounded-full shadow hover:bg-white transition"
            >
              Speel video
            </button>
          </div>
          
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in text-white drop-shadow-2xl">
              Vind de perfecte <span className="text-green-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(134,239,172,0.8)] transition-all duration-300 cursor-default">dierenoppasser</span> voor je huisdier
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-4 text-gray-100 max-w-3xl mx-auto drop-shadow-xl">
              Hondenuitlaat, dierenoppas en dierenverzorging bij jou in de buurt
            </p>
            <p className="text-base sm:text-lg mb-8 text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
              ✓ Gescreende verzorgers ✓ Snelle bevestiging ✓ Direct contact
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/boeken"
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
                Ik ben dierenverzorger
              </Link>
            </div>

            <p className="mt-6 text-sm text-green-100">
              Aanvraag is gratis • Binnen 2 uur reactie • Geen online betaling
            </p>
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
              Van wandelen tot oppassen - vind de perfecte service voor jouw huisdier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 max-w-6xl mx-auto">
            {DISPATCH_SERVICES.map((service) => (
              <Link 
                key={service.id}
                href="/boeken"
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                  <Image 
                    src={service.image} 
                    alt={service.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 pt-7">
                  <h3 className="text-lg font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.desc}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Vul je aanvraag in',
                desc: 'Kies je service, datum en geef je gegevens door in 2 minuten'
              },
              {
                step: '2',
                title: 'Wij plannen de juiste verzorger',
                desc: 'We matchen je aanvraag met een geschikte verzorger en nemen contact op'
              },
              {
                step: '3',
                title: 'Relax & Geniet',
                desc: 'Na bevestiging komt de verzorger langs en jij bent gerust'
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

      {/* Dispatch benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Waarom TailTribe?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Een dispatch-aanpak: jij vraagt aan, wij regelen de juiste verzorger
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
                desc: 'Binnen 2 uur nemen we contact op om je aanvraag te bevestigen en af te stemmen'
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

          <div className="text-center mt-12">
            <Link 
              href="/boeken"
              className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Vraag een offerte aan
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
