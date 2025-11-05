export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const mode = searchParams.get('mode') || 'received' // 'received' or 'given'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is verplicht' },
        { status: 400 }
      )
    }

    let reviews

    if (mode === 'received') {
      // Get reviews where user is the reviewee (received reviews)
      reviews = await db.review.findMany({
        where: {
          revieweeId: userId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          reviewee: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Get reviews where user is the author (given reviews)
      reviews = await db.review.findMany({
        where: {
          authorId: userId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          reviewee: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    // Map reviews to ensure all fields are present
    reviews = reviews.map(review => ({
      ...review,
      comment: review.comment || ''
    }))

    return NextResponse.json({ reviews })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
