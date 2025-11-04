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

    // Validatie: bestandstype
    if (!file.type.startsWith('image/')) {
      toast.error('Alleen afbeeldingen zijn toegestaan')
      try { (e.target as HTMLInputElement).value = '' } catch {}
      return
    }

    // Validatie: bestandsgrootte
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      toast.error(`Foto is te groot (${fileSizeMB}MB). Maximum is 5MB. Probeer een kleinere foto of comprimeer deze eerst.`)
      try { (e.target as HTMLInputElement).value = '' } catch {}
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload with timeout
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const res = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload mislukt' }))
        throw new Error(data.error || 'Upload mislukt')
      }

      const data = await res.json()
      toast.success('Foto geüpload!')
      
      if (onUploadComplete) {
        onUploadComplete(data.url)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Upload timeout - probeer opnieuw of gebruik een kleinere foto')
      } else {
        toast.error(error.message || 'Fout bij uploaden')
      }
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




