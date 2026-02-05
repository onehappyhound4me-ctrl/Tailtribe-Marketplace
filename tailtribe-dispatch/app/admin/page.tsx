'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SERVICE_LABELS } from '@/lib/services'
// Use relative import to avoid path-alias resolution issues in some Vercel build configurations.
import { getStatusLabel } from '../../lib/status-labels'

type StatusFilter = 'ALL' | 'UNASSIGNED' | 'ASSIGNED'
type BookingStatus = StatusFilter | string

type Booking = {
  id: string
  ownerId?: string
  service: string
  date: string
  time?: string | null
  timeWindow: string
  city: string
  postalCode: string
  region?: string | null
  petName: string
  petType: string
  status: BookingStatus
  caregiverId?: string | null
  caregiverName?: string | null
  assignedTo?: string | null
  ownerName: string
  ownerEmail: string
  ownerPhone?: string | null
  ownerAddress?: string | null
  ownerCity?: string | null
  ownerPostalCode?: string | null
  ownerRegion?: string | null
  ownerPetsInfo?: string | null
  adminNotes?: string | null
  createdAt: string
}

type OwnerProfileOverview = {
  id: string
  name: string
  email: string
  phone?: string | null
  createdAt: string
  profile: {
    address?: string | null
    city?: string | null
    postalCode?: string | null
    region?: string | null
    petsInfo?: string | null
  }
}

type CaregiverProfileOverview = {
  id: string
  name: string
  email: string
  phone?: string | null
  createdAt: string
  profile: {
    city?: string | null
    postalCode?: string | null
    region?: string | null
    workRegions?: string[]
    services?: string[]
    companyName?: string | null
    enterpriseNumber?: string | null
    isSelfEmployed?: boolean | null
    hasLiabilityInsurance?: boolean | null
    liabilityInsuranceCompany?: string | null
    liabilityInsurancePolicyNumber?: string | null
    isApproved?: boolean | null
    isActive?: boolean | null
  }
}

type CaregiverApplication = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  companyName?: string
  enterpriseNumber?: string
  isSelfEmployed: boolean
  hasLiabilityInsurance: boolean
  liabilityInsuranceCompany?: string
  liabilityInsurancePolicyNumber?: string
  services: string[]
  experience: string
  message?: string
  createdAt: string
  updatedAt: string
}

type InvoiceDraft = {
  id: string
  status: string
  commissionPercent?: number | null
  createdAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  items: {
    id: string
    bookingId?: string | null
    service: string
    serviceLabel: string
    serviceDate: string
    quantity: number
    unitPriceCents: number
  }[]
}

type Caregiver = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  city: string
  postalCode: string
  region?: string | null
  workRegions?: string[]
  services?: string[]
  servicePricing?: Record<string, { unit: string; priceCents: number }>
  companyName?: string | null
  enterpriseNumber?: string | null
  isSelfEmployed?: boolean
  hasLiabilityInsurance?: boolean
  liabilityInsuranceCompany?: string | null
  liabilityInsurancePolicyNumber?: string | null
  maxDistance?: number | null
  experience?: string
  bio?: string
  createdAt: string
  availability?: { date: string; timeWindow: string }[]
  hasMatch?: boolean
  matchReasons?: string[]
  matchWarnings?: string[]
}

type RequestSummary = {
  id: string
  owner: {
    id: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    region?: string | null
    petsInfo?: string | null
  }
  service: string
  city: string
  postalCode: string
  region?: string | null
  address?: string | null
  status: string
  createdAt: string
  occurrences: RequestOccurrence[]
}

type RequestOccurrence = {
  id: string
  scheduledDate: string
  timeWindow: string
  time?: string | null
  status: string
  assignedCaregiverId?: string | null
  assignedCaregiverName?: string | null
  adminNotes?: string | null
  eligibleCaregivers: {
    id: string
    name: string
    score: number
    reasons: string[]
  }[]
}

type OwnerItem = {
  id: string
  type: 'BOOKING' | 'REQUEST'
  ownerId?: string
  service: string
  status: string
  date: string
  time?: string | null
  timeWindow?: string | null
  city: string
  postalCode: string
  region?: string | null
  ownerName: string
  ownerEmail?: string
  ownerPhone?: string | null
  ownerAddress?: string | null
  ownerCity?: string | null
  ownerPostalCode?: string | null
  ownerRegion?: string | null
  ownerPetsInfo?: string | null
  petSummary?: string
  recurringInfo?: string | null
  requestId?: string
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Alle' },
  { value: 'UNASSIGNED', label: 'Nog niet toegewezen' },
  { value: 'ASSIGNED', label: 'Toegewezen' },
]

