'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Photo {
  id: string
  url: string
  caption?: string
  category: 'profile' | 'work' | 'pets' | 'facilities'
}

interface PhotoGalleryProps {
  photos: Photo[]
  caregiverName: string
}

const mockPhotos: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
    caption: 'Wandeling in het park met Max',
    category: 'work'
  },
  {
    id: '2', 
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    caption: 'Training sessie met Luna',
    category: 'work'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    caption: 'Speeltijd in de achtertuin',
    category: 'facilities'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400',
    caption: 'Verzorging van katten',
    category: 'pets'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    caption: 'Professionele uitrusting',
    category: 'facilities'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    caption: 'Groepswandeling',
    category: 'work'
  }
]

export function PhotoGallery({ photos = mockPhotos, caregiverName }: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const categories = [
    { id: 'all', label: 'Alle foto\'s', icon: '📷' },
    { id: 'work', label: 'Aan het werk', icon: '🐕' },
    { id: 'facilities', label: 'Faciliteiten', icon: '🏠' },
    { id: 'pets', label: 'Huisdieren', icon: '' },
    { id: 'profile', label: 'Profiel', icon: '👤' }
  ]

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const count = category.id === 'all' ? photos.length : photos.filter(p => p.category === category.id).length
          if (count === 0 && category.id !== 'all') return null
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                selectedCategory === category.id
                  ? 'bg-green-500 text-green-100'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.url}
              alt={photo.caption || `Foto van ${caregiverName}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Caption */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium">{photo.caption}</p>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                {categories.find(c => c.id === photo.category)?.icon} {categories.find(c => c.id === photo.category)?.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Geen foto's in deze categorie
            </h3>
            <p className="text-gray-600">
              Selecteer een andere categorie om foto's te bekijken.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-3xl">×</span>
            </button>
            
            <div className="relative aspect-auto max-h-[80vh] overflow-hidden rounded-lg">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || `Foto van ${caregiverName}`}
                width={800}
                height={600}
                className="object-contain w-full h-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {selectedPhoto.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white text-lg font-medium">
                  {selectedPhoto.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Photos CTA (for caregiver's own profile) */}
      <Card className="border-2 border-dashed border-green-200 hover:border-green-300 transition-colors">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Voeg meer foto's toe
          </h3>
          <p className="text-gray-600 mb-4">
            Laat eigenaren zien hoe geweldig je met hun huisdieren omgaat!
          </p>
          <Button className="gradient-button">
            📷 Foto's uploaden
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
