import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3 text-emerald-600 hover:text-emerald-700 transition-colors">
      <Image 
        src="/assets/tailtribe-logo.png" 
        alt="TailTribe Logo" 
        width={40} 
        height={40}
        className="w-10 h-10 object-contain"
      />
      <span
        className="text-2xl font-bold"
        style={{
          WebkitTextStroke: '1px rgba(255,255,255,0.95)',
          textShadow: [
            '0 0 2px rgba(255,255,255,0.9)',
            '0 1px 0 rgba(255,255,255,0.95)',
            '1px 0 0 rgba(255,255,255,0.95)',
            '0 -1px 0 rgba(255,255,255,0.95)',
            '-1px 0 0 rgba(255,255,255,0.95)',
            '0 2px 4px rgba(0,0,0,0.25)'
          ].join(', ')
        }}
      >
        TailTribe
      </span>
    </Link>
  )
}
