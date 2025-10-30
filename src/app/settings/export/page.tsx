export default function ExportDataPage() {
  const sample = {
    user: { name: 'Jan Vermeersch', email: 'jan@example.com' },
    bookings: 3,
    reviews: 2,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Data Exporteren</h1>
          <a href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Instellingen</a>
        </div>

        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur p-6 shadow-xl">
          <p className="text-gray-700 mb-4 text-sm">Download een export van jouw gegevens in JSON-indeling.</p>
          <div className="flex gap-3">
            <a
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(sample, null, 2))}`}
              download="export.json"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm shadow"
            >
              Download JSON
            </a>
            <a href="/settings" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Terug</a>
          </div>
        </div>
      </div>
    </div>
  )
}


