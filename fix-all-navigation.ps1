# Fix all sub-pages with consistent green Dashboard button

$pages = @(
    'src\app\bookings\page.tsx',
    'src\app\reviews\page.tsx',
    'src\app\schedule\page.tsx',
    'src\app\pets\page.tsx'
)

$standardHeader = @'
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">TITLE_PLACEHOLDER</h1>
              <p className="text-gray-600">DESC_PLACEHOLDER</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors rounded-lg font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
'@

Write-Host "Standardizing headers across all pages..." -ForegroundColor Green
foreach ($page in $pages) {
    Write-Host "  - $page" -ForegroundColor Yellow
}





