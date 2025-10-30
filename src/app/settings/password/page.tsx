'use client'

import Link from 'next/link'

export default function PasswordSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Wachtwoord & Veiligheid</h1>
              <p className="text-gray-600">Wijzig je wachtwoord en beveiligingsinstellingen</p>
            </div>
            <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors rounded-lg font-medium">
              Terug naar Instellingen
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Wachtwoord wijzigen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Huidig wachtwoord</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nieuw wachtwoord</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bevestig nieuw wachtwoord</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>

            <div className="pt-4">
              <button className="w-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-colors rounded-lg py-3 font-medium">
                Wachtwoord bijwerken
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800"><strong>💡 Tip:</strong> Gebruik een sterk wachtwoord met minimaal 8 karakters, inclusief hoofdletters, kleine letters en cijfers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
