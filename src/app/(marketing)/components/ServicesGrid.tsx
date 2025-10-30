import Link from 'next/link'
import Image from 'next/image'
import { services, Service } from '../../../../lib/services'

interface ServicesGridProps {
  showAll?: boolean
  className?: string
}

export default function ServicesGrid({ showAll = false, className = '' }: ServicesGridProps) {
  const displayServices = showAll ? services : services.slice(0, 6)

  return (
    <section className={`py-16 ${className}`} aria-labelledby="services-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="services-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Onze diensten
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professionele dierenverzorging voor elke behoefte. Kies de dienst die het beste bij jouw situatie past.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayServices.map((service: Service) => (
            <Link
              key={service.slug}
              href={`/diensten/${service.slug}`}
              className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 h-full"
              aria-label={`Bekijk ${service.title} diensten`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="mb-5 flex items-center justify-center">
                  {service.imageSrc ? (
                    <Image
                      src={service.imageSrc}
                      alt={service.imageAlt || service.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-contain drop-shadow-sm"
                      loading="lazy"
                      sizes="(max-width: 768px) 96px, (max-width: 1200px) 96px, 96px"
                    />
                  ) : (
                    <div className="text-5xl text-center group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-emerald-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-center mb-4 leading-relaxed flex-1">
                  {service.shortDescription}
                </p>
                
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium group-hover:bg-emerald-700 transition-colors">
                    Bekijk dierenoppassers
                    <svg 
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mt-8">
            <Link
              href="/diensten"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Bekijk alle diensten"
            >
              Alle diensten bekijken
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
