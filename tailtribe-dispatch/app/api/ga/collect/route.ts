import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type MpEvent = {
  name: string
  params?: Record<string, any>
}

type MpPayload = {
  client_id: string
  events: MpEvent[]
  user_id?: string
  timestamp_micros?: number
}

export async function POST(req: Request) {
  const measurementId = String(process.env.GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID ?? '').trim()
  const apiSecret = String(process.env.GA_API_SECRET ?? '').trim()

  if (!measurementId) {
    return NextResponse.json({ ok: false, error: 'Missing GA_MEASUREMENT_ID (or NEXT_PUBLIC_GA_ID).' }, { status: 500 })
  }
  if (!apiSecret) {
    return NextResponse.json({ ok: false, error: 'Missing GA_API_SECRET (Measurement Protocol).' }, { status: 500 })
  }

  let body: MpPayload
  try {
    body = (await req.json()) as MpPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  if (!body?.client_id || typeof body.client_id !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing client_id.' }, { status: 400 })
  }
  if (!Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json({ ok: false, error: 'Missing events.' }, { status: 400 })
  }

  const url = new URL('https://www.google-analytics.com/mp/collect')
  url.searchParams.set('measurement_id', measurementId)
  url.searchParams.set('api_secret', apiSecret)

  // Forward MP payload server-side (first-party) to bypass client-side blocks.
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Preserve UA for slightly better debug/attribution.
      'user-agent': req.headers.get('user-agent') ?? '',
    },
    body: JSON.stringify({
      client_id: body.client_id,
      user_id: body.user_id,
      timestamp_micros: body.timestamp_micros,
      events: body.events,
    }),
  })

  // GA MP returns 204 on success. We don't expose details to the client.
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'Upstream GA error.' }, { status: 502 })
  }

  return new NextResponse(null, { status: 204 })
}

