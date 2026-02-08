import Link from 'next/link'

export default function GoogleReviewsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-blue-50/40 px-4 py-14">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div
              className="h-10 w-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold select-none pointer-events-none"
              aria-hidden="true"
            >
              i
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviews tijdelijk gepauzeerd</h1>
              <p className="mt-2 text-gray-700 leading-relaxed">
                Deze pagina staat even geparkeerd. We passen eerst de reviews-werking aan en zetten dit later weer aan.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Bedankt voor je begrip.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 text-sm font-semibold transition min-h-[44px] shadow-md hover:from-green-700 hover:to-blue-700"
                >
                  Terug naar start
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition min-h-[44px]"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link href="/" className="underline hover:text-gray-700">
            Naar de homepage
          </Link>
        </div>
      </div>
    </main>
  )
}

