import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DISPATCH_SERVICES } from '@/lib/services'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const runtime = 'nodejs'

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  try {
    const v = JSON.parse(raw || '')
    return (v as T) ?? fallback
  } catch {
    return fallback
  }
}

function serviceLabel(id: string) {
  return DISPATCH_SERVICES.find((s) => s.id === id)?.name ?? id
}

export default async function OwnerCaregiverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || session.user?.role !== 'OWNER') {
    redirect('/login')
  }

  const { id } = await params

  // Only allow showing caregivers that were actually offered to this owner at least once.
  const hasOffer = await prisma.bookingOffer.findFirst({
    where: { caregiverId: id, booking: { ownerId: session.user.id } },
    select: { id: true },
  })
  if (!hasOffer) {
    redirect('/dashboard/owner/bookings')
  }

  const caregiver = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      caregiverProfile: {
        select: {
          city: true,
          postalCode: true,
          region: true,
          services: true,
          experience: true,
          bio: true,
          companyName: true,
          enterpriseNumber: true,
          isSelfEmployed: true,
          hasLiabilityInsurance: true,
          liabilityInsuranceCompany: true,
          liabilityInsurancePolicyNumber: true,
        },
      },
    },
  })

  if (!caregiver || !caregiver.caregiverProfile) {
    redirect('/dashboard/owner/bookings')
  }

  const name =
    `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email
  const services = safeJsonParse<string[]>(caregiver.caregiverProfile.services, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/owner" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link href="/dashboard/owner" className="text-sm font-semibold text-emerald-700 hover:underline">
              ← Terug naar dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <div className="mt-1 text-sm text-gray-600">
              {caregiver.caregiverProfile.city ? caregiver.caregiverProfile.city : 'Locatie onbekend'}
              {caregiver.caregiverProfile.postalCode ? ` (${caregiver.caregiverProfile.postalCode})` : ''}
              {caregiver.caregiverProfile.region ? ` • ${caregiver.caregiverProfile.region}` : ''}
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs text-gray-500">Contact</div>
                <div className="font-semibold text-gray-900">{caregiver.email}</div>
                {caregiver.phone ? <div className="text-gray-700">{caregiver.phone}</div> : null}
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs text-gray-500">Zakelijk</div>
                <div className="text-gray-900">
                  {caregiver.caregiverProfile.isSelfEmployed ? 'Zelfstandig' : 'Niet zelfstandig'}
                </div>
                <div className="text-gray-700">
                  {caregiver.caregiverProfile.companyName ? caregiver.caregiverProfile.companyName : 'Bedrijf: —'}
                </div>
                <div className="text-gray-700">
                  {caregiver.caregiverProfile.enterpriseNumber
                    ? `BTW: ${caregiver.caregiverProfile.enterpriseNumber}`
                    : 'BTW: —'}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">Diensten</div>
              <div className="mt-1 text-gray-900">
                {services.length > 0 ? services.map(serviceLabel).join(' • ') : '—'}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">BA-verzekering</div>
              <div className="mt-1 text-gray-900">
                {caregiver.caregiverProfile.hasLiabilityInsurance ? 'Ja' : 'Nee'}
              </div>
              {caregiver.caregiverProfile.liabilityInsuranceCompany ? (
                <div className="text-gray-700">Verzekeraar: {caregiver.caregiverProfile.liabilityInsuranceCompany}</div>
              ) : null}
              {caregiver.caregiverProfile.liabilityInsurancePolicyNumber ? (
                <div className="text-gray-700">
                  Polis: {caregiver.caregiverProfile.liabilityInsurancePolicyNumber}
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">Ervaring</div>
              <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
                {caregiver.caregiverProfile.experience?.trim() || '—'}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">Bio</div>
              <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
                {caregiver.caregiverProfile.bio?.trim() || '—'}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

