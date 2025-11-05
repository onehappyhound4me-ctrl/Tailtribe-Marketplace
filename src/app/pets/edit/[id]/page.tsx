'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ANIMAL_TYPES } from '@/lib/animal-types'

interface Props {
  params: {
    id: string
  }
}

export default function EditPetPage({ params }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pet, setPet] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
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

  const fetchPet = useCallback(async () => {
    try {
      const response = await fetch(`/api/pets/${params.id}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Kon huisdier niet laden')
      }
      const data = await response.json()
      setPet(data.pet)
      setFormData({
        name: data.pet.name || '',
        type: data.pet.type || '',
        customType: data.pet.customType || '',
        breed: data.pet.breed || '',
        gender: data.pet.gender || 'MALE',
        age: data.pet.age ? String(data.pet.age) : '',
        weight: data.pet.weight ? String(data.pet.weight) : '',
        spayedNeutered: Boolean(data.pet.spayedNeutered),
        medicalInfo: data.pet.medicalInfo || '',
        socialWithPets: Boolean(data.pet.socialWithPets),
        socialWithPeople: Boolean(data.pet.socialWithPeople),
        character: data.pet.character || '',
        behaviorNotes: data.pet.behaviorNotes || '',
        photo: data.pet.photo || '',
        // Extra informatie velden
        color: data.pet.color || '',
        microchipNumber: data.pet.microchipNumber || '',
        vaccinations: data.pet.vaccinations || '',
        allergies: data.pet.allergies || '',
        medications: data.pet.medications || '',
        veterinarianName: data.pet.veterinarianName || '',
        veterinarianPhone: data.pet.veterinarianPhone || '',
        emergencyContact: data.pet.emergencyContact || '',
        specialNeeds: data.pet.specialNeeds || '',
        temperament: data.pet.temperament || '',
        notes: data.pet.notes || ''
      })
    } catch (error) {
      console.error('Error fetching pet:', error)
      toast.error('Kon huisdier niet laden')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchPet()
  }, [fetchPet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kon huisdier niet bijwerken')
      }

      toast.success('Huisdier succesvol bijgewerkt!')
      router.push('/pets')
    } catch (error: any) {
      console.error('Error updating pet:', error)
      toast.error(error.message || 'Er ging iets mis bij het bijwerken')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je dit huisdier wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Kon huisdier niet verwijderen')
      }

      toast.success('Huisdier succesvol verwijderd')
      router.push('/pets')
    } catch (error) {
      console.error('Error deleting pet:', error)
      toast.error('Er ging iets mis bij het verwijderen')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Gegevens worden geladen...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Huisdier niet gevonden</h2>
          <p className="text-gray-600 mb-6">Dit huisdier bestaat niet of je hebt geen toegang.</p>
          <Link href="/pets" className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all">
            Terug naar huisdieren
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bewerk {pet.name}</h1>
              <p className="text-gray-600">Update de informatie van je huisdier</p>
            </div>
            <Link href="/pets" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Terug
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 pb-16">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Basis Informatie</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Naam *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type *</Label>
                <select 
                  id="type" 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Selecteer type</option>
                  {ANIMAL_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="breed">Ras</Label>
                <Input 
                  id="breed" 
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="customType">Aangepast type</Label>
                <Input 
                  id="customType" 
                  value={formData.customType}
                  onChange={(e) => setFormData({...formData, customType: e.target.value})}
                  placeholder="bv. Alpaca, Fret"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Geslacht</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="MALE">♂️ Mannelijk</option>
                  <option value="FEMALE">♀️ Vrouwelijk</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="age">Leeftijd</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="bv. 3"
                />
              </div>
              
              <div>
                <Label htmlFor="weight">Gewicht (kg)</Label>
                <Input 
                  id="weight" 
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="bv. 25.5"
                />
              </div>
              
              <div>
                <Label htmlFor="color">Kleur</Label>
                <Input 
                  id="color" 
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="bv. Bruin, Zwart"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="spayedNeutered"
                  checked={formData.spayedNeutered}
                  onChange={(e) => setFormData({...formData, spayedNeutered: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="spayedNeutered">Gesteriliseerd/Gecastreerd</Label>
              </div>
            </div>
          </div>

          {/* Character & Social */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Karakter & Sociaal Gedrag</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="character">Karakter</Label>
                <Textarea
                  id="character"
                  value={formData.character}
                  onChange={(e) => setFormData({...formData, character: e.target.value})}
                  rows={2}
                  placeholder="bv. Vriendelijk, speels, rustig..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="socialWithPets"
                    checked={formData.socialWithPets}
                    onChange={(e) => setFormData({...formData, socialWithPets: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="socialWithPets">Sociaal met andere dieren</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="socialWithPeople"
                    checked={formData.socialWithPeople}
                    onChange={(e) => setFormData({...formData, socialWithPeople: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="socialWithPeople">Sociaal met mensen</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Medische Informatie</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="medicalInfo">Medische Informatie</Label>
                <Textarea
                  id="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={(e) => setFormData({...formData, medicalInfo: e.target.value})}
                  rows={3}
                  placeholder="Belangrijke medische informatie..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="microchipNumber">Microchip Nummer</Label>
                  <Input 
                    id="microchipNumber"
                    value={formData.microchipNumber}
                    onChange={(e) => setFormData({...formData, microchipNumber: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vaccinations">Vaccinaties</Label>
                  <Textarea
                    id="vaccinations" 
                    value={formData.vaccinations}
                    onChange={(e) => setFormData({...formData, vaccinations: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergies">Allergieën</Label>
                  <Textarea
                    id="allergies" 
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medications">Medicatie</Label>
                  <Textarea
                    id="medications" 
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="specialNeeds">Speciale Behoeften</Label>
                <Textarea
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({...formData, specialNeeds: e.target.value})}
                  rows={2}
                  placeholder="Speciale zorg of behoeften..."
                />
              </div>
            </div>
          </div>

          {/* Veterinarian & Emergency */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Dierenarts & Noodcontact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="veterinarianName">Dierenarts Naam</Label>
                <Input 
                  id="veterinarianName"
                  value={formData.veterinarianName}
                  onChange={(e) => setFormData({...formData, veterinarianName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="veterinarianPhone">Dierenarts Telefoon</Label>
                <Input 
                  id="veterinarianPhone"
                  value={formData.veterinarianPhone}
                  onChange={(e) => setFormData({...formData, veterinarianPhone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emergencyContact">Noodcontact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                placeholder="Naam en telefoonnummer"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Extra Informatie</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="temperament">Temperament</Label>
                <Textarea
                  id="temperament"
                  value={formData.temperament}
                  onChange={(e) => setFormData({...formData, temperament: e.target.value})}
                  rows={2}
                  placeholder="Temperament beschrijving..."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Extra notities of opmerkingen..."
                />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Foto</h2>
            
            <div>
              <Label htmlFor="photo">Foto URL</Label>
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => setFormData({...formData, photo: e.target.value})}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center gap-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="px-6 py-2"
              >
                Verwijder
              </Button>
              
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-8 py-2"
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
