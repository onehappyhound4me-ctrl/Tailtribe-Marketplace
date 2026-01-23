// Quick sanity script: verifies past slots are rejected and future slots allowed.
// Usage: node scripts/past-booking-check.js

const BASE = 'http://localhost:3000/api/bookings'
const SERVICE = 'DOG_WALKING'
const TIME_WINDOW = 'MORNING'

const TZ = 'Europe/Brussels'
const TZ_REGEX = /GMT([+-]\d{1,2})(?::(\d{2}))?/

function getOffsetMinutes(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    timeZoneName: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const parts = fmt.formatToParts(date)
  const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT'
  const m = tzName.match(TZ_REGEX)
  if (!m) return 0
  const hours = Number(m[1])
  const minutes = m[2] ? Number(m[2]) : 0
  return hours * 60 + minutes * (hours >= 0 ? 1 : -1)
}

function brusselsDateParts(deltaDays = 0) {
  const now = new Date()
  const offset = getOffsetMinutes(now, TZ)
  const localNow = new Date(now.getTime() - offset * 60_000)
  localNow.setUTCDate(localNow.getUTCDate() + deltaDays)
  const yyyy = localNow.getUTCFullYear()
  const mm = String(localNow.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(localNow.getUTCDate()).padStart(2, '0')
  return { yyyy, mm, dd, localNow }
}

function oneHourAgoLocalHHMM() {
  const now = new Date()
  const offset = getOffsetMinutes(now, TZ)
  const localNow = new Date(now.getTime() - offset * 60_000)
  localNow.setHours(localNow.getHours() - 1)
  const hh = String(localNow.getHours()).padStart(2, '0')
  const mm = String(localNow.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

async function postBooking(label, payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  console.log(`\n${label}\nstatus=${res.status}\nbody=${text}`)
}

async function run() {
  const { yyyy: yPast, mm: mPast, dd: dPast } = brusselsDateParts(-1)
  const { yyyy: yFuture, mm: mFuture, dd: dFuture } = brusselsDateParts(1)
  const pastTime = oneHourAgoLocalHHMM()

  const common = {
    service: SERVICE,
    timeWindow: TIME_WINDOW,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '000',
    city: 'Antwerpen',
    postalCode: '2000',
    petName: 'Dog',
    petType: 'Dog',
    contactPreference: 'email',
  }

  await postBooking('A) Yesterday -> should FAIL', {
    ...common,
    date: `${yPast}-${mPast}-${dPast}`,
    time: '10:00',
  })

  await postBooking('B) Future -> should PASS', {
    ...common,
    date: `${yFuture}-${mFuture}-${dFuture}`,
    time: '10:00',
  })

  await postBooking('C) Today one hour ago -> should FAIL', {
    ...common,
    date: `${brusselsDateParts(0).yyyy}-${brusselsDateParts(0).mm}-${brusselsDateParts(0).dd}`,
    time: pastTime,
  })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
