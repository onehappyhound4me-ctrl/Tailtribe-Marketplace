export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 mb-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-emerald-200 border border-emerald-400 rounded"></div>
        <span className="text-gray-700">Beschikbaar</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
        <span className="text-gray-700">Geboekt</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-rose-200 border border-rose-400 rounded"></div>
        <span className="text-gray-700">Geblokkeerd</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded opacity-50"></div>
        <span className="text-gray-500">Verleden</span>
      </div>
    </div>
  )
}