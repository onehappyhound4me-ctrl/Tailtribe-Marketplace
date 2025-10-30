'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AddPetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'DOG',
    customType: '',
    breed: '',
    gender: 'MALE',
    age: '',
    weight: '',
    spayedNeutered: false,
    medicalInfo: '',
    socialWithPets: true,
    socialWithPeople: true,
    character: '',
    behaviorNotes: '',
    photo: '',
    // Extra informatie velden
    color: '',
    microchipNumber: '',
    vaccinations: '',
    allergies: '',
    medications: '',
    veterinarianName: '',
    veterinarianPhone: '',
    emergencyContact: '',
    specialNeeds: '',
    temperament: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/pets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null
        })
      })

      if (res.ok) {
        toast.success(`${formData.name} is toegevoegd!`)
        router.push('/pets')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Kon huisdier niet toevoegen')
      }
    } catch (error) {
      console.error('Error adding pet:', error)
      toast.error('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Huisdier Toevoegen</h1>
              <p className="text-gray-600">Voeg een nieuw huisdier toe aan je profiel</p>
            </div>
            <Link href="/pets" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg font-semibold shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Terug
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Basis informatie */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Basis Informatie</h2>
            
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Naam van je huisdier *
              </label>
              <input
                type="text"
                  required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Bijv. Max"
                />
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dierensoort *
                </label>
                <select 
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="DOG">🐕 Hond</option>
                  <option value="CAT">🐱 Kat</option>
                  <option value="RABBIT">🐰 Konijn</option>
                  <option value="BIRD">🐦 Vogel</option>
                  <option value="OTHER">🐾 Ander</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ras
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bijv. Labrador"
                />
            </div>
          </div>

            {formData.type === 'OTHER' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specificeer dierensoort *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customType}
                  onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bijv. Alpaca, Fret, Hamster..."
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Geslacht
                </label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="MALE">Mannelijk</option>
                  <option value="FEMALE">Vrouwelijk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Leeftijd (jaar)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bijv. 3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gewicht (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bijv. 15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kleur
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bijv. Bruin, Zwart"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.spayedNeutered}
                  onChange={(e) => setFormData({ ...formData, spayedNeutered: e.target.checked })}
                  className="w-5 h-5 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-gray-700">Gesteriliseerd/Gecastreerd</span>
              </label>
            </div>
          </div>

          {/* Gedrag */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Gedrag</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.socialWithPets}
                  onChange={(e) => setFormData({ ...formData, socialWithPets: e.target.checked })}
                  className="w-5 h-5 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-gray-700">Vriendelijk met huisdieren</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.socialWithPeople}
                  onChange={(e) => setFormData({ ...formData, socialWithPeople: e.target.checked })}
                  className="w-5 h-5 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-gray-700">Vriendelijk met mensen</span>
              </label>
              </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Karakter / Bijzonderheden
              </label>
              <textarea
                value={formData.character}
                onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Beschrijf het karakter van je huisdier..."
                />
              </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gedragsnotities
              </label>
              <textarea
                value={formData.behaviorNotes}
                onChange={(e) => setFormData({ ...formData, behaviorNotes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Gedrag, temperament, speciale gewoonten..."
              />
            </div>
          </div>

          {/* Medische info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Medische Informatie</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medische informatie
              </label>
              <textarea 
                value={formData.medicalInfo}
                onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Belangrijke medische informatie..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Microchip Nummer
                </label>
                <input
                  type="text"
                  value={formData.microchipNumber}
                  onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Microchip nummer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vaccinaties
                </label>
                <textarea
                  value={formData.vaccinations}
                  onChange={(e) => setFormData({ ...formData, vaccinations: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Vaccinatie informatie..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Allergieën
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Allergieën..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicatie
                </label>
                <textarea
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Medicatie informatie..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speciale Behoeften
              </label>
              <textarea
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Speciale zorg of behoeften..."
              />
            </div>
          </div>

          {/* Dierenarts & Noodcontact */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Dierenarts & Noodcontact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dierenarts Naam
                </label>
                <input
                  type="text"
                  value={formData.veterinarianName}
                  onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Naam dierenarts"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dierenarts Telefoon
                </label>
                <input
                  type="tel"
                  value={formData.veterinarianPhone}
                  onChange={(e) => setFormData({ ...formData, veterinarianPhone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Telefoonnummer dierenarts"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Noodcontact
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Naam en telefoonnummer noodcontact"
              />
            </div>
          </div>

          {/* Extra Informatie */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Extra Informatie</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temperament
              </label>
              <textarea
                value={formData.temperament}
                onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Temperament beschrijving..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notities
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Extra notities of opmerkingen..."
              />
            </div>
          </div>

          {/* Foto */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Foto</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto URL (optioneel)
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://example.com/foto.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Upload je foto naar een service zoals Imgur, Google Drive, of Dropbox en plak hier de link</p>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md"
            >
              {loading ? 'Toevoegen...' : 'Huisdier Toevoegen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
