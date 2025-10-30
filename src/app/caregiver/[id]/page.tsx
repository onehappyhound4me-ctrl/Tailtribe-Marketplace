import { notFound } from 'next/navigation'
import Link from 'next/link'
// Using plain anchor to ensure visibility without client boundaries
import { db } from '@/lib/db'
import { BookingButton } from '@/components/caregiver/BookingButton'
import { serviceLabels } from '@/lib/types'

interface Props {
  params: { id: string }
}

export default async function CaregiverProfilePage({ params }: Props) {
  const id = params.id
  const caregiver = await db.caregiverProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } }
    },
  })

  if (!caregiver) {
    return notFound()
  }

  let services: string[] = []
  let photos: string[] = []
  try { services = caregiver.services ? caregiver.services.split(',') : [] } catch {}
  try { photos = JSON.parse(caregiver.photos || '[]') } catch {}

  const avgRating = 0 // TODO: Calculate from reviews

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        <div className="card-tt p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              {photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[0]} alt={caregiver.user?.name || 'Verzorger'} className="w-full aspect-square object-cover rounded-2xl border border-black/5" />
              ) : (
                <div className="w-full aspect-square rounded-2xl bg-accent/10 border border-black/5 flex items-center justify-center text-brand text-3xl font-semibold">
                  {(caregiver.user?.name || 'V').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-semibold mb-1 text-foreground">{caregiver.user?.name || 'Verzorger'}</h1>
              <div className="text-sm text-muted-foreground mb-2">📍 {caregiver.city}</div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">{avgRating}</span>
                <span className="text-xs text-muted-foreground">(0 reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{caregiver.bio || 'Geen bio beschikbaar.'}</p>

              {services.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-foreground mb-2">Diensten</h2>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <span key={s} className="chip-accent">{serviceLabels[s as keyof typeof serviceLabels] || s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="text-gray-700 font-semibold text-xl mb-4">€{caregiver.hourlyRate}/uur</div>
                <BookingButton 
                  caregiverId={caregiver.userId}
                  caregiverName={caregiver.user?.name || 'deze verzorger'}
                  hourlyRate={caregiver.hourlyRate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action bar lower on the page for better visual balance */}
        <div className="mt-6 flex items-center justify-end">
          <a
            href="/dashboard"
            aria-label="Dashboard"
            className="inline-flex items-center justify-center text-sm px-5 py-2 rounded-tt bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}


