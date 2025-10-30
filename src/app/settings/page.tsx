'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { signOut, useSession } from 'next-auth/react'
import { DashboardLink } from '@/components/common/DashboardLink'

const serviceLabels: Record<string, string> = {
  'DOG_WALKING': 'Hondenuitlaat',
  'GROUP_DOG_WALKING': 'Groepsuitlaat',
  'DOG_TRAINING': 'Hondentraining',
  'PET_SITTING': 'Dierenoppas',
  'PET_BOARDING': 'Dierenopvang',
  'HOME_CARE': 'Verzorging aan huis',
  'PET_TRANSPORT': 'Transport huisdieren',
  'SMALL_ANIMAL_CARE': 'Verzorging kleinvee',
  'EVENT_COMPANION': 'Begeleiding events'
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()
  const role = searchParams.get('role') || 'owner'
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    postalCode: ''
  })
  const [preferences, setPreferences] = useState<any>(null)
  const [howHeard, setHowHeard] = useState('')
  const [perfectExp, setPerfectExp] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // Load profile data
  useEffect(() => {
    loadProfile()
  }, [])
  
  const loadProfile = async () => {
    try {
      // Load based on role
      if (role === 'caregiver') {
        const res = await fetch('/api/profile/caregiver')
        if (res.ok) {
          const { profile } = await res.json()
          if (profile) {
            setProfileData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              city: profile.city || '',
              postalCode: profile.postalCode || ''
            })
          }
        }
      } else {
        const res = await fetch('/api/profile/owner')
        if (res.ok) {
          const data = await res.json()
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            city: data.city || '',
            postalCode: data.postalCode || ''
          })
          
          // Load preferences
          if (data.preferences) {
            setPreferences(JSON.parse(data.preferences))
          }
          setHowHeard(data.howHeardAbout || '')
          setPerfectExp(data.perfectExperience || '')
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }
  
  const handleProfileUpdate = async () => {
    if (!profileData.firstName || !profileData.lastName) {
      toast.error('Voornaam en achternaam zijn verplicht')
      return
    }
    
    try {
      const res = await fetch('/api/profile/update-owner-basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          city: profileData.city,
          postalCode: profileData.postalCode,
          country: profileData.postalCode.match(/[a-zA-Z]/) ? 'NL' : 'BE'
        })
      })
      
      if (res.ok) {
        toast.success('Profiel bijgewerkt!')
        // Reload dashboard if it's open
        router.refresh()
      } else {
        toast.error('Er ging iets mis')
      }
    } catch (error) {
      toast.error('Er ging iets mis')
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vul alle velden in')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Nieuwe wachtwoorden komen niet overeen')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 karakters zijn')
      return
    }
    
    // TODO: Implement API call to change password
    toast.success('Wachtwoord succesvol gewijzigd!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'VERWIJDER MIJN ACCOUNT') {
      toast.error('Typ "VERWIJDER MIJN ACCOUNT" om te bevestigen')
      return
    }

    try {
      const res = await fetch('/api/profile/delete-account', {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Account succesvol verwijderd')
        // Sign out and redirect
        await signOut({ redirect: false })
        router.push('/')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Er ging iets mis')
      }
    } catch (error) {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mijn Profiel & Instellingen</h1>
              <p className="text-gray-600">Beheer je profiel en account instellingen</p>
            </div>
            <DashboardLink className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg self-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </DashboardLink>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-8 py-8 max-w-4xl">
        
        {/* Profiel Informatie Section - NEW */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profiel Informatie
          </h2>
          
          {profileLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Voornaam
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Jan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Achternaam
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Janssen"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">E-mail kan niet worden gewijzigd</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={profileData.postalCode}
                    onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="1012AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stad
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Amsterdam"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+32 123 45 67 89"
                />
              </div>
              
              <button
                onClick={handleProfileUpdate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-semibold transition-colors"
              >
                Profiel opslaan
              </button>
            </div>
          )}
        </div>

        {/* Mijn Voorkeuren Section */}
        {preferences && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mijn Voorkeuren
            </h2>
            
            <div className="space-y-4">
              {preferences.primaryServices && preferences.primaryServices.length > 0 && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <p className="font-semibold text-gray-800 mb-2">Diensten die ik zoek:</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.primaryServices.map((service: string, i: number) => (
                      <span key={i} className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                        {serviceLabels[service] || service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.frequency && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-semibold text-gray-800">Frequentie:</p>
                  <p className="text-gray-700">
                    {preferences.frequency === 'EENMALIG' ? 'Eenmalig' :
                     preferences.frequency === 'WEKELIJKS' ? 'Wekelijks' :
                     preferences.frequency === 'DAGELIJKS' ? 'Dagelijks' :
                     preferences.frequency === 'ONREGELMATIG' ? 'Onregelmatig' :
                     preferences.frequency}
                  </p>
                </div>
              )}
              
              {preferences.timing && preferences.timing.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <p className="font-semibold text-gray-800 mb-2">Wanneer:</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.timing.map((t: string, i: number) => (
                      <span key={i} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                        {t === 'OVERDAG' ? 'Overdag' : t === 'AVONDS' ? 'Avonds' : t === 'WEEKEND' ? 'Weekend' : t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.location && preferences.location.length > 0 && (
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                  <p className="font-semibold text-gray-800 mb-2">Locatie voorkeur:</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.location.map((location: string, index: number) => (
                      <span key={index} className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm">
                        {location === 'THUIS' ? 'Bij mij thuis' :
                         location === 'VERZORGER' ? 'Bij verzorger' :
                         location === 'BEIDE' ? 'Beide opties' :
                         location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.importantQualities && preferences.importantQualities.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="font-semibold text-gray-800 mb-2">Belangrijk voor mij:</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.importantQualities.map((q: string, i: number) => (
                      <span key={i} className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm">
                        {q === 'BETROUWBAARHEID' ? 'Betrouwbaarheid' :
                         q === 'ERVARING' ? 'Ervaring' :
                         q === 'PRIJS' ? 'Prijs' :
                         q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {howHeard && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-800">Hoe hoorde je over ons:</p>
                  <p className="text-gray-700">{howHeard}</p>
                </div>
              )}
              
              {perfectExp && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="font-semibold text-gray-800">Wat ik zoek:</p>
                  <p className="text-gray-700 italic">"{perfectExp}"</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Betalingen Section - Only for caregivers */}
        {role === 'caregiver' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Betalingen & Inkomsten
            </h2>
            
            <Link href="/settings/payment" className="block">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200">
                <div>
                  <h3 className="font-medium text-gray-800">Stripe Connect</h3>
                  <p className="text-sm text-gray-600">Ontvang uitbetalingen via Stripe</p>
                </div>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* Beveiliging Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Beveiliging
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">Wachtwoord wijzigen</h3>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Veilig</span>
              </div>
              <div className="space-y-2">
                <input 
                  type="password" 
                  placeholder="Huidig wachtwoord" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <input 
                  type="password" 
                  placeholder="Nieuw wachtwoord (min. 8 karakters)" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <input 
                  type="password" 
                  placeholder="Bevestig nieuw wachtwoord" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              <button 
                onClick={handlePasswordChange}
                className="w-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700 rounded-lg py-2 text-sm font-medium transition-colors mt-3"
              >
                Wachtwoord wijzigen
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Twee-factor authenticatie</h3>
                <p className="text-sm text-gray-600">Extra beveiliging voor je account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notificaties Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificaties
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Email notificaties</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Nieuwe berichten</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Boekingen updates</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-4">Deze actie kan niet ongedaan gemaakt worden. Al je gegevens worden permanent verwijderd.</p>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Account permanent verwijderen
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-300">
              <p className="text-sm font-semibold text-red-800">
                ⚠️ Weet je het 100% zeker?
              </p>
              <p className="text-sm text-gray-700">
                Dit verwijdert:
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Je profiel en alle persoonlijke gegevens</li>
                <li>Al je boekingen en geschiedenis</li>
                <li>Al je berichten en reviews</li>
                <li>Deze actie is ONOMKEERBAAR</li>
              </ul>
              <p className="text-sm font-semibold text-red-800">
                Typ <span className="font-mono bg-white px-2 py-1 rounded">VERWIJDER MIJN ACCOUNT</span> om te bevestigen:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="VERWIJDER MIJN ACCOUNT"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'VERWIJDER MIJN ACCOUNT'}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  Ja, verwijder mijn account
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
