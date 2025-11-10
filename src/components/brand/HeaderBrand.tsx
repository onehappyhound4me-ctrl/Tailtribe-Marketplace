import Link from 'next/link'
import Image from 'next/image'

export function HeaderBrand() {
  return (
    <div className="ml-0 sm:ml-0 md:-ml-20 lg:-ml-32 group transition-all duration-300">
      <div className="w-[240px] sm:w-[280px] md:w-[320px] lg:w-[350px] h-auto overflow-visible relative">
        <Image 
          src="/assets/tailtribe_logo_masked_1751977129022.png" 
          alt="TailTribe Logo" 
          width={700}
          height={700}
          priority
          sizes="(max-width: 480px) 200px, (max-width: 768px) 240px, 350px"
          className="w-full h-auto object-contain scale-105 md:scale-110 relative z-10 transition-transform duration-300 group-hover:scale-[1.12]"
          style={{ 
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15)) brightness(1.15) contrast(1.15) saturate(1.1)'
          }}
        />
      </div>
    </div>
  )
}
