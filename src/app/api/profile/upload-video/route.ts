import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary is niet geconfigureerd. Voeg CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY en CLOUDINARY_API_SECRET toe aan environment variables.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Geen video geselecteerd' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Alleen video bestanden zijn toegestaan' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video mag maximaal 100MB zijn' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudinary as video
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'tailtribe/videos',
          public_id: `${session.user.id}_${Date.now()}`,
          overwrite: true,
          resource_type: 'video',
          chunk_size: 6000000, // 6MB chunks for better upload
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    }) as any

    // Return video URL and embed URL
    return NextResponse.json({
      url: uploadResult.secure_url,
      embedUrl: uploadResult.secure_url.replace('/upload/', '/upload/so_0/'),
      publicId: uploadResult.public_id,
      duration: uploadResult.duration,
      message: 'Video succesvol geüpload'
    })

  } catch (error: any) {
    console.error('Upload video error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden bij uploaden' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


