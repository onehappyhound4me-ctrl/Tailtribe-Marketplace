import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifyAdminNewCaregiverProfile } from '@/lib/email-notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const { profile, services, badges, payout } = body

    console.log('📥 Received onboarding data:', {
      profile: profile ? 'Present' : 'Missing',
      services: services ? 'Present' : 'Missing', 
      badges: badges ? 'Present' : 'Missing',
      payout: payout ? 'Present' : 'Missing'
    })
    
    // Debug: Log detailed data
    console.log('🔍 Profile data:', profile)
    console.log('🔍 Services data:', services)
    console.log('🔍 Badges data:', badges)
    console.log('🔍 Payout data:', payout)

    // Validate required profile fields
    // Profile photo is optional - can be added later
    if (!profile.firstName || !profile.lastName) {
      console.error('❌ Missing name fields')
      return NextResponse.json({ error: 'Voornaam en achternaam zijn verplicht' }, { status: 400 })
    }

    if (!profile.city || !profile.postalCode) {
      console.error('❌ Missing location fields')
      return NextResponse.json({ error: 'Stad en postcode zijn verplicht' }, { status: 400 })
    }

    // Validate services
    if (!services.services || services.services.length === 0) {
      console.error('❌ Missing services:', services.services)
      return NextResponse.json({ error: 'Selecteer minimaal 1 dienst' }, { status: 400 })
    }

    // Validate payout
    if (!payout.iban || !payout.accountHolder) {
      console.error('❌ Missing payout data:', payout)
      return NextResponse.json({ error: 'IBAN en rekeninghouder zijn verplicht' }, { status: 400 })
    }

    // Use the profile photo URL directly (optional - can be null)
    const profilePhotoUrl = profile.profilePhoto || null

    // Check if user already has a caregiver profile
    const existingProfile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      return NextResponse.json({ error: 'Je hebt al een verzorger profiel' }, { status: 400 })
    }

    // Prepare insurance data if provided
    let insuranceData = null
    if (badges.hasInsurance) {
      insuranceData = JSON.stringify({
        provider: badges.insuranceProvider,
        policyNumber: badges.insurancePolicyNumber,
        expiryDate: badges.insuranceExpiryDate,
        fileUrl: badges.insuranceFile || null
      })
    }

    // Prepare certificates array for all badges
    const certificatesArray = []
    
    if (badges.animalCareDiploma) {
      certificatesArray.push({ type: 'ANIMAL_CARE_DIPLOMA', fileUrl: badges.animalCareDiploma, verified: false })
    }
    if (badges.dogTrainerCertificate) {
      certificatesArray.push({ type: 'DOG_TRAINER', fileUrl: badges.dogTrainerCertificate, verified: false })
    }
    if (badges.behaviorSpecialistCertificate) {
      certificatesArray.push({ type: 'BEHAVIOR_SPECIALIST', fileUrl: badges.behaviorSpecialistCertificate, verified: false })
    }
    if (badges.animalFirstAidCertificate) {
      certificatesArray.push({ type: 'ANIMAL_FIRST_AID', fileUrl: badges.animalFirstAidCertificate, verified: false })
    }
    if (badges.horseExperienceProof) {
      certificatesArray.push({ type: 'HORSE_EXPERIENCE', fileUrl: badges.horseExperienceProof, verified: false })
    }
    if (badges.hygieneCertificate) {
      certificatesArray.push({ type: 'HYGIENE_TRAINING', fileUrl: badges.hygieneCertificate, verified: false })
    }
    if (badges.transportProof) {
      certificatesArray.push({ type: 'SAFE_TRANSPORT', fileUrl: badges.transportProof, verified: false })
    }
    if (badges.groomingCertificate) {
      certificatesArray.push({ type: 'GROOMING', fileUrl: badges.groomingCertificate, verified: false })
    }
    if (badges.physiotherapyCertificate) {
      certificatesArray.push({ type: 'PHYSIOTHERAPY', fileUrl: badges.physiotherapyCertificate, verified: false })
    }
    if (badges.nutritionCertificate) {
      certificatesArray.push({ type: 'NUTRITION', fileUrl: badges.nutritionCertificate, verified: false })
    }
    if (badges.noseworkCertificate) {
      certificatesArray.push({ type: 'NOSEWORK', fileUrl: badges.noseworkCertificate, verified: false })
    }
    if (badges.puppySocializationPlan) {
      certificatesArray.push({ type: 'PUPPY_SOCIALIZATION', fileUrl: badges.puppySocializationPlan, verified: false })
    }
    if (badges.sportEnrichmentProof) {
      certificatesArray.push({ type: 'SPORT_ENRICHMENT', fileUrl: badges.sportEnrichmentProof, verified: false })
    }
    if (badges.eventCompanionReferences) {
      certificatesArray.push({ type: 'EVENT_COMPANION', fileUrl: badges.eventCompanionReferences, verified: false })
    }
    
    const certificatesData = certificatesArray.length > 0 ? JSON.stringify(certificatesArray) : null

    // Calculate average hourly rate from servicePrices
    const avgHourlyRate = services.servicePrices 
      ? Math.round(Object.values(services.servicePrices as Record<string, string>).reduce((a: number, b: string) => a + parseInt(b), 0) / Object.keys(services.servicePrices).length)
      : 25

    // Update user name and image if provided
    if (profile.firstName && profile.lastName) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          name: `${profile.firstName} ${profile.lastName}`,
          image: profilePhotoUrl
        }
      })
    } else if (profilePhotoUrl) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          image: profilePhotoUrl
        }
      })
    }

    // Create caregiver profile with all data
    const caregiverProfile = await db.caregiverProfile.create({
      data: {
        userId: session.user.id,
        
        // Profile
        city: profile.city,
        postalCode: profile.postalCode,
        country: profile.country,
        actionRadius: parseInt(profile.actionRadius),
        bio: profile.bio,
        profilePhoto: profilePhotoUrl,
        
        // Services & Capacity
        services: JSON.stringify(services.services),
        animalTypes: JSON.stringify(services.animalTypes),
        customAnimalTypes: services.customAnimalTypes || null,
        animalSizes: JSON.stringify(services.animalSizes),
        maxAnimalsAtOnce: parseInt(services.maxAnimalsAtOnce),
        servicePrices: JSON.stringify(services.servicePrices),
        hourlyRate: avgHourlyRate, // Use average of servicePrices
        
        // Availability (keep for backwards compatibility but deprecated)
        availabilityData: JSON.stringify({
          days: [],
          times: []
        }),
        cancellationPolicy: 'STANDARD', // Uniform platform beleid (FAQ: 1 dag + 12:00 = 100%, later = 50%)
        
        // Badges
        insurance: insuranceData,
        firstAid: badges.hasFirstAid || false,
        businessNumber: badges.businessNumber || null,
        vatNumber: badges.vatNumber || null,
        certificates: certificatesData,
        
        // Payout
        iban: payout.iban,
        accountHolder: payout.accountHolder,
        commissionAgreed: true, // Automatisch akkoord (geen aparte checkbox meer)
        platformRulesAgreed: payout.platformRulesAgreed,
        
        // Admin approval required
        isApproved: false
      }
    })

    console.log('✅ Caregiver profile created:', {
      id: caregiverProfile.id,
      profilePhoto: caregiverProfile.profilePhoto,
      services: caregiverProfile.services,
      vatNumber: caregiverProfile.vatNumber,
      businessNumber: caregiverProfile.businessNumber,
      hourlyRate: caregiverProfile.hourlyRate
    })

    // Create Availability record with empty weekly schedule (caregivers will set this in dashboard)
    const weeklySchedule: Record<string, Array<{start: string; end: string}>> = {}

    await db.availability.create({
      data: {
        caregiverId: caregiverProfile.id,
        weeklyJson: JSON.stringify(weeklySchedule),
        exceptions: JSON.stringify({})
      }
    })

    // Send admin notification (async, don't block)
    notifyAdminNewCaregiverProfile({
      caregiverName: session.user.name || 'Nieuwe verzorger',
      caregiverEmail: session.user.email || '',
      city: profile.city,
      services: services.services,
      profileId: caregiverProfile.id
    }).catch(err => console.error('Failed to send admin notification:', err))

    return NextResponse.json({ 
      success: true,
      message: 'Profiel aangemaakt! Wacht op goedkeuring.'
    })

  } catch (error: any) {
    console.error('Caregiver onboarding error:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json({ 
      error: 'Er ging iets mis', 
      details: error.message 
    }, { status: 500 })
  }
}






















