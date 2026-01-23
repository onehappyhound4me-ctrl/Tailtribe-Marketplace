'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

const BELGIAN_REGIONS = [
  'Antwerpen',
  'Limburg',
  'Oost-Vlaanderen',
  'Vlaams-Brabant',
  'West-Vlaanderen',
  'Brussels Hoofdstedelijk Gewest',
  'Henegouwen',
  'Luik',
  'Luxemburg',
  'Namen',
  'Waals-Brabant',
]

const PRICING_UNITS = [
  { value: 'HALF_HOUR', label: 'Per half uur' },
  { value: 'HOUR', label: 'Per uur' },
  { value: 'HALF_DAY', label: 'Per halve dag' },
  { value: 'DAY', label: 'Per dag' },
]

export default function CaregiverProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    city: '',
    postalCode: '',
    region: '',
    workRegions: [] as string[],
    maxDistance: 20,
    companyName: '',
    enterpriseNumber: '',
    isSelfEmployed: false,
    hasLiabilityInsurance: false,
    liabilityInsuranceCompany: '',
    liabilityInsurancePolicyNumber: '',
    services: [] as string[],
    servicePricing: {} as Record<string, { price: string; unit: string }>,
    experience: '',
    bio: '',
  })

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const normalizeServices = (input: unknown): string[] => {
    if (!Array.isArray(input)) return []
    return input
      .map((service) => {
        if (typeof service === 'number' || (typeof service === 'string' && /^\d+$/.test(service))) {
          const idx = Number(service)
          return DISPATCH_SERVICES[idx]?.id
        }
        return typeof service === 'string' ? service : null
      })
      .filter((service): service is string => Boolean(service))
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/caregiver/profile')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          const normalizedServices = normalizeServices(JSON.parse(data.services || '[]'))
          let pricingMap: Record<string, { price: string; unit: string }> = {}
          try {
            const rawPricing = JSON.parse(data.servicePricing || '{}') as Record<
              string,
              { priceCents?: number; unit?: string }
            >
            pricingMap = Object.fromEntries(
              Object.entries(rawPricing).map(([key, value]) => [
                key,
                {
                  unit: value?.unit || 'HOUR',
                  price:
                    value?.priceCents != null
                      ? (Number(value.priceCents) / 100).toFixed(2)
                      : '',
                },
              ])
            )
          } catch {
            pricingMap = {}
          }
          setFormData({
            ...formData,
            ...data,
            workRegions: JSON.parse(data.workRegions || '[]'),
            services: normalizedServices,
            servicePricing: pricingMap,
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const response = await fetch('/api/caregiver/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profiel opgeslagen!' })
        setTimeout(() => router.push('/dashboard/caregiver'), 1500)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Er ging iets mis' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Er ging iets mis' })
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkRegion = (region: string) => {
    setFormData({
      ...formData,
      workRegions: formData.workRegions.includes(region)
        ? formData.workRegions.filter((r) => r !== region)
        : [...formData.workRegions, region],
    })
  }

  const toggleService = (serviceId: string) => {
    const isSelected = formData.services.includes(serviceId)
    const nextServices = isSelected
      ? formData.services.filter((s) => s !== serviceId)
      : [...formData.services, serviceId]
    const nextPricing = { ...formData.servicePricing }
    if (isSelected) {
      delete nextPricing[serviceId]
    } else if (!nextPricing[serviceId]) {
      nextPricing[serviceId] = { price: '', unit: 'HOUR' }
    }
    setFormData({
      ...formData,
      services: nextServices,
      servicePricing: nextPricing,
    })
  }

  const updateServicePricing = (serviceId: string, next: { price?: string; unit?: string }) => {
    setFormData({
      ...formData,
      servicePricing: {
        ...formData.servicePricing,
        [serviceId]: {
          price: next.price ?? formData.servicePricing[serviceId]?.price ?? '',
          unit: next.unit ?? formData.servicePricing[serviceId]?.unit ?? 'HOUR',
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/caregiver" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Profiel bewerken
            </h1>
            <p className="text-gray-600">
              Vul je gegevens aan om opdrachten te kunnen ontvangen
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Locatie */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Locatie</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stad / gemeente *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                    maxLength={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincie
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecteer provincie</option>
                  {BELGIAN_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Werkgebieden *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BELGIAN_REGIONS.map((region) => (
                    <label
                      key={region}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.workRegions.includes(region)}
                        onChange={() => toggleWorkRegion(region)}
                        className="text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-900">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max afstand (km)
                </label>
                <input
                  type="number"
                  value={formData.maxDistance}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDistance: parseInt(e.target.value) || 20 })
                  }
                  min="1"
                  max="100"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Diensten */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Diensten *</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DISPATCH_SERVICES.map((service) => {
                  const isGroupWalk = service.id === 'GROUP_DOG_WALKING'
                  return (
                  <label
                    key={service.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="mt-1 text-emerald-600 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-xs text-gray-600">{service.desc}</div>
                      {isGroupWalk && (
                        <div className="mt-2 text-xs text-emerald-700 font-semibold">
                          Groepsuitlaat – opleiding voorzien indien gewenst!
                        </div>
                      )}
                    </div>
                  </label>
                  )
                })}
              </div>
            </div>

            {/* Prijzen per dienst */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Prijzen per dienst</h2>
              <p className="text-sm text-gray-600 mb-4">
                Vul een prijs in en kies de tijdseenheid per gekozen dienst.
              </p>
              {formData.services.length === 0 ? (
                <div className="text-sm text-gray-500">Selecteer eerst diensten.</div>
              ) : (
                <div className="space-y-3">
                  {formData.services.map((serviceId) => {
                    const service = DISPATCH_SERVICES.find((s) => s.id === serviceId)
                    const pricing = formData.servicePricing[serviceId] ?? { price: '', unit: 'HOUR' }
                    return (
                      <div
                        key={serviceId}
                        className="flex flex-wrap items-center gap-3 border border-gray-200 rounded-xl p-3"
                      >
                        <div className="flex-1 min-w-[200px]">
                          <div className="font-medium text-gray-900">{service?.name ?? serviceId}</div>
                          <div className="text-xs text-gray-600">{service?.desc ?? ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Prijs (€)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={pricing.price}
                            onChange={(e) => updateServicePricing(serviceId, { price: e.target.value })}
                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Eenheid</label>
                          <select
                            value={pricing.unit}
                            onChange={(e) => updateServicePricing(serviceId, { unit: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {PRICING_UNITS.map((unit) => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Ervaring */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ervaring *</h2>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
                rows={4}
                placeholder="Beschrijf je ervaring met dierenverzorging..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (optioneel)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Iets over jezelf..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Bedrijfsinfo */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bedrijfsinfo</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isSelfEmployed}
                    onChange={(e) =>
                      setFormData({ ...formData, isSelfEmployed: e.target.checked })
                    }
                    className="text-emerald-600 rounded"
                  />
                  <span className="text-gray-900">Zelfstandig/freelancer</span>
                </label>

                {formData.isSelfEmployed && (
                  <>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Bedrijfsnaam"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={formData.enterpriseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, enterpriseNumber: e.target.value })
                      }
                      placeholder="Ondernemingsnummer"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </>
                )}

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasLiabilityInsurance}
                    onChange={(e) =>
                      setFormData({ ...formData, hasLiabilityInsurance: e.target.checked })
                    }
                    className="text-emerald-600 rounded"
                  />
                  <span className="text-gray-900">Ik heb een BA-verzekering</span>
                </label>

                {formData.hasLiabilityInsurance && (
                  <>
                    <input
                      type="text"
                      value={formData.liabilityInsuranceCompany}
                      onChange={(e) =>
                        setFormData({ ...formData, liabilityInsuranceCompany: e.target.value })
                      }
                      placeholder="Verzekeringskantoor"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={formData.liabilityInsurancePolicyNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, liabilityInsurancePolicyNumber: e.target.value })
                      }
                      placeholder="Polisnummer"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="mt-8" style={{ marginBottom: '3rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brand disabled:opacity-60"
              >
                {loading ? 'Opslaan...' : 'Profiel opslaan'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
