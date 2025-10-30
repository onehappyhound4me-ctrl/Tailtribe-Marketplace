'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PhotoUploadProps {
  currentImage?: string | null
  onUploadComplete?: (url: string) => void
}

export function PhotoUpload({ currentImage, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Alleen afbeeldingen zijn toegestaan')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Afbeelding mag maximaal 5MB zijn')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const res = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const data = await res.json()
      toast.success('Foto geüpload!')
      
      if (onUploadComplete) {
        onUploadComplete(data.url)
      }
    } catch (error: any) {
      toast.error(error.message || 'Fout bij uploaden')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Profielfoto</label>
      
      {/* Preview */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {preview ? (
            <Image
              src={preview}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
              👤
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <label htmlFor="photo-upload">
            <Button
              type="button"
              disabled={uploading}
              className="cursor-pointer bg-green-600 hover:bg-green-700"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploaden...
                </span>
              ) : (
                'Kies foto'
              )}
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG of GIF. Max 5MB.
          </p>
        </div>
      </div>
    </div>
  )
}




