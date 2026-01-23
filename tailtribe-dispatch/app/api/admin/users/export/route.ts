import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const toCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [owners, caregivers] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'OWNER' },
      include: { ownerProfile: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'CAREGIVER' },
      include: { caregiverProfile: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const rows: string[][] = [
    [
      'Rol',
      'Naam',
      'E-mail',
      'Telefoon',
      'Aangemaakt op',
      'Adres',
      'Stad',
      'Postcode',
      'Provincie',
      'Huisdier info',
      'Bedrijfsnaam',
      'BTW-nummer',
      'Zelfstandig',
      'Verzekering',
      'Verzekeraar',
      'Polisnummer',
      'Diensten',
      'Werkregio’s',
    ],
  ]

  owners.forEach((owner) => {
    rows.push([
      'OWNER',
      `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() || owner.email,
      owner.email,
      owner.phone ?? '',
      owner.createdAt.toISOString(),
      owner.ownerProfile?.address ?? '',
      owner.ownerProfile?.city ?? '',
      owner.ownerProfile?.postalCode ?? '',
      owner.ownerProfile?.region ?? '',
      owner.ownerProfile?.petsInfo ?? '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ])
  })

  caregivers.forEach((caregiver) => {
    let services: string[] = []
    let workRegions: string[] = []
    try {
      services = JSON.parse(caregiver.caregiverProfile?.services || '[]')
      if (!Array.isArray(services)) services = []
    } catch {
      services = []
    }
    try {
      workRegions = JSON.parse(caregiver.caregiverProfile?.workRegions || '[]')
      if (!Array.isArray(workRegions)) workRegions = []
    } catch {
      workRegions = []
    }

    rows.push([
      'CAREGIVER',
      `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email,
      caregiver.email,
      caregiver.phone ?? '',
      caregiver.createdAt.toISOString(),
      '',
      caregiver.caregiverProfile?.city ?? '',
      caregiver.caregiverProfile?.postalCode ?? '',
      caregiver.caregiverProfile?.region ?? '',
      '',
      caregiver.caregiverProfile?.companyName ?? '',
      caregiver.caregiverProfile?.enterpriseNumber ?? '',
      caregiver.caregiverProfile?.isSelfEmployed ? 'Ja' : 'Nee',
      caregiver.caregiverProfile?.hasLiabilityInsurance ? 'Ja' : 'Nee',
      caregiver.caregiverProfile?.liabilityInsuranceCompany ?? '',
      caregiver.caregiverProfile?.liabilityInsurancePolicyNumber ?? '',
      services.join(', '),
      workRegions.join(', '),
    ])
  })

  const csv = rows.map((row) => row.map((cell) => toCsvValue(String(cell ?? ''))).join(',')).join('\n')
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="profielen-export.csv"',
    },
  })
}
