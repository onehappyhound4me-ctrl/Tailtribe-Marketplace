'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createHighlightSchema, type CreateHighlightInput } from '@/schemas/story-highlights'
import { toast } from 'sonner'

interface AddHighlightDialogProps {
  caregiverId: string
  activeCount: number
  maxHighlights?: number
}

export function AddHighlightDialog({ 
  caregiverId, 
  activeCount, 
  maxHighlights = 3 
}: AddHighlightDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateHighlightInput>({
    videoUrl: '',
    title: '',
    transcript: '',
    expiresInDays: 14
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = createHighlightSchema.parse(formData)

      const response = await fetch('/api/story-highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validatedData,
          caregiverId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Er ging iets mis')
      }

      toast.success('Video highlight toegevoegd!')
      setIsOpen(false)
      setFormData({
        videoUrl: '',
        title: '',
        transcript: '',
        expiresInDays: 14
      })
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Er ging iets mis bij het toevoegen van de highlight')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateHighlightInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const isAtLimit = activeCount >= maxHighlights

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isAtLimit}
          className="w-full"
        >
          {isAtLimit ? `Maximum ${maxHighlights} highlights bereikt` : 'Video toevoegen'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Video Highlight Toevoegen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=... of https://vimeo.com/..."
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              className={errors.videoUrl ? 'border-red-500' : ''}
            />
            {errors.videoUrl && (
              <p className="text-sm text-red-600 mt-1">{errors.videoUrl}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Alleen YouTube en Vimeo links zijn toegestaan
            </p>
          </div>

          <div>
            <Label htmlFor="title">Titel (optioneel)</Label>
            <Input
              id="title"
              placeholder="Beschrijvende titel voor je video"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title?.length || 0}/100 karakters
            </p>
          </div>

          <div>
            <Label htmlFor="transcript">Beschrijving (optioneel)</Label>
            <Textarea
              id="transcript"
              placeholder="Beschrijf wat er in de video te zien is. Dit helpt met vindbaarheid."
              value={formData.transcript}
              onChange={(e) => handleInputChange('transcript', e.target.value)}
              maxLength={2000}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.transcript?.length || 0}/2000 karakters
            </p>
          </div>

          <div>
            <Label htmlFor="expiresInDays">Verloopt na (dagen)</Label>
            <Input
              id="expiresInDays"
              type="number"
              min={1}
              max={30}
              value={formData.expiresInDays}
              onChange={(e) => handleInputChange('expiresInDays', parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Video wordt automatisch verborgen na deze periode (1-30 dagen)
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">💡 Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maximaal {maxHighlights} actieve highlights tegelijk</li>
              <li>• Video's verlopen automatisch om kosten te besparen</li>
              <li>• Beschrijvingen blijven zichtbaar voor SEO</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.videoUrl.trim()}
            >
              {isLoading ? 'Bezig...' : 'Toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}





