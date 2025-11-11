'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCurrentCountry, addCountryPrefix } from '@/lib/utils'

export default function HomePageClient() {
  const { data: session } = useSession()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const pathname = usePathname()
  const [currentCountry, setCurrentCountry] = useState<'BE' | 'NL'>('BE')
  
  useEffect(() => {
    // Detect country from hostname first, then pathname
    let country: 'BE' | 'NL' = 'BE'
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('tailtribe.nl') || hostname === 'tailtribe.nl') {
        country = 'NL'
      } else if (hostname.includes('tailtribe.be') || hostname === 'tailtribe.be') {
        country = 'BE'
      } else {
        // Fallback to pathname detection
        country = getCurrentCountry(pathname)
      }
    } else {
      country = getCurrentCountry(pathname)
    }
    
    setCurrentCountry(country)
    
    const handleCountryChange = (e: any) => {
      setCurrentCountry(e.detail)
    }
    
    window.addEventListener('countryChanged', handleCountryChange)
    return () => window.removeEventListener('countryChanged', handleCountryChange)
  }, [pathname])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    // Ensure muted for mobile autoplay and attempt playback
    videoEl.muted = true
    const tryPlay = async () => {
      try {
        await videoEl.play()
      } catch {
        // If autoplay is blocked, reveal poster image as fallback
        const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
        if (posterEl) {
          posterEl.classList.remove('hidden')
        }
      }
    }

    // Kick off playback on mount
    void tryPlay()
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section 
        className="hero-root relative w-full min-h-[85vh] md:min-h-[95vh] overflow-hidden flex items-center"
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          className="hero-video absolute inset-0 w-full h-full object-cover object-[50%_70%]"
          poster="/assets/tail 1_1751975512369.png"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{}}
          controls
          onLoadedData={() => {
            const v = videoRef.current
            if (!v) return
            v.muted = true
            v.play().then(() => {
              const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
              if (posterEl) posterEl.classList.add('hidden')
            }).catch(() => {
              // ignore; user can press the button
            })
          }}
          onPlay={() => {
            const posterEl = document.querySelector<HTMLImageElement>('.hero-poster')
            if (posterEl) posterEl.classList.add('hidden')
          }}
        >
          <source src="/hero.webm?v=6" type="video/webm" />
          <source src="/hero.mp4?v=6" type="video/mp4" />
        </video>
        
        {/* Poster fallback for reduced motion */}
        <img
          src="/assets/tail 1_1751975512369.png"
          alt=""
          className="hero-poster hidden absolute inset-0 w-full h-full object-cover object-[50%_70%]"
          loading="eager"
          style={{}}
        />
        
        {/* Subtle blue tint overlay - removed for truer colors */}
        <div className="hidden" />
        
        {/* Edge shadow effect removed */}
        <div className="hidden" />
        
        {/* Professional shadow overlay removed */}
        <div className="hidden" />
        
        {/* Content */}
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
              ✓ Lokale professionals  ✓ Voor en door dierenverzorgers  ✓ Direct contact
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <Link 
                  href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
                  className="group relative bg-white text-green-700 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Naar Dashboard
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>
              ) : (
              <Link 
                href={addCountryPrefix('/search', currentCountry)} 
                className="group relative bg-white text-green-700 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Vind jouw dierenoppas
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </Link>
              )}
              
              <Link 
                href="/auth/register" 
                className="group relative bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 border-2 border-white/30 hover:border-white/50 overflow-hidden"
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
              {session ? 'Welkom terug!' : 'Gratis registratie • Geen verborgen kosten • Direct aan de slag'}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
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
                image: '/assets/home-visit.png',
                href: '/diensten/verzorging-aan-huis'
              }
            ].map((service) => (
              <Link 
                key={service.href}
                href={addCountryPrefix(service.href, currentCountry)}
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
              href={addCountryPrefix('/diensten', currentCountry)}
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

      {/* Visual Gallery Section removed on request */}

      {/* Benefits for Caregivers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Word professioneel dierenverzorger
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Ontwikkel je carrière in dierenverzorging met volledige controle over je planning en tarieven
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Flexibele verdiensten',
                desc: 'Bepaal zelf je tarieven en werk wanneer het jou uitkomt, zonder verplichtingen'
              },
              {
                title: 'Volledige controle',
                desc: 'Beheer je eigen beschikbaarheid en kies de boekingen die bij jou passen'
              },
              {
                title: 'Directe communicatie',
                desc: 'Communiceer rechtstreeks met eigenaren via ons betrouwbare platform'
              }
            ].map((benefit) => (
              <div key={benefit.title} className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.title === 'Flexibele verdiensten' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {benefit.title === 'Volledige controle' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  {benefit.title === 'Directe communicatie' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Word dierenverzorger
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-gray-600">
              Inschrijven duurt slechts 2 minuten • Geen startkosten
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent)]"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Klaar voor de beste dierenoppas?
          </h2>
          <p className="text-xl md:text-2xl mb-4 text-green-50 max-w-2xl mx-auto">
            Het platform dat eigenaren en dierenoppassers verbindt
          </p>
          <p className="text-lg md:text-xl mb-10 text-green-100 max-w-xl mx-auto">
            Start vandaag nog met het vinden van de perfecte match
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link 
                href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
                className="group relative bg-white text-green-700 px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.6)] transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Naar Dashboard
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </Link>
            ) : (
              <>
                <Link 
                  href={addCountryPrefix('/search', currentCountry)}
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
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-green-100">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gratis aanmelden</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Geen verborgen kosten</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
