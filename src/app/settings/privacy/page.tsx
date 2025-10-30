'use client'

import Link from 'next/link'

export default function PrivacySettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Privacy & Gegevens</h1>
              <p className="text-gray-600">Beheer je privacy-instellingen en gegevens</p>
            </div>
            <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors rounded-lg font-medium">
              Terug naar Instellingen
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Privacy instellingen</h2>
          
          <div className="space-y-6">
            <div className="pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Profiel zichtbaarheid</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">Maak je profiel zichtbaar in zoekresultaten</p>
            </div>

            <div className="pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Telefoonnummer tonen</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">Laat je telefoonnummer zien op je profiel</p>
            </div>

            <div className="pb-4 border-b">
              <h3 className="font-medium text-gray-800 mb-2">Gegevens downloaden</h3>
              <p className="text-sm text-gray-600 mb-3">Download een kopie van al je gegevens</p>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Download mijn gegevens
              </button>
            </div>

            <div className="pb-4">
              <h3 className="font-medium text-gray-800 mb-2">Cookies en tracking</h3>
              <p className="text-sm text-gray-600 mb-3">Beheer je cookie voorkeuren</p>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Cookie instellingen
              </button>
            </div>

            <div className="pt-4">
              <button className="w-full bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors rounded-lg py-3 font-medium">
                Instellingen opslaan
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800"><strong>🔒 Privacy:</strong> Je gegevens worden veilig opgeslagen en nooit gedeeld met derden zonder je toestemming.</p>
          </div>
        </div>
      </div>
    </div>
  )
}





