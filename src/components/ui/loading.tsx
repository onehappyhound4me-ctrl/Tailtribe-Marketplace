export function LoadingSpinner({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-green-200 border-t-green-600 ${sizeClasses[size]} ${className}`} />
  )
}

export function LoadingCard() {
  return (
    <div className="gradient-card rounded-3xl p-8 professional-shadow animate-pulse">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
        <div className="h-3 bg-gray-200 rounded mb-4 w-1/2 mx-auto"></div>
        <div className="flex gap-2 justify-center mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded mb-3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>

          {/* Loading Filters */}
          <div className="gradient-card rounded-3xl p-6 professional-shadow mb-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Loading Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
