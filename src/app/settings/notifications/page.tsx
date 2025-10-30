'use client'

import Link from 'next/link'

export default function NotificationsSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Notificaties</h1>
              <p className="text-gray-600">Beheer je meldingen en communicatievoorkeuren</p>
            </div>
            <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors rounded-lg font-medium">
              Terug naar Instellingen
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Notificatie voorkeuren</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium text-gray-800">Email notificaties</h3>
                <p className="text-sm text-gray-600">Ontvang updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium text-gray-800">Nieuwe berichten</h3>
                <p className="text-sm text-gray-600">Melding bij nieuwe berichten</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium text-gray-800">Boekingen updates</h3>
                <p className="text-sm text-gray-600">Updates over je boekingen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="font-medium text-gray-800">Marketing emails</h3>
                <p className="text-sm text-gray-600">Ontvang tips en aanbiedingen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="pt-4">
              <button className="w-full bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 transition-colors rounded-lg py-3 font-medium">
                Voorkeuren opslaan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





