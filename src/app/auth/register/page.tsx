'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'OWNER' as 'OWNER' | 'CAREGIVER',
    referralCode: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const [referralInfo, setReferralInfo] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  // NO useEffect redirect - redirect only after successful registration/login

  // Quick test fill
  const fillTestOwner = () => {
    setFormData({
      firstName: 'Test',
      lastName: 'Owner',
      email: `owner${Date.now()}@test.nl`,
      password: 'test123456',
      role: 'OWNER',
      referralCode: ''
    })
    toast.success('Test Owner data ingevuld!')
  }

  const fillTestCaregiver = () => {
    setFormData({
      firstName: 'Test',
      lastName: 'Caregiver',
      email: `caregiver${Date.now()}@test.nl`,
      password: 'test123456',
      role: 'CAREGIVER',
      referralCode: ''
    })
    toast.success('Test Caregiver data ingevuld!')
  }

  // Check for referral code in URL
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      validateReferralCode(ref)
      setFormData(prev => ({ ...prev, referralCode: ref }))
    }
  }, [searchParams])

  const validateReferralCode = async (code: string) => {
    try {
      const res = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      
      if (data.valid) {
        setReferralInfo(data)
        toast.success(data.message)
      }
    } catch (error) {
      console.error('Error validating referral:', error)
    }
  }

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'Voornaam is verplicht'
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'Voornaam moet minimaal 2 tekens zijn'
        } else {
          delete newErrors.firstName
        }
        break
      
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Achternaam is verplicht'
        } else if (value.trim().length < 2) {
          newErrors.lastName = 'Achternaam moet minimaal 2 tekens zijn'
        } else {
          delete newErrors.lastName
        }
        break
      
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is verplicht'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Ongeldig email adres'
        } else {
          delete newErrors.email
        }
        break
      
      case 'password':
        if (!value) {
          newErrors.password = 'Wachtwoord is verplicht'
        } else if (value.length < 6) {
          newErrors.password = 'Wachtwoord moet minimaal 6 tekens zijn'
        } else {
          delete newErrors.password
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate all fields
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Voornaam is verplicht'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Voornaam moet minimaal 2 tekens zijn'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Achternaam is verplicht'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Achternaam moet minimaal 2 tekens zijn'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres'
    }
    
    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Wachtwoord moet minimaal 6 tekens zijn'
    }
    
    setErrors(newErrors)
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true
    })
    
    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate before submit
    if (!validateForm()) {
      toast.error('Vul alle verplichte velden correct in')
      return
    }
    
    setLoading(true)

    try {
      // Register user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registratie mislukt')
      }

      toast.success('Account aangemaakt! Je wordt nu ingelogd...')

      // Auto login after registration
      try {
        const { signIn } = await import('next-auth/react')
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          console.error('Login error:', result.error)
          toast.error('Account aangemaakt, maar automatisch inloggen mislukt. Log handmatig in.')
          router.push('/auth/signin')
          setLoading(false)
        } else if (result?.ok) {
          console.log('Login successful, redirecting...')
          toast.success('Account aangemaakt en ingelogd!')
          
          // Simple redirect after successful registration - let middleware handle role-based routing
          // Use a small delay to ensure session cookie is set
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Just go to dashboard - middleware will redirect to correct role-based dashboard
              window.location.href = '/dashboard'
            })
          })
        } else {
          toast.error('Account aangemaakt, maar automatisch inloggen mislukt. Log handmatig in.')
          router.push('/auth/signin')
          setLoading(false)
        }
      } catch (loginError) {
        console.error('Login error:', loginError)
        toast.error('Inloggen mislukt. Probeer handmatig in te loggen.')
        router.push('/auth/signin')
      }
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account aanmaken
          </h1>
          <p className="text-gray-600">
            Start vandaag nog met TailTribe
          </p>
        </div>

        {/* Referral Banner */}
        {referralInfo && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Uitgenodigd door {referralInfo.referrerName}</p>
                <p className="text-sm text-emerald-100">
                  Ontvang €{referralInfo.rewardAmount} credit na je eerste boeking
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Ik wil me registreren als
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'OWNER'
                    ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.role === 'OWNER' 
                      ? 'bg-emerald-600' 
                      : 'bg-gray-200'
                  }`}>
                    <svg className={`w-5 h-5 ${formData.role === 'OWNER' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className={`font-semibold text-sm ${formData.role === 'OWNER' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    Eigenaar
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'CAREGIVER' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'CAREGIVER'
                    ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.role === 'CAREGIVER' 
                      ? 'bg-emerald-600' 
                      : 'bg-gray-200'
                  }`}>
                    <svg className={`w-5 h-5 ${formData.role === 'CAREGIVER' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className={`font-semibold text-sm ${formData.role === 'CAREGIVER' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    Verzorger
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                Voornaam <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value })
                  if (touched.firstName) validateField('firstName', e.target.value)
                }}
                onBlur={() => {
                  setTouched({ ...touched, firstName: true })
                  validateField('firstName', formData.firstName)
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
                  errors.firstName && touched.firstName
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                placeholder="Jan"
              />
              {errors.firstName && touched.firstName && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                Achternaam <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value })
                  if (touched.lastName) validateField('lastName', e.target.value)
                }}
                onBlur={() => {
                  setTouched({ ...touched, lastName: true })
                  validateField('lastName', formData.lastName)
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
                  errors.lastName && touched.lastName
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
                placeholder="Janssen"
              />
              {errors.lastName && touched.lastName && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              E-mailadres <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (touched.email) validateField('email', e.target.value)
              }}
              onBlur={() => {
                setTouched({ ...touched, email: true })
                validateField('email', formData.email)
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
                errors.email && touched.email
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="naam@voorbeeld.be"
            />
            {errors.email && touched.email && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Wachtwoord <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (touched.password) validateField('password', e.target.value)
              }}
              onBlur={() => {
                setTouched({ ...touched, password: true })
                validateField('password', formData.password)
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-all ${
                errors.password && touched.password
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="Minimaal 6 karakters"
            />
            {errors.password && touched.password ? (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Gebruik letters, cijfers en symbolen</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || (Object.keys(errors).length > 0)}
            className={`w-full h-12 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all mt-6 ${
              loading || (Object.keys(errors).length > 0)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Account wordt aangemaakt...</span>
              </div>
            ) : (
              'Account aanmaken'
            )}
          </Button>
          
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-semibold">Los eerst de volgende fouten op:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </form>


        {/* Test Mode Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 text-center">Ontwikkelaar modus:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillTestOwner}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded font-medium transition-colors border border-gray-300"
            >
              Test Eigenaar
            </button>
            <button
              type="button"
              onClick={fillTestCaregiver}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded font-medium transition-colors border border-gray-300"
            >
              Test Verzorger
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Heb je al een account?{' '}
            <Link href="/auth/signin" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Inloggen
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Door een account aan te maken ga je akkoord met onze{' '}
            <Link href="/terms" className="text-emerald-600 hover:underline font-medium">
              Algemene Voorwaarden
            </Link>{' '}
            en{' '}
            <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">
              Privacybeleid
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
