import { db } from '@/lib/db'
import Link from 'next/link'

interface Props { params: { id: string } }

export default async function InvoicePage({ params }: Props) {
  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true, email: true } },
      caregiver: { select: { name: true, email: true } },
    }
  })

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Factuur niet gevonden</p>
          <Link href="/settings/payment" className="text-emerald-700 underline mt-2 inline-block">Terug</Link>
        </div>
      </div>
    )
  }

  const formatEur = (cents: number) => `€${(cents / 100).toFixed(2)}`
  const service = booking.listingId ? 'TailTribe dienst' : 'Dienst'
  const date = new Date(booking.createdAt).toLocaleDateString('nl-BE')
  const platformFeePerc = 0.15
  const platformFee = Math.round(booking.amountCents * platformFeePerc)
  const payout = booking.amountCents - platformFee

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Factuur</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm">Print / Download</button>
            <Link href="/settings/payment" className="text-sm text-gray-600 hover:text-gray-900">Terug</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between mb-6">
            <div>
              <div className="font-semibold">TailTribe</div>
              <div className="text-sm text-gray-600">BE0123.456.789</div>
              <div className="text-sm text-gray-600">steven@tailtribe.be</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Factuurnummer</div>
              <div className="font-semibold">TT-{booking.id.slice(0,8)}</div>
              <div className="text-sm text-gray-600 mt-1">Datum</div>
              <div className="font-semibold">{date}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600">Verzorger</div>
              <div className="font-semibold">{booking.caregiver?.name || 'Verzorger'}</div>
              <div className="text-sm text-gray-600">{booking.caregiver?.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Klant</div>
              <div className="font-semibold">{booking.owner?.name || 'Klant'}</div>
              <div className="text-sm text-gray-600">{booking.owner?.email}</div>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Omschrijving</th>
                <th className="py-2">Datum</th>
                <th className="py-2">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">{service}</td>
                <td className="py-3">{date}</td>
                <td className="py-3">{formatEur(booking.amountCents)}</td>
              </tr>
              <tr>
                <td className="py-3 text-gray-600">Platform provisie (15%)</td>
                <td className="py-3">{date}</td>
                <td className="py-3">- {formatEur(platformFee)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotaal</span>
                <span>{formatEur(booking.amountCents)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Provisie (20%)</span>
                <span>- {formatEur(platformFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                <span>Uit te betalen</span>
                <span>{formatEur(payout)}</span>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700">BTW (eigen opgave):</p>
                <div className="flex justify-between">
                  <span>BTW 21%:</span>
                  <span>€{((payout / 100) * 0.21).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-700">
                  <span>Netto na BTW:</span>
                  <span>€{((payout / 100) * 0.79).toFixed(2)}</span>
                </div>
                <p className="text-xs italic mt-2">
                  * BTW-plichtig vanaf €25.000 omzet/jaar. Raadpleeg je accountant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