const UNASSIGNED_STATUSES = new Set(['PENDING', 'UNASSIGNED', 'PENDING_ADMIN', 'NEW'])
const ASSIGNED_STATUSES = new Set(['ASSIGNED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'ISSUE', 'CANCELLED'])

const timeWindowLabels: Record<string, string> = {
  MORNING: 'Ochtend (07:00 - 12:00)',
  AFTERNOON: 'Middag (12:00 - 18:00)',
  EVENING: 'Avond (18:00 - 22:00)',
  NIGHT: 'Nacht (22:00 - 07:00)',
}

const serviceLabel = (svc: string) => SERVICE_LABELS[svc as keyof typeof SERVICE_LABELS] ?? svc
const formatEuro = (cents: number) =>
  `€ ${(cents / 100).toFixed(2).replace('.', ',')}`

const UNIT_LABELS: Record<string, string> = {
  HALF_HOUR: 'per half uur',
  HOUR: 'per uur',
  HALF_DAY: 'per halve dag',
  DAY: 'per dag',
}

const formatPricingLines = (
  services?: string[],
  pricing?: Record<string, { unit: string; priceCents: number }>
) => {
  if (!services || services.length === 0) return 'Geen diensten'
  return services
    .map((serviceId) => {
      const entry = pricing?.[serviceId]
      if (!entry || !entry.priceCents) {
        return `${serviceLabel(serviceId)}: niet ingesteld`
      }
      const unitLabel = UNIT_LABELS[entry.unit] ?? entry.unit
      return `${serviceLabel(serviceId)}: ${formatEuro(entry.priceCents)} ${unitLabel}`
    })
    .join(' • ')
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [ownerProfiles, setOwnerProfiles] = useState<OwnerProfileOverview[]>([])
  const [caregiverProfiles, setCaregiverProfiles] = useState<CaregiverProfileOverview[]>([])
  const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[]>([])
  const [caregiverApplications, setCaregiverApplications] = useState<CaregiverApplication[]>([])

  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const [selectedOwnerType, setSelectedOwnerType] = useState<'BOOKING' | 'REQUEST' | null>(null)
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [profilesLoaded, setProfilesLoaded] = useState(false)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [profilesExporting, setProfilesExporting] = useState(false)
  const [applicationsLoaded, setApplicationsLoaded] = useState(false)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationApproveLoadingId, setApplicationApproveLoadingId] = useState<string | null>(null)
  const [lastApprovedCreds, setLastApprovedCreds] = useState<{ email: string; password: string } | null>(null)
  const [invoicesLoaded, setInvoicesLoaded] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'assign' | 'delete' | 'anonymize' | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [impersonateLoadingId, setImpersonateLoadingId] = useState<string | null>(null)
  const [bulkOfferLoading, setBulkOfferLoading] = useState(false)

  const [invoiceSelection, setInvoiceSelection] = useState<Record<string, boolean>>({})
  const [invoiceQuantities, setInvoiceQuantities] = useState<Record<string, number>>({})
  const [invoicePrices, setInvoicePrices] = useState<Record<string, string>>({})
  const [commissionPercent, setCommissionPercent] = useState<string>('0')
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [cleanupDays, setCleanupDays] = useState('30')
  const [cleanupLoading, setCleanupLoading] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [serviceFilter, setServiceFilter] = useState('ALL')
  const [regionFilter, setRegionFilter] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'next7' | 'custom'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const load = async (options?: { includeProfiles?: boolean; includeInvoices?: boolean }) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const [bRes, cRes, rRes] = await Promise.all([
        fetch('/api/admin/bookings', { cache: 'no-store' }),
        fetch('/api/admin/caregivers', { cache: 'no-store' }),
        fetch('/api/admin/requests', { cache: 'no-store' }),
      ])
      if (!bRes.ok) throw new Error('Bookings fetch failed')
      const bJson = (await bRes.json()) as Booking[]
      const bSorted = [...bJson].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setBookings(bSorted)

      if (cRes.ok) {
        const cJson = (await cRes.json()) as Caregiver[]
        const cSorted = [...cJson].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setCaregivers(cSorted)
      } else {
        setCaregivers([])
      }

      if (rRes.ok) {
        const rJson = (await rRes.json()) as RequestSummary[]
        const rSorted = [...rJson].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRequests(rSorted)
      } else {
        setRequests([])
      }

      if (options?.includeProfiles) {
        await loadProfiles()
      }
      if (options?.includeInvoices) {
        await loadInvoices()
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon data niet laden. Ben je ingelogd als beheerder?')
    } finally {
      setLoading(false)
    }
  }

  const loadProfiles = async () => {
    if (profilesLoading) return
    setProfilesLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!res.ok) throw new Error('Users fetch failed')
      const data = (await res.json()) as { owners: OwnerProfileOverview[]; caregivers: CaregiverProfileOverview[] }
      setOwnerProfiles(data.owners ?? [])
      setCaregiverProfiles(data.caregivers ?? [])
      setProfilesLoaded(true)
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon profielen niet laden. Probeer opnieuw.')
    } finally {
      setProfilesLoading(false)
    }
  }

  const loadCaregiverApplications = async () => {
    if (applicationsLoading) return
    setApplicationsLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/caregiver-applications', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const msg = [
          data?.error || 'Caregiver applications fetch failed',
          typeof data?.detail === 'string' ? `Detail: ${data.detail}` : null,
          typeof data?.hint === 'string' ? `Tip: ${data.hint}` : null,
        ]
          .filter(Boolean)
          .join(' • ')
        throw new Error(msg)
      }
      const data = (await res.json()) as CaregiverApplication[]
      const sorted = [...(data ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setCaregiverApplications(sorted)
      setApplicationsLoaded(true)
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon aanmeldingen van verzorgers niet laden. Ben je ingelogd als beheerder?')
    } finally {
      setApplicationsLoading(false)
    }
  }

  const approveCaregiverApplication = async (id: string) => {
    const app = caregiverApplications.find((a) => a.id === id)
    const label = app ? `${app.firstName} ${app.lastName}`.trim() : 'deze aanmelding'
    if (!window.confirm(`Deze aanmelding goedkeuren en een verzorger-account aanmaken voor ${label}?`)) return

    setApplicationApproveLoadingId(id)
    setErrorMsg(null)
    setSuccessMsg(null)
    setLastApprovedCreds(null)
    try {
      const res = await fetch('/api/admin/caregiver-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Kon aanmelding niet goedkeuren.')
      }
      const email = app?.email ?? ''
      const tempPassword = typeof data?.tempPassword === 'string' ? data.tempPassword : ''
      if (email && tempPassword) {
        setLastApprovedCreds({ email, password: tempPassword })
        setSuccessMsg(`Verzorger-account aangemaakt. Login: ${email} • tijdelijk wachtwoord: ${tempPassword}`)
      } else if (email) {
        setSuccessMsg(`Verzorger-account aangemaakt. Login: ${email} (bestaand account: geen nieuw wachtwoord).`)
      } else {
        setSuccessMsg('Verzorger-account aangemaakt.')
      }
      // Refresh lists
      await loadCaregiverApplications()
      await load()
      await loadProfiles()
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon aanmelding niet goedkeuren.')
    } finally {
      setApplicationApproveLoadingId(null)
    }
  }

  const loadInvoices = async () => {
    if (invoicesLoading) return
    setInvoicesLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/invoices', { cache: 'no-store' })
      if (!res.ok) throw new Error('Invoices fetch failed')
      const data = (await res.json()) as InvoiceDraft[]
      setInvoiceDrafts(data)
      setInvoicesLoaded(true)
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon factuurconcepten niet laden. Probeer opnieuw.')
    } finally {
      setInvoicesLoading(false)
    }
  }

  const exportProfilesCsv = async () => {
    if (profilesExporting) return
    setProfilesExporting(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/users/export', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Kon export niet genereren.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `profielen-export-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon export niet genereren.')
    } finally {
      setProfilesExporting(false)
    }
  }

  // Keep initial load one-time without re-running if `load` identity changes.
  const loadRef = useRef(load)
  loadRef.current = load
  useEffect(() => {
    loadRef.current()
  }, [])

  const ownerItems = useMemo<OwnerItem[]>(() => {
    const bookingItems = bookings.map<OwnerItem>((b) => ({
      id: b.id,
      type: 'BOOKING',
      ownerId: (b as any).ownerId,
      service: b.service,
      status: b.status,
      date: b.date,
      time: b.time ?? null,
      timeWindow: b.timeWindow,
      city: b.city,
      postalCode: b.postalCode,
      region: b.region ?? null,
      ownerName: b.ownerName,
      ownerEmail: b.ownerEmail,
      ownerPhone: b.ownerPhone,
      ownerAddress: b.ownerAddress ?? null,
      ownerCity: b.ownerCity ?? null,
      ownerPostalCode: b.ownerPostalCode ?? null,
      ownerRegion: b.ownerRegion ?? null,
      ownerPetsInfo: b.ownerPetsInfo ?? null,
      petSummary: `${b.petName} (${b.petType})`,
    }))

    const requestItems = requests.flatMap<OwnerItem>((r) =>
      r.occurrences.map((occ) => ({
        id: occ.id,
        type: 'REQUEST',
        ownerId: r.owner.id,
        service: r.service,
        status: occ.status,
        date: occ.scheduledDate,
        time: occ.time ?? null,
        timeWindow: occ.timeWindow,
        city: r.city,
        postalCode: r.postalCode,
        region: r.region ?? null,
        ownerName: r.owner.name,
        ownerEmail: r.owner.email,
        ownerPhone: (r.owner as any).phone ?? null,
        ownerAddress: r.owner.address ?? null,
        ownerCity: r.owner.city ?? null,
        ownerPostalCode: r.owner.postalCode ?? null,
        ownerRegion: r.owner.region ?? null,
        ownerPetsInfo: r.owner.petsInfo ?? null,
        petSummary: occ.adminNotes ?? r.service,
        recurringInfo: r.status,
        requestId: r.id,
      }))
    )

    const combined = [...bookingItems, ...requestItems]
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bookings, requests])

  const filteredOwners = useMemo(() => {
    const normalize = (val: string | undefined | null) => (val || '').trim().toUpperCase()
    return ownerItems.filter((item) => {
      const itemStatus = normalize(item.status)
      const wanted = normalize(statusFilter)
      // Status filter simplified: ALL, UNASSIGNED, ASSIGNED
      if (wanted === 'UNASSIGNED') {
        if (!UNASSIGNED_STATUSES.has(itemStatus)) return false
      } else if (wanted === 'ASSIGNED') {
        if (!ASSIGNED_STATUSES.has(itemStatus)) return false
      }
      if (serviceFilter !== 'ALL' && item.service !== serviceFilter) return false
      if (regionFilter) {
        const reg = regionFilter.toLowerCase()
        const regionValue = (item.region ?? '').toLowerCase()
        if (
          !item.city.toLowerCase().includes(reg) &&
          !item.postalCode.toLowerCase().includes(reg) &&
          !regionValue.includes(reg)
        )
          return false
      }
      const itemDate = new Date(item.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dateRange === 'today' && itemDate.getTime() !== today.getTime()) return false
      if (dateRange === 'next7') {
        const max = new Date(today)
        max.setDate(max.getDate() + 7)
        if (itemDate.getTime() < today.getTime() || itemDate.getTime() > max.getTime()) return false
      }
      if (dateRange === 'custom') {
        if (dateFrom && itemDate.getTime() < new Date(dateFrom).getTime()) return false
        if (dateTo && itemDate.getTime() > new Date(dateTo).getTime()) return false
      }
      if (searchTerm) {
        const t = searchTerm.toLowerCase()
        const hay = [
          item.ownerName,
          item.ownerEmail ?? '',
          item.city,
          item.postalCode,
          item.service,
          item.petSummary ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(t)) return false
      }
      return true
    })
  }, [ownerItems, statusFilter, serviceFilter, regionFilter, dateRange, dateFrom, dateTo, searchTerm])

  const selectedOwner = useMemo(() => {
    if (!selectedOwnerId || !selectedOwnerType) return null
    return ownerItems.find((i) => i.id === selectedOwnerId && i.type === selectedOwnerType) ?? null
  }, [ownerItems, selectedOwnerId, selectedOwnerType])

  useEffect(() => {
    if (!selectedOwnerId && ownerItems.length > 0) {
      setSelectedOwnerId(ownerItems[0].id)
      setSelectedOwnerType(ownerItems[0].type)
    }
  }, [ownerItems, selectedOwnerId, selectedOwnerType])

  // When filtering changes, ensure selection is still valid
  useEffect(() => {
    if (!selectedOwner) {
      if (filteredOwners.length > 0) {
        setSelectedOwnerId(filteredOwners[0].id)
        setSelectedOwnerType(filteredOwners[0].type)
      } else {
        setSelectedOwnerId(null)
        setSelectedOwnerType(null)
      }
    }
  }, [filteredOwners, selectedOwner])

  const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()

  const getMatchDetails = useCallback((cg: Caregiver, owner: OwnerItem | null) => {
    const reasons: string[] = []
    const warnings: string[] = []
    if (!owner) return { hasMatch: false, reasons, warnings }

    const services = (cg.services ?? []).map((s) => s.trim())
    const hasService = owner.service && services.includes(owner.service)
    if (hasService) {
      reasons.push('Dienst klopt')
    } else {
      warnings.push('Dienst niet in profiel')
    }

    const ownerRegion = normalize(owner.region)
    const caregiverRegion = normalize(cg.region)
    const caregiverWorkRegions = (cg.workRegions ?? []).map((r) => normalize(r)).filter(Boolean)
    let regionMatch = false
    if (ownerRegion) {
      regionMatch = caregiverRegion === ownerRegion || caregiverWorkRegions.includes(ownerRegion)
      if (regionMatch) {
        reasons.push('Zelfde provincie')
      } else {
        warnings.push('Andere provincie')
      }
    } else {
      const ownerPc = owner.postalCode?.trim() || ''
      const cgPc = cg.postalCode?.trim() || ''
      regionMatch =
        (ownerPc && cgPc && (ownerPc === cgPc || ownerPc.slice(0, 2) === cgPc.slice(0, 2))) ||
        (!ownerPc && !cgPc)
      if (regionMatch) {
        reasons.push('Regio op postcode')
      } else {
        warnings.push('Regio onbekend')
      }
    }

    const ownerDate = new Date(owner.date).toISOString().slice(0, 10)
    const ownerWindow = owner.timeWindow || null
    const hasAvailability =
      cg.availability?.some((slot) => {
        const slotDate = new Date(slot.date).toISOString().slice(0, 10)
        if (slotDate !== ownerDate) return false
        if (ownerWindow) return slot.timeWindow === ownerWindow
        return true
      }) ?? false
    if (hasAvailability) {
      reasons.push('Beschikbaar op datum/tijd')
    } else {
      warnings.push('Geen beschikbaarheid gevonden')
    }

    return {
      hasMatch: Boolean(hasService && regionMatch && hasAvailability),
      reasons,
      warnings,
    }
  }, [])

  const matchesOwnerSlot = useCallback(
    (cg: Caregiver, owner: OwnerItem | null) => getMatchDetails(cg, owner).hasMatch,
    [getMatchDetails]
  )

  const caregiversWithMatch = useMemo(() => {
    return caregivers
      .map((c) => ({
        ...c,
        ...(selectedOwner
          ? (() => {
              const details = getMatchDetails(c, selectedOwner)
              return {
                hasMatch: details.hasMatch,
                matchReasons: details.reasons,
                matchWarnings: details.warnings,
              }
            })()
          : { hasMatch: false, matchReasons: [], matchWarnings: [] }),
      }))
      .sort((a, b) => {
        if (selectedOwner) {
          if (a.hasMatch && !b.hasMatch) return -1
          if (!a.hasMatch && b.hasMatch) return 1
        }
        return 0
      })
  }, [caregivers, getMatchDetails, selectedOwner])

  const selectedCaregiver = useMemo(() => {
    const direct = caregiversWithMatch.find((c) => c.id === selectedCaregiverId)
    if (direct) return direct
    return caregiversWithMatch[0] ?? null
  }, [caregiversWithMatch, selectedCaregiverId])

  const handleSelectOwner = (item: OwnerItem) => {
    setSelectedOwnerId(item.id)
    setSelectedOwnerType(item.type)
  }

  const deleteOwnerProfile = async (userId: string) => {
    const confirmed = window.confirm('Deze eigenaar verwijderen? Dit verwijdert alle gekoppelde data.')
    if (!confirmed) return
    setActionLoading('delete')
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error('delete failed')
      setSuccessMsg('Eigenaar verwijderd.')
      await loadProfiles()
      await load({ includeProfiles: false, includeInvoices: true })
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon eigenaar niet verwijderen.')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteCaregiverProfile = async (caregiverId: string) => {
    const confirmed = window.confirm('Deze verzorger verwijderen? Dit verwijdert alle gekoppelde data.')
    if (!confirmed) return
    setActionLoading('delete')
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/caregivers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      })
      if (!res.ok) throw new Error('delete failed')
      setSuccessMsg('Verzorger verwijderd.')
      await loadProfiles()
      await load({ includeProfiles: false, includeInvoices: true })
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon verzorger niet verwijderen.')
    } finally {
      setActionLoading(null)
    }
  }

  const anonymizeUser = async (userId: string, label: string) => {
    const confirmed = window.confirm(
      `Deze ${label} anonimiseren? Persoonsgegevens worden verwijderd, maar opdrachten blijven bewaard.`
    )
    if (!confirmed) return
    setActionLoading('anonymize')
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/users/anonymize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Kon gebruiker niet anonimiseren.')
      }
      setSuccessMsg('Profiel geanonimiseerd.')
      await loadProfiles()
      await load({ includeProfiles: false, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon gebruiker niet anonimiseren.')
    } finally {
      setActionLoading(null)
    }
  }

  const startImpersonation = async (userId: string, role: 'OWNER' | 'CAREGIVER') => {
    setImpersonateLoadingId(userId)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Kon niet openen als gebruiker.')
      }
      window.location.href = role === 'OWNER' ? '/dashboard/owner' : '/dashboard/caregiver'
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon niet openen als gebruiker.')
    } finally {
      setImpersonateLoadingId(null)
    }
  }

  const caregiverById = useMemo(() => {
    return new Map(caregivers.map((cg) => [cg.id, cg]))
  }, [caregivers])

  const getSuggestedPriceEntry = useCallback((booking: Booking) => {
    if (!booking.caregiverId) return null
    const caregiver = caregiverById.get(booking.caregiverId)
    const entry = caregiver?.servicePricing?.[booking.service]
    if (!entry || !entry.priceCents) return null
    return entry
  }, [caregiverById])

  const eligibleInvoiceBookings = useMemo(
    () => bookings.filter((b) => b.status === 'CONFIRMED'),
    [bookings]
  )

  useEffect(() => {
    if (eligibleInvoiceBookings.length === 0) return
    setInvoicePrices((prev) => {
      let changed = false
      const next = { ...prev }
      eligibleInvoiceBookings.forEach((booking) => {
        if (next[booking.id]) return
        const suggested = getSuggestedPriceEntry(booking)
        if (!suggested) return
        next[booking.id] = (suggested.priceCents / 100).toFixed(2).replace('.', ',')
        changed = true
      })
      return changed ? next : prev
    })
  }, [eligibleInvoiceBookings, getSuggestedPriceEntry])

  const selectedInvoiceBookings = useMemo(
    () => eligibleInvoiceBookings.filter((b) => invoiceSelection[b.id]),
    [eligibleInvoiceBookings, invoiceSelection]
  )

  const selectedInvoiceOwnerIds = useMemo(() => {
    const ids = new Set<string>()
    selectedInvoiceBookings.forEach((b) => {
      if (b.ownerId) ids.add(b.ownerId)
    })
    return Array.from(ids)
  }, [selectedInvoiceBookings])

  const invoiceOwnerId = selectedInvoiceOwnerIds.length === 1 ? selectedInvoiceOwnerIds[0] : null

  const selectedInvoiceSubtotalCents = useMemo(() => {
    return selectedInvoiceBookings.reduce((total, booking) => {
      const quantity = invoiceQuantities[booking.id] ?? 1
      const priceRaw = (invoicePrices[booking.id] ?? '').replace(',', '.')
      const priceValue = Number(priceRaw)
      if (!Number.isFinite(priceValue) || priceValue <= 0) return total
      return total + Math.round(priceValue * 100) * quantity
    }, 0)
  }, [selectedInvoiceBookings, invoicePrices, invoiceQuantities])

  const toggleInvoiceSelection = (bookingId: string) => {
    setInvoiceSelection((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }))
    setInvoiceQuantities((prev) => ({
      ...prev,
      [bookingId]: prev[bookingId] ?? 1,
    }))
    setInvoicePrices((prev) => {
      if (prev[bookingId]) {
        return {
          ...prev,
          [bookingId]: prev[bookingId],
        }
      }
      const booking = eligibleInvoiceBookings.find((b) => b.id === bookingId)
      const suggested = booking ? getSuggestedPriceEntry(booking) : null
      const suggestedValue = suggested ? (suggested.priceCents / 100).toFixed(2).replace('.', ',') : ''
      return {
        ...prev,
        [bookingId]: suggestedValue,
      }
    })
  }

  const updateInvoiceQuantity = (bookingId: string, value: string) => {
    const qty = Math.max(1, Math.round(Number(value || 1)))
    setInvoiceQuantities((prev) => ({ ...prev, [bookingId]: qty }))
  }

  const updateInvoicePrice = (bookingId: string, value: string) => {
    setInvoicePrices((prev) => ({ ...prev, [bookingId]: value }))
  }

  const clearInvoiceSelection = () => {
    setInvoiceSelection({})
    setInvoiceQuantities({})
    setInvoicePrices({})
  }

  const createInvoiceDraft = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    if (selectedInvoiceBookings.length === 0) {
      setErrorMsg('Selecteer minstens één opdracht voor facturatie.')
      return
    }
    if (!invoiceOwnerId) {
      setErrorMsg('Selecteer opdrachten van één eigenaar.')
      return
    }

    const items = selectedInvoiceBookings.map((booking) => {
      const quantity = invoiceQuantities[booking.id] ?? 1
      const priceRaw = (invoicePrices[booking.id] ?? '').replace(',', '.')
      const priceValue = Number(priceRaw)
      return {
        bookingId: booking.id,
        service: booking.service,
        serviceDate: booking.date,
        quantity,
        unitPriceCents: Number.isFinite(priceValue) ? Math.round(priceValue * 100) : 0,
      }
    })

    if (items.some((item) => item.unitPriceCents <= 0)) {
      setErrorMsg('Vul een geldige prijs in voor alle geselecteerde opdrachten.')
      return
    }

    const commissionValue = Number(commissionPercent.replace(',', '.'))
    const commissionSafe = Number.isFinite(commissionValue) ? commissionValue : 0

    setInvoiceLoading(true)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: invoiceOwnerId,
          commissionPercent: commissionSafe,
          items,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Kon factuurconcept niet aanmaken.')
      }
      setSuccessMsg('Factuurconcept aangemaakt.')
      setInvoiceSelection({})
      setInvoiceQuantities({})
      setInvoicePrices({})
      await load({ includeProfiles: profilesLoaded, includeInvoices: true })
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon factuurconcept niet aanmaken.')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const markInvoiceSent = async (invoiceId: string) => {
    setInvoiceLoading(true)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoiceId, status: 'SENT' }),
      })
      if (!res.ok) throw new Error('Kon status niet aanpassen.')
      setSuccessMsg('Factuur gemarkeerd als verstuurd.')
      await load({ includeProfiles: profilesLoaded, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon factuurstatus niet aanpassen.')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const exportInvoiceCsv = (invoice: InvoiceDraft) => {
    const rows = [
      ['Owner', 'OwnerEmail', 'Dienst', 'Datum', 'Aantal', 'Prijs', 'Commissie%'],
      ...invoice.items.map((item) => [
        invoice.owner.name,
        invoice.owner.email,
        item.serviceLabel,
        new Date(item.serviceDate).toLocaleDateString('nl-BE'),
        String(item.quantity),
        (item.unitPriceCents / 100).toFixed(2).replace('.', ','),
        invoice.commissionPercent != null ? String(invoice.commissionPercent) : '',
      ]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `factuur-${invoice.owner.name.replace(/\s+/g, '_')}-${invoice.id}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const deleteInvoiceDraft = async (invoiceId: string) => {
    const confirmed = window.confirm('Deze conceptfactuur verwijderen? Dit kan niet ongedaan gemaakt worden.')
    if (!confirmed) return
    setInvoiceLoading(true)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: invoiceId }),
      })
      if (!res.ok) throw new Error('Kon conceptfactuur niet verwijderen.')
      setSuccessMsg('Conceptfactuur verwijderd.')
      await load({ includeProfiles: profilesLoaded, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon conceptfactuur niet verwijderen.')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const runCleanup = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    const daysValue = Math.max(1, Math.min(365, Math.round(Number(cleanupDays || 30))))
    setCleanupLoading(true)
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: daysValue }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Kon aanvragen niet opschonen.')
      }
      const data = await res.json().catch(() => null)
      setSuccessMsg(
        `Opschoning klaar: ${data?.bookingsDeleted ?? 0} bookings, ${
          data?.occurrencesDeleted ?? 0
        } occurrences, ${data?.requestsDeleted ?? 0} requests verwijderd.`
      )
      await load({ includeProfiles: profilesLoaded, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon aanvragen niet opschonen.')
    } finally {
      setCleanupLoading(false)
    }
  }

  const assignSelected = async () => {
    if (!selectedOwner || !selectedCaregiver) {
      setErrorMsg('Selecteer zowel een aanvraag als een verzorger')
      return
    }
    setActionLoading('assign')
    setErrorMsg(null)
    setSuccessMsg(null)
    const confirmText =
      selectedOwner.type === 'BOOKING'
        ? `Voorstel sturen naar eigenaar:\n- ${serviceLabel(selectedOwner.service)}\n- ${new Date(
            selectedOwner.date
          ).toLocaleDateString('nl-BE')} ${selectedOwner.time ? `• ${selectedOwner.time}` : ''}\n- ${
            selectedOwner.city
          } ${selectedOwner.postalCode}\n- Verzorger: ${selectedCaregiver.firstName} ${
            selectedCaregiver.lastName
          }`
        : `Bevestig toewijzing:\n- ${serviceLabel(selectedOwner.service)}\n- ${new Date(
            selectedOwner.date
          ).toLocaleDateString('nl-BE')} ${selectedOwner.time ? `• ${selectedOwner.time}` : ''}\n- ${
            selectedOwner.city
          } ${selectedOwner.postalCode}\n- Naar: ${selectedCaregiver.firstName} ${
            selectedCaregiver.lastName
          }`
    if (!window.confirm(confirmText)) {
      setActionLoading(null)
      return
    }
    try {
      if (selectedOwner.type === 'BOOKING') {
        const res = await fetch('/api/admin/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: selectedOwner.id,
            caregiverId: selectedCaregiver.id,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || 'Kon voorstel niet maken.')
        }
      } else {
        const res = await fetch('/api/admin/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occurrenceId: selectedOwner.id,
            caregiverId: selectedCaregiver.id,
            adminNotes: `Toegewezen aan: ${selectedCaregiver.firstName} ${selectedCaregiver.lastName}`,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || 'Kon niet toewijzen.')
        }
      }
      setSuccessMsg(
        selectedOwner.type === 'BOOKING'
          ? 'Voorstel toegevoegd. De eigenaar kan nu kiezen.'
          : 'Succesvol toegewezen en notificatie verstuurd.'
      )
      await load({ includeProfiles: profilesLoaded, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon voorstel niet maken.')
    } finally {
      setActionLoading(null)
    }
  }

  const bulkOfferSelected = async () => {
    if (!selectedOwner || !selectedCaregiver) {
      setErrorMsg('Selecteer zowel een aanvraag als een verzorger')
      return
    }
    if (selectedOwner.type !== 'BOOKING') {
      setErrorMsg('Bulk voorstel werkt alleen voor bookings.')
      return
    }
    setBulkOfferLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const confirmText = `Bulk voorstel sturen naar eigenaar (alle dagen):\n- ${serviceLabel(selectedOwner.service)}\n- Eigenaar: ${selectedOwner.ownerName}\n- Verzorger: ${selectedCaregiver.firstName} ${selectedCaregiver.lastName}`
    if (!window.confirm(confirmText)) {
      setBulkOfferLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/offers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedOwner.id,
          caregiverId: selectedCaregiver.id,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Kon bulk voorstel niet maken.')
      }
      const created = typeof data?.created === 'number' ? data.created : 0
      const total = typeof data?.total === 'number' ? data.total : undefined
      setSuccessMsg(
        total !== undefined
          ? `Bulk voorstel toegevoegd voor ${created}/${total} dag(en). De eigenaar kan nu kiezen.`
          : `Bulk voorstel toegevoegd voor ${created} dag(en). De eigenaar kan nu kiezen.`
      )
      await load({ includeProfiles: profilesLoaded, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Kon bulk voorstel niet maken.')
    } finally {
      setBulkOfferLoading(false)
    }
  }

  const deleteSelectedOwner = async () => {
    if (!selectedOwner) {
      setErrorMsg('Selecteer eerst een aanvraag')
      return
    }
    const confirmed = window.confirm('Weet je zeker dat je deze aanvraag wilt verwijderen?')
    if (!confirmed) return
    setActionLoading('delete')
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      if (selectedOwner.type === 'BOOKING') {
        const res = await fetch('/api/admin/bookings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedOwner.id }),
        })
        if (!res.ok) throw new Error('delete failed')
      } else {
        const res = await fetch('/api/admin/requests', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ occurrenceId: selectedOwner.id }),
        })
        if (!res.ok) throw new Error('delete failed')
      }
      setSuccessMsg('Aanvraag verwijderd.')
      await load({ includeProfiles: profilesLoaded, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon niet verwijderen.')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSelectedOwnerUser = async () => {
    if (!selectedOwner?.ownerId) {
      setErrorMsg('Geen eigenaar-id beschikbaar')
      return
    }
    const confirmed = window.confirm('Verwijder deze eigenaar en alle gekoppelde data?')
    if (!confirmed) return
    setActionLoading('delete')
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedOwner.ownerId }),
      })
      if (!res.ok) throw new Error('delete failed')
      setSuccessMsg('Eigenaar verwijderd.')
      await loadProfiles()
      await load({ includeProfiles: false, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon eigenaar niet verwijderen.')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSelectedCaregiver = async () => {
    if (!selectedCaregiver) {
      setErrorMsg('Selecteer eerst een verzorger')
      return
    }
    const confirmed = window.confirm('Verwijder deze verzorger uit het systeem?')
    if (!confirmed) return
    setActionLoading('delete')
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/caregivers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: selectedCaregiver.id }),
      })
      if (!res.ok) throw new Error('delete failed')
      setSuccessMsg('Verzorger verwijderd.')
      await loadProfiles()
      await load({ includeProfiles: false, includeInvoices: invoicesLoaded })
    } catch (err) {
      console.error(err)
      setErrorMsg('Kon verzorger niet verwijderen.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-lg font-semibold">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug naar site" />
      <main className="container mx-auto px-4 py-8" style={{ paddingTop: '7.5rem' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beheerdersdashboard</h1>
            <p className="text-sm text-gray-600">Selecteer links een aanvraag en rechts een verzorger, en wijs toe.</p>
          </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Handmatig herladen voor nieuwste data</span>
        </div>
        </div>

        <div
          className="bg-white border rounded-2xl shadow-sm p-4 mb-6 relative z-[1001]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <div className="w-full max-w-xs ml-auto flex flex-col items-end gap-3">
              <details className="w-full">
                <summary className="px-3 py-2 rounded-lg border text-sm w-full text-right cursor-pointer list-none">
                  Filters tonen
                </summary>
                <div className="mt-3 flex flex-col items-end gap-3">
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                  >
                    <option value="ALL">Alle diensten</option>
                    {Array.from(new Set(ownerItems.map((i) => i.service))).map((svc) => (
                      <option key={svc} value={svc}>
                        {serviceLabel(svc)}
                      </option>
                    ))}
                  </select>
                  <input
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    placeholder="Regio (stad/provincie/postcode)"
                    className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                  />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                  >
                    <option value="all">Alle datums</option>
                    <option value="today">Vandaag</option>
                    <option value="next7">Volgende 7 dagen</option>
                    <option value="custom">Eigen bereik</option>
                  </select>
                  {dateRange === 'custom' && (
                    <>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                      />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                      />
                    </>
                  )}
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Zoek (eigenaar/dier/dienst)"
                    className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                  />
                  <div className="flex flex-col gap-2 items-end text-right w-full max-w-xs">
                    <span className="text-xs text-gray-500 font-medium">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs text-right"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            {successMsg}
          </div>
        )}

        <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Opschonen aanvragen</h2>
              <p className="text-xs text-gray-500">
                Verwijder bevestigde/afgeronde aanvragen die al een tijd in het verleden liggen.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-600">
              Ouder dan (dagen)
              <input
                type="number"
                min={1}
                max={365}
                value={cleanupDays}
                onChange={(e) => setCleanupDays(e.target.value)}
                className="ml-2 border rounded-lg px-3 py-2 text-sm w-24 text-center"
              />
            </label>
            <button
              onClick={runCleanup}
              disabled={cleanupLoading}
              className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-800 text-sm font-semibold disabled:opacity-60"
            >
              {cleanupLoading ? 'Bezig...' : 'Opschonen'}
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profielen overzicht</h2>
              <p className="text-xs text-gray-500">Bekijk en beheer eigenaars en verzorgers voordat je toewijst.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {profilesLoaded ? `${ownerProfiles.length + caregiverProfiles.length} profielen` : 'Nog niet geladen'}
              </span>
              <button
                onClick={exportProfilesCsv}
                disabled={profilesExporting}
                className="text-xs text-slate-700 hover:underline disabled:opacity-60"
              >
                {profilesExporting ? 'Exporteren...' : 'Exporteer CSV'}
              </button>
              <button
                onClick={loadProfiles}
                disabled={profilesLoading}
                className="text-xs text-emerald-700 hover:underline disabled:opacity-60"
              >
                {profilesLoading ? 'Laden...' : profilesLoaded ? 'Vernieuwen' : 'Profielen laden'}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">Eigenaars</div>
                <span className="text-xs text-gray-500">{ownerProfiles.length}</span>
              </div>
              <div className="divide-y max-h-64 overflow-auto">
                {ownerProfiles.length === 0 && (
                  <div className="py-3 text-sm text-gray-500">
                    {profilesLoaded ? 'Geen eigenaars gevonden.' : 'Laad profielen om eigenaars te zien.'}
                  </div>
                )}
                {ownerProfiles.map((owner) => (
                  <div key={owner.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{owner.name}</div>
                        {owner.email.startsWith('anon+') && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                            Geanonimiseerd
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startImpersonation(owner.id, 'OWNER')}
                          disabled={impersonateLoadingId === owner.id}
                          className="text-xs text-emerald-700 hover:underline disabled:opacity-60"
                        >
                          Bekijk dashboard
                        </button>
                        <button
                          onClick={() => deleteOwnerProfile(owner.id)}
                          disabled={!!actionLoading}
                          className="text-xs text-red-700 hover:underline disabled:opacity-60"
                        >
                          Verwijder
                        </button>
                        <button
                          onClick={() => anonymizeUser(owner.id, 'eigenaar')}
                          disabled={!!actionLoading}
                          className="text-xs text-slate-700 hover:underline disabled:opacity-60"
                        >
                          Anonimiseer
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{owner.email}</div>
                    {owner.phone ? <div className="text-xs text-gray-500">{owner.phone}</div> : null}
                    <div className="text-xs text-gray-500">
                      {owner.profile?.address
                        ? `${owner.profile.address}, ${owner.profile.city ?? ''} ${owner.profile.postalCode ?? ''}`.trim()
                        : 'Adres onbekend'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Provincie: {owner.profile?.region ?? 'Onbekend'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">Verzorgers</div>
                <span className="text-xs text-gray-500">{caregiverProfiles.length}</span>
              </div>
              <div className="divide-y max-h-64 overflow-auto">
                {caregiverProfiles.length === 0 && (
                  <div className="py-3 text-sm text-gray-500">
                    {profilesLoaded ? 'Geen verzorgers gevonden.' : 'Laad profielen om verzorgers te zien.'}
                  </div>
                )}
                {caregiverProfiles.map((cg) => (
                  <div key={cg.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{cg.name}</div>
                        {cg.email.startsWith('anon+') && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                            Geanonimiseerd
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startImpersonation(cg.id, 'CAREGIVER')}
                          disabled={impersonateLoadingId === cg.id}
                          className="text-xs text-emerald-700 hover:underline disabled:opacity-60"
                        >
                          Bekijk dashboard
                        </button>
                        <button
                          onClick={() => deleteCaregiverProfile(cg.id)}
                          disabled={!!actionLoading}
                          className="text-xs text-red-700 hover:underline disabled:opacity-60"
                        >
                          Verwijder
                        </button>
                        <button
                          onClick={() => anonymizeUser(cg.id, 'verzorger')}
                          disabled={!!actionLoading}
                          className="text-xs text-slate-700 hover:underline disabled:opacity-60"
                        >
                          Anonimiseer
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{cg.email}</div>
                    {cg.phone ? <div className="text-xs text-gray-500">{cg.phone}</div> : null}
                    <div className="text-xs text-gray-500">
                      {cg.profile?.city ? `${cg.profile.city} (${cg.profile.postalCode ?? ''})` : 'Locatie onbekend'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Provincie: {cg.profile?.region ?? 'Onbekend'}
                    </div>
                    <div className="text-xs text-gray-500">
                      BTW-nummer: {cg.profile?.enterpriseNumber ?? 'Onbekend'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: {cg.profile?.isApproved ? 'Goedgekeurd' : 'Niet goedgekeurd'} •{' '}
                      {cg.profile?.isActive ? 'Actief' : 'Niet actief'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Aanmeldingen dierenverzorgers</h2>
              <p className="text-xs text-gray-500">
                Dit zijn intake-aanmeldingen (nog geen account). Gebruik dit om kandidaten te beoordelen.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {applicationsLoaded ? `${caregiverApplications.length} aanmeldingen` : 'Nog niet geladen'}
              </span>
              <button
                onClick={loadCaregiverApplications}
                disabled={applicationsLoading}
                className="text-xs text-emerald-700 hover:underline disabled:opacity-60"
              >
                {applicationsLoading ? 'Laden...' : applicationsLoaded ? 'Vernieuwen' : 'Aanmeldingen laden'}
              </button>
            </div>
          </div>

          <div className="divide-y">
            {caregiverApplications.length === 0 && (
              <div className="py-3 text-sm text-gray-500">
                {applicationsLoaded ? 'Geen aanmeldingen gevonden.' : 'Klik op “Aanmeldingen laden” om ze te bekijken.'}
              </div>
            )}
            {caregiverApplications.slice(0, 50).map((app) => {
              const services = (app.services ?? []).map(serviceLabel).join(', ')
              const created = new Date(app.createdAt).toLocaleString('nl-BE')
              const exp = (app.experience ?? '').trim()
              const msg = (app.message ?? '').trim()
              const enterprise = (app.enterpriseNumber ?? '').trim()
              return (
                <div key={app.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-[220px]">
                      <div className="font-semibold text-gray-900">
                        {app.firstName} {app.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        <a className="text-emerald-700 font-semibold hover:underline" href={`mailto:${app.email}`}>
                          {app.email}
                        </a>
                        {' • '}
                        <a className="text-emerald-700 font-semibold hover:underline" href={`tel:${app.phone}`}>
                          {app.phone}
                        </a>
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.city} ({app.postalCode}) • {created}
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => approveCaregiverApplication(app.id)}
                          disabled={applicationApproveLoadingId === app.id}
                          className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold disabled:opacity-60"
                        >
                          {applicationApproveLoadingId === app.id ? 'Goedkeuren…' : 'Goedkeuren & account maken'}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[220px]">
                      <div className="text-xs text-gray-500">Diensten</div>
                      <div className="text-gray-800">{services || 'Geen'}</div>
                      <div className="mt-2 text-xs text-gray-500">Ervaring</div>
                      <div className="text-gray-800 whitespace-pre-wrap break-words max-h-32 overflow-auto pr-2">
                        {exp.length > 180 ? `${exp.slice(0, 180)}…` : exp || '—'}
                      </div>
                      {msg ? (
                        <>
                          <div className="mt-2 text-xs text-gray-500">Extra</div>
                          <div className="text-gray-800 whitespace-pre-wrap break-words max-h-32 overflow-auto pr-2">
                            {msg.length > 180 ? `${msg.slice(0, 180)}…` : msg}
                          </div>
                        </>
                      ) : null}
                    </div>

                    <div className="min-w-[220px]">
                      <div className="text-xs text-gray-500">Zelfstandig</div>
                      <div className="text-gray-800">{app.isSelfEmployed ? 'Ja' : 'Nee'}</div>
                      <div className="mt-2 text-xs text-gray-500">BA-verzekering</div>
                      <div className="text-gray-800">{app.hasLiabilityInsurance ? 'Ja' : 'Nee'}</div>
                      {enterprise ? (
                        <>
                          <div className="mt-2 text-xs text-gray-500">Ondernemingsnummer</div>
                          <div className="text-gray-800">{enterprise}</div>
                        </>
                      ) : null}
                      {app.companyName ? (
                        <>
                          <div className="mt-2 text-xs text-gray-500">Bedrijf</div>
                          <div className="text-gray-800">{app.companyName}</div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
            {caregiverApplications.length > 50 && (
              <div className="pt-3 text-xs text-gray-500">Toont de eerste 50 aanmeldingen.</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Facturatie voorbereiding</h2>
              <p className="text-xs text-gray-500">
                Selecteer opdrachten, vul prijs en aantal in, en maak een factuurconcept voor je boekhouding.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{eligibleInvoiceBookings.length} opdrachten</span>
              <button
                onClick={loadInvoices}
                disabled={invoicesLoading}
                className="text-xs text-emerald-700 hover:underline disabled:opacity-60"
              >
                {invoicesLoading ? 'Laden...' : invoicesLoaded ? 'Vernieuwen' : 'Factuurconcepten laden'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">Opdrachten factureren</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Bevestigd door eigenaar</span>
                  <button
                    onClick={clearInvoiceSelection}
                    disabled={invoiceLoading || selectedInvoiceBookings.length === 0}
                    className="text-xs text-red-700 hover:underline disabled:opacity-60"
                  >
                    Selectie wissen
                  </button>
                </div>
              </div>
              {eligibleInvoiceBookings.length === 0 ? (
                <div className="py-3 text-sm text-gray-500">Geen bevestigde opdrachten.</div>
              ) : (
                <div className="divide-y">
                  {eligibleInvoiceBookings.map((booking) => {
                    const isSelected = !!invoiceSelection[booking.id]
                    const ownerMismatch = Boolean(
                      invoiceOwnerId && booking.ownerId && booking.ownerId !== invoiceOwnerId
                    )
                    const suggested = getSuggestedPriceEntry(booking)
                    const suggestedLabel = suggested
                      ? `${formatEuro(suggested.priceCents)} ${UNIT_LABELS[suggested.unit] ?? suggested.unit}`
                      : 'Niet ingesteld'
                    return (
                      <div key={booking.id} className="py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleInvoiceSelection(booking.id)}
                            disabled={!booking.ownerId || ownerMismatch}
                            className="h-4 w-4"
                          />
                          <div className="flex-1 min-w-[200px]">
                            <div className="font-semibold text-gray-900">
                              {serviceLabel(booking.service)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.ownerName} • {new Date(booking.date).toLocaleDateString('nl-BE')}
                            </div>
                            <div className="text-xs text-gray-500">{getStatusLabel(booking.status)}</div>
                            <div className="text-xs text-gray-500">Prijs voorstel: {suggestedLabel}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Aantal</label>
                            <input
                              type="number"
                              min={1}
                              value={invoiceQuantities[booking.id] ?? 1}
                              onChange={(e) => updateInvoiceQuantity(booking.id, e.target.value)}
                              className="border rounded-lg px-2 py-1 text-sm w-20 text-center"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Prijs</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0,00"
                              value={invoicePrices[booking.id] ?? ''}
                              onChange={(e) => updateInvoicePrice(booking.id, e.target.value)}
                              className="border rounded-lg px-2 py-1 text-sm w-24 text-center"
                            />
                          </div>
                        </div>
                        {ownerMismatch && (
                          <div className="text-xs text-amber-600 mt-1">
                            Selecteer slechts één eigenaar per factuurconcept.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border rounded-xl p-3 space-y-3">
              <div className="font-semibold text-gray-900">Samenvatting</div>
              <div className="text-xs text-gray-500">
                Geselecteerd: {selectedInvoiceBookings.length} opdrachten
              </div>
              <div className="text-xs text-gray-500">
                Eigenaar:{' '}
                {selectedInvoiceBookings[0]?.ownerName ?? 'Kies opdrachten van één eigenaar'}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Commissie %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-sm w-24 text-center"
                />
              </div>
              <div className="text-sm text-gray-700">
                Totaal zonder commissie: {formatEuro(selectedInvoiceSubtotalCents)}
              </div>
              <div className="text-sm text-gray-700">
                Commissie: {formatEuro(Math.round(selectedInvoiceSubtotalCents * (Number(commissionPercent.replace(',', '.')) || 0) / 100))}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Totaal: {formatEuro(
                  selectedInvoiceSubtotalCents +
                    Math.round(selectedInvoiceSubtotalCents * (Number(commissionPercent.replace(',', '.')) || 0) / 100)
                )}
              </div>
              <button
                onClick={createInvoiceDraft}
                disabled={invoiceLoading || !invoiceOwnerId || selectedInvoiceBookings.length === 0}
                className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-60"
              >
                {invoiceLoading ? 'Bezig...' : 'Maak factuurconcept'}
              </button>
            </div>
          </div>

          <div className="border rounded-xl p-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900">Conceptfacturen</div>
              <span className="text-xs text-gray-500">{invoiceDrafts.length}</span>
            </div>
          {invoiceDrafts.length === 0 ? (
            <div className="py-3 text-sm text-gray-500">
              {invoicesLoaded ? 'Geen factuurconcepten.' : 'Laad factuurconcepten om ze te bekijken.'}
            </div>
          ) : (
              <div className="divide-y">
                {invoiceDrafts.map((draft) => {
                  const subtotal = draft.items.reduce(
                    (sum, item) => sum + item.unitPriceCents * item.quantity,
                    0
                  )
                  const commission =
                    draft.commissionPercent != null
                      ? Math.round(subtotal * draft.commissionPercent / 100)
                      : 0
                  return (
                    <div key={draft.id} className="py-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {draft.owner.name} • {draft.items.length} regels
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(draft.createdAt).toLocaleDateString('nl-BE')} •{' '}
                            {draft.status === 'SENT' ? 'Verstuurd' : 'Concept'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Totaal zonder commissie: {formatEuro(subtotal)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Commissie: {formatEuro(commission)}{' '}
                          {draft.commissionPercent != null ? `(${draft.commissionPercent}%)` : ''}
                        </div>
                        <div className="text-xs text-gray-600">
                          Totaal met commissie: {formatEuro(subtotal + commission)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportInvoiceCsv(draft)}
                            className="text-xs text-emerald-700 hover:underline"
                          >
                            Exporteer CSV
                          </button>
                          {draft.status !== 'SENT' && (
                            <button
                              onClick={() => markInvoiceSent(draft.id)}
                              disabled={invoiceLoading}
                              className="text-xs text-blue-700 hover:underline disabled:opacity-60"
                            >
                              Markeer als verstuurd
                            </button>
                          )}
                          <button
                            onClick={() => deleteInvoiceDraft(draft.id)}
                            disabled={invoiceLoading}
                            className="text-xs text-red-700 hover:underline disabled:opacity-60"
                          >
                            Verwijder factuurconcept
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {draft.items.map((item) => (
                          <div key={item.id}>
                            {item.serviceLabel} • {item.quantity} × {formatEuro(item.unitPriceCents)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Owner column */}
          <div className="lg:col-span-6 bg-white border rounded-2xl shadow-sm">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Aanvragen van eigenaars</h2>
              <span className="text-xs text-gray-500">{filteredOwners.length} resultaten</span>
            </div>
            <div className="divide-y max-h-[70vh] overflow-auto">
              {filteredOwners.length === 0 && (
                <div className="p-4 text-sm text-gray-500">Geen aanvragen gevonden.</div>
              )}
              {filteredOwners.map((item) => {
                const active = selectedOwnerId === item.id && selectedOwnerType === item.type
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectOwner(item)}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition ${
                      active ? 'bg-emerald-50/70 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-gray-900">{item.ownerName}</div>
                      <div className="flex items-center gap-2">
                        {item.status === 'CONFIRMED' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                            Bevestigd door eigenaar
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {serviceLabel(item.service)} • {item.city} ({item.postalCode})
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.date).toLocaleDateString('nl-BE')}
                      {item.time ? ` • ${item.time}` : ''}
                      {item.timeWindow ? ` • ${timeWindowLabels[item.timeWindow] ?? item.timeWindow}` : ''}
                    </div>
                    {item.petSummary ? (
                      <div className="text-xs text-gray-500 mt-1">Huisdier: {item.petSummary}</div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Caregiver column */}
          <div className="lg:col-span-6 bg-white border rounded-2xl shadow-sm">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Verzorgers</h2>
              <span className="text-xs text-gray-500">{caregivers.length} kandidaten</span>
            </div>
            <div className="divide-y max-h-[70vh] overflow-auto">
              {caregivers.length === 0 && (
                <div className="p-4 text-sm text-gray-500">Geen verzorgers gevonden.</div>
              )}
              {caregiversWithMatch.map((cg) => {
                const active = selectedCaregiverId === cg.id
                return (
                  <button
                    key={cg.id}
                    onClick={() => setSelectedCaregiverId(cg.id)}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition ${
                      active ? 'bg-blue-50/60 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-gray-900">
                        {cg.firstName} {cg.lastName}
                      </div>
                      <span className="text-xs text-gray-500">
                        {cg.city} ({cg.postalCode})
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {cg.email} {cg.phone ? `• ${cg.phone}` : ''}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Diensten: {(cg.services ?? []).map(serviceLabel).join(', ') || 'Onbekend'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Tarieven: {formatPricingLines(cg.services, cg.servicePricing)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedOwner ? (
                        cg.hasMatch ? (
                          <span className="text-emerald-700 font-semibold">Match gevonden</span>
                        ) : (
                          'Geen match gevonden'
                        )
                      ) : (
                        'Selecteer een aanvraag voor matchdetails'
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Detail drawers */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Gekozen aanvraag</div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedOwner?.ownerName ?? 'Geen geselecteerd'}
                </div>
              </div>
              {selectedOwner && (
                <div className="flex items-center gap-2">
                  {selectedOwner.status === 'CONFIRMED' && (
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                      Bevestigd door eigenaar
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {getStatusLabel(selectedOwner.status)}
                  </span>
                </div>
              )}
            </div>
            {selectedOwner ? (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Dienst</div>
                  <div className="font-semibold text-gray-900">{serviceLabel(selectedOwner.service)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Datum/tijd</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(selectedOwner.date).toLocaleDateString('nl-BE')}
                    {selectedOwner.time ? ` • ${selectedOwner.time}` : ''}
                    {selectedOwner.timeWindow
                      ? ` • ${timeWindowLabels[selectedOwner.timeWindow] ?? selectedOwner.timeWindow}`
                      : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Locatie</div>
                  <div className="font-semibold text-gray-900">
                    {selectedOwner.city}, {selectedOwner.postalCode}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Thuisadres eigenaar</div>
                  <div className="font-semibold text-gray-900">
                    {selectedOwner.ownerAddress
                      ? `${selectedOwner.ownerAddress}, ${selectedOwner.ownerCity ?? ''} ${
                          selectedOwner.ownerPostalCode ?? ''
                        }`.trim()
                      : 'Onbekend'}
                  </div>
                  <div className="text-xs text-gray-500">Provincie: {selectedOwner.ownerRegion ?? 'Onbekend'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Contact</div>
                  <div className="font-semibold text-gray-900">
                    {selectedOwner.ownerEmail}
                    {selectedOwner.ownerPhone ? ` • ${selectedOwner.ownerPhone}` : ''}
                  </div>
                </div>
                {selectedOwner.petSummary ? (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500">Huisdier</div>
                    <div className="font-semibold text-gray-900">{selectedOwner.petSummary}</div>
                  </div>
                ) : null}
                {selectedOwner.ownerPetsInfo ? (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500">Info over huisdieren</div>
                    <div className="text-gray-800 whitespace-pre-wrap">{selectedOwner.ownerPetsInfo}</div>
                  </div>
                ) : null}
                {selectedOwner.recurringInfo ? (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500">Aanvraagstatus</div>
                    <div className="text-gray-800">{getStatusLabel(selectedOwner.recurringInfo)}</div>
                  </div>
                ) : null}
                <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={deleteSelectedOwner}
                    disabled={!!actionLoading}
                    className="px-3 py-2 rounded-lg border text-sm text-red-700 disabled:opacity-60"
                  >
                    Verwijder aanvraag
                  </button>
                  <button
                    onClick={deleteSelectedOwnerUser}
                    disabled={!!actionLoading || !selectedOwner.ownerId}
                    className="px-3 py-2 rounded-lg border text-sm text-red-700 disabled:opacity-60"
                  >
                    Verwijder eigenaar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Geen aanvraag geselecteerd</div>
            )}
          </div>

          <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Gekozen verzorger</div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedCaregiver ? `${selectedCaregiver.firstName} ${selectedCaregiver.lastName}` : 'Geen geselecteerd'}
                </div>
              </div>
            </div>
            {selectedCaregiver ? (
              <>
                <div className="text-sm text-gray-700">
                  {selectedCaregiver.email} {selectedCaregiver.phone ? `• ${selectedCaregiver.phone}` : ''}
                </div>
                <div className="text-sm text-gray-700">
                  {selectedCaregiver.city} ({selectedCaregiver.postalCode})
                </div>
                <div className="text-xs text-gray-500">Provincie: {selectedCaregiver.region ?? 'Onbekend'}</div>
                <div className="text-xs text-gray-500">
                  Werkregio&apos;s:{' '}
                  {selectedCaregiver.workRegions && selectedCaregiver.workRegions.length > 0
                    ? selectedCaregiver.workRegions.join(', ')
                    : 'Onbekend'}
                </div>
                <div className="text-xs text-gray-500">
                  Diensten: {(selectedCaregiver.services ?? []).map(serviceLabel).join(', ') || 'Onbekend'}
                </div>
                <div className="text-xs text-gray-500">
                  Tarieven: {formatPricingLines(selectedCaregiver.services, selectedCaregiver.servicePricing)}
                </div>
                {selectedOwner ? (
                  <div className="text-xs text-gray-500">
                    Prijs voor dienst:{' '}
                    {selectedCaregiver.servicePricing?.[selectedOwner.service]?.priceCents
                      ? `${formatEuro(
                          selectedCaregiver.servicePricing[selectedOwner.service].priceCents
                        )} ${
                          UNIT_LABELS[selectedCaregiver.servicePricing[selectedOwner.service].unit] ??
                          selectedCaregiver.servicePricing[selectedOwner.service].unit
                        }`
                      : 'Niet ingesteld'}
                  </div>
                ) : null}
                <div className="text-xs text-gray-500">Bedrijfsnaam: {selectedCaregiver.companyName ?? 'Onbekend'}</div>
                <div className="text-xs text-gray-500">BTW-nummer: {selectedCaregiver.enterpriseNumber ?? 'Onbekend'}</div>
                <div className="text-xs text-gray-500">
                  Zelfstandig: {selectedCaregiver.isSelfEmployed ? 'Ja' : 'Nee'}
                </div>
                <div className="text-xs text-gray-500">
                  Aansprakelijkheidsverzekering: {selectedCaregiver.hasLiabilityInsurance ? 'Ja' : 'Nee'}
                </div>
                {selectedCaregiver.liabilityInsuranceCompany ? (
                  <div className="text-xs text-gray-500">
                    Verzekeraar: {selectedCaregiver.liabilityInsuranceCompany}
                  </div>
                ) : null}
                {selectedCaregiver.liabilityInsurancePolicyNumber ? (
                  <div className="text-xs text-gray-500">
                    Polisnummer: {selectedCaregiver.liabilityInsurancePolicyNumber}
                  </div>
                ) : null}
                {selectedCaregiver.maxDistance !== null && selectedCaregiver.maxDistance !== undefined ? (
                  <div className="text-xs text-gray-500">
                    Max. afstand: {selectedCaregiver.maxDistance} km
                  </div>
                ) : null}
                {selectedCaregiver.experience ? (
                  <div className="text-xs text-gray-500">
                    Ervaring: <span className="text-gray-800">{selectedCaregiver.experience}</span>
                  </div>
                ) : null}
                {selectedCaregiver.bio ? (
                  <div className="text-xs text-gray-500">
                    Bio: <span className="text-gray-800">{selectedCaregiver.bio}</span>
                  </div>
                ) : null}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={deleteSelectedCaregiver}
                    disabled={!!actionLoading}
                    className="px-3 py-2 rounded-lg border text-sm text-red-700 disabled:opacity-60"
                  >
                    Verwijder verzorger
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Geen verzorger geselecteerd</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={assignSelected}
              disabled={!!actionLoading || bulkOfferLoading || !selectedOwner || !selectedCaregiver}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-60"
              >
              {actionLoading === 'assign'
                ? selectedOwner?.type === 'BOOKING'
                  ? 'Voorstel maken...'
                  : 'Toewijzen...'
                : selectedOwner?.type === 'BOOKING'
                  ? 'Voorstel aan eigenaar'
                  : 'Goedkeuren & toewijzen'}
              </button>

              {selectedOwner?.type === 'BOOKING' && (
                <button
                  onClick={bulkOfferSelected}
                  disabled={!!actionLoading || bulkOfferLoading || !selectedOwner || !selectedCaregiver}
                  className="px-4 py-2 rounded-lg border border-blue-200 text-blue-800 text-sm font-semibold hover:bg-blue-50 disabled:opacity-60"
                >
                  {bulkOfferLoading ? 'Bulk voorstel...' : 'Bulk voorstel (alle dagen)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
