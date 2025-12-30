export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-tt p-10 text-center">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Laden…</h1>
          <p className="text-gray-600">Even geduld, we maken alles klaar.</p>
        </div>
      </div>
    </div>
  )
}


