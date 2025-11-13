import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caregiver = await db.caregiverProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    if (!caregiver || !caregiver.isApproved) {
      return NextResponse.json(
        { error: 'Verzorger niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(caregiver)
  } catch (error) {
    console.error('Error fetching caregiver:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
