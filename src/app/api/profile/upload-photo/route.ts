import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
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

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.type.split('/')[1]
    const filename = `${nanoid()}.${ext}`
    
    // Save to public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    const imageUrl = `/uploads/${filename}`

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
      { error: 'Er is een fout opgetreden bij uploaden' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'




