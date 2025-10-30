'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function SignInContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const [userType, setUserType] = useState<'owner' | 'caregiver' | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleGoogleSignIn = async () => {
    if (!userType) {
      toast.error('Selecteer eerst of je eigenaar of verzorger bent')
      return
    }
    
    setLoading('google')
    try {
      await signIn('google', { 
        callbackUrl: `${callbackUrl}?role=${userType}`,
        redirect: true 
      })
    } catch (error) {
      toast.error('Er ging iets mis bij het inloggen')
      setLoading(null)
    }
  }

  const handleEmailSignIn = async () => {
    if (!userType) {
      toast.error('Selecteer eerst of je eigenaar of verzorger bent')
      return
    }
    
    setLoading('email')
    // For now, redirect to Google since that's the preferred method
    await handleGoogleSignIn()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Left Side - Branding (3 columns) */}
          <div className="lg:col-span-3 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-40 h-40 border border-white/20 rounded-full"></div>
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-start pt-12">
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-center lg:text-left leading-tight">
                Verbind eigenaren <br />
                met verzorgers
              </h1>
              
              <p className="text-xl text-emerald-100 mb-12 text-center lg:text-left leading-relaxed">
                Het vertrouwde platform voor professionele dierenverzorging in België
              </p>

              {/* Stats verwijderd tot live data beschikbaar is */}

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-emerald-100">Geverifieerde profielen</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-emerald-100">Binnen 24 uur geboekt</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-emerald-100">Hoge beoordeling door gebruikers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form (2 columns) */}
          <div className="lg:col-span-2 p-12 bg-gradient-to-br from-white to-gray-50">
            <div className="max-w-sm mx-auto h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Welkom terug
                </h2>
                <p className="text-gray-600 text-lg">
                  Log in om door te gaan naar je dashboard
                </p>
              </div>

              {/* User Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-800 mb-4">
                  Ik ben een:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('owner')}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                      userType === 'owner'
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm font-bold">H</span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Ik zoek verzorging</div>
                        <div className="text-sm text-emerald-600 font-medium">Voor mijn huisdier</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setUserType('caregiver')}
                    className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                      userType === 'caregiver'
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm font-bold">V</span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Ik bied verzorging aan</div>
                        <div className="text-sm text-emerald-600 font-medium">Professionele dierenzorg</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Login Buttons */}
              <div className="space-y-4">
                {/* Google Login */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading === 'google' || !userType}
                  className="w-full h-14 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  {loading === 'google' ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                      Inloggen...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        width={20}
                        height={20}
                      />
                      <span>Doorgaan met Google</span>
                    </div>
                  )}
                </Button>
                
                {/* Demo Login Links */}
                <div className="mt-6 space-y-3">
                  <div className="text-center text-sm text-gray-500 mb-3">
                    Voor testen - Direct inloggen:
                  </div>
                  <a
                    href="/dashboard"
                    className="w-full bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 block text-center no-underline"
                  >
                    Test als Eigenaar
                  </a>
                  <a
                    href="/dashboard"
                    className="w-full bg-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-all duration-300 block text-center no-underline"
                  >
                    Test als Verzorger
                  </a>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-gray-300 w-full"></div>
                  <div className="bg-white px-4 text-sm text-gray-500 font-medium">
                    of
                  </div>
                </div>

                {/* Email Login */}
                <Button
                  onClick={handleEmailSignIn}
                  disabled={loading === 'email' || !userType}
                  variant="outline"
                  className="w-full h-14 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-semibold rounded-2xl transition-all duration-300"
                >
                  {loading === 'email' ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                      Versturen...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">@</span>
                      <span>Doorgaan met e-mail</span>
                    </div>
                  )}
                </Button>
              </div>

              {!userType && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-amber-600">!</span>
                    <span className="font-semibold text-sm">Selecteer eerst je rol</span>
                  </div>
                  <p className="text-amber-600 text-sm mt-1">
                    Kies of je eigenaar of verzorger bent om door te gaan
                  </p>
                </div>
              )}

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Nog geen account?
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-lg hover:scale-105 transition-all duration-300"
                >
                  <span>+</span>
                  <span>Gratis account aanmaken</span>
                </Link>
              </div>

              {/* Security & Trust */}
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 mb-3">
                    <span className="text-xl">🔐</span>
                    <span className="font-bold">Maximale Veiligheid</span>
                  </div>
                  <div className="flex justify-center gap-6 text-sm text-emerald-600">
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>SSL Versleuteld</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>Privacy Beschermd</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div className="mt-6 text-center">
                <Link 
                  href="/"
                  className="text-gray-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  ← Terug naar home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Inlogpagina wordt geladen...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
