import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
    const file = formData.get('photo') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Geen foto geselecteerd' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingen zijn toegestaan' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Afbeelding mag maximaal 5MB zijn' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'tailtribe/profile-photos',
          public_id: `${session.user.id}_${Date.now()}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    }) as any

    const imageUrl = uploadResult.secure_url

    // Update user image
    await db.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    // Also update caregiver profile photo if user is a caregiver
    const caregiverProfile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (caregiverProfile) {
      await db.caregiverProfile.update({
        where: { userId: session.user.id },
        data: { profilePhoto: imageUrl }
      })
    }

    return NextResponse.json({
      url: imageUrl,
      message: 'Foto succesvol geüpload'
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden bij uploaden' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'




