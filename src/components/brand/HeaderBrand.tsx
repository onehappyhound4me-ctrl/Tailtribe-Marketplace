import Link from 'next/link'
import Image from 'next/image'

export function HeaderBrand() {
  return (
    <div className="-ml-32 group">
      <div className="w-[350px] h-auto overflow-hidden relative">
        <Image 
          src="/assets/tailtribe_logo_masked_1751977129022.png" 
          alt="TailTribe Logo" 
          width={700}
          height={700}
          className="w-[350px] h-auto object-contain scale-110 -m-4 relative z-10 transition-transform duration-300 group-hover:scale-[1.12]"
          style={{ 
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15)) brightness(1.2) contrast(1.2)'
          }}
        />
      </div>
    </div>
  )
}
