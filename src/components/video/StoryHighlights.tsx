'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getYouTubeThumbnail, getVimeoThumbnail, getVideoEmbedUrl } from '@/lib/seo'
import { StoryHighlight } from '@prisma/client'
import { VideoPlatform } from '@/lib/types'

interface StoryHighlightsProps {
  highlights: (StoryHighlight & {
    caregiver: {
      user: {
        name: string
      }
    }
  })[]
}

export function StoryHighlights({ highlights }: StoryHighlightsProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<StoryHighlight | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (highlights.length === 0) {
    return null
  }

  const openHighlight = (highlight: StoryHighlight) => {
    setSelectedHighlight(highlight)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedHighlight(null)
  }

  const getThumbnailUrl = (highlight: StoryHighlight) => {
    const videoId = extractVideoId(highlight.videoUrl, highlight.platform as VideoPlatform)
    if (!videoId) return null

    switch (highlight.platform) {
      case 'YOUTUBE':
        return getYouTubeThumbnail(videoId, 'hqdefault')
      case 'VIMEO':
        return getVimeoThumbnail(videoId)
      default:
        return null
    }
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📹 Recente video's
        </h3>
        
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {highlights.map((highlight) => {
            const thumbnailUrl = getThumbnailUrl(highlight)
            
            return (
              <button
                key={highlight.id}
                onClick={() => openHighlight(highlight)}
                className="flex-shrink-0 w-24 h-24 rounded-full border-2 border-blue-500 p-1 hover:border-blue-600 transition-colors"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={highlight.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {highlight.platform === VideoPlatform.YOUTUBE ? '📺' : '🎬'}
                    </div>
                  )}
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-gray-800 border-y-[4px] border-y-transparent ml-0.5"></div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>
              {selectedHighlight?.title || 'Video'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedHighlight && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={getVideoEmbedUrl(
                    selectedHighlight.platform as VideoPlatform,
                    extractVideoId(selectedHighlight.videoUrl, selectedHighlight.platform as VideoPlatform) || ''
                  )}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {selectedHighlight.transcript && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Beschrijving</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedHighlight.transcript}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Geplaatst op {new Date(selectedHighlight.createdAt).toLocaleDateString('nl-BE')}
                </span>
                <span>
                  Verloopt op {new Date(selectedHighlight.expiresAt).toLocaleDateString('nl-BE')}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function extractVideoId(url: string, platform: VideoPlatform): string | null {
  switch (platform) {
    case VideoPlatform.YOUTUBE: {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
      }
      return null
    }
    
    case VideoPlatform.VIMEO: {
      const patterns = [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
      }
      return null
    }
    
    default:
      return null
  }
}




