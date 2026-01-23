const DEFAULT_TZ = 'Europe/Brussels'

// Start times per tijdsblok (covers EN + NL labels we use)
const TIME_WINDOW_STARTS: Record<string, string> = {
  MORNING: '07:00',
  AFTERNOON: '12:00',
  EVENING: '18:00',
  NIGHT: '22:00',
  ochtend: '07:00',
  middag: '11:00',
  avond: '15:00',
  nacht: '22:00',
}

type ValidateOpts = {
  date: string // YYYY-MM-DD
  timeWindow?: string
  time?: string // HH:MM
  timeZone?: string
}

type ValidateResult =
  | { ok: true; slotStart: Date }
  | { ok: false; reason: string }

const TZ_NAME_REGEX = /GMT([+-]\d{1,2})(?::(\d{2}))?/

function getOffsetMinutes(date: Date, timeZone: string): number {
  // Returns minutes to add to local time to get UTC (standard JS definition)
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
  const m = tzName.match(TZ_NAME_REGEX)
  if (!m) return 0
  const hours = Number(m[1])
  const minutes = m[2] ? Number(m[2]) : 0
  return hours * 60 + minutes * (hours >= 0 ? 1 : -1)
}

function resolveStartTime(timeWindow?: string, time?: string): string | null {
  if (time && /^\d{2}:\d{2}$/.test(time)) return time
  if (timeWindow && TIME_WINDOW_STARTS[timeWindow]) return TIME_WINDOW_STARTS[timeWindow]
  return null
}

function slotStartUtc({ date, timeWindow, time, timeZone = DEFAULT_TZ }: ValidateOpts): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const startTime = resolveStartTime(timeWindow, time)
  if (!startTime) return null
  const [hh, mm] = startTime.split(':').map(Number)
  const [y, m, d] = date.split('-').map(Number)
  // Build the local (wall-clock) time as UTC, then subtract the TZ offset at that instant to get real UTC
  const localAsUtc = Date.UTC(y, m - 1, d, hh, mm, 0, 0)
  const offsetMinutes = getOffsetMinutes(new Date(localAsUtc), timeZone)
  return new Date(localAsUtc - offsetMinutes * 60_000)
}

function nowInZoneUtc(timeZone = DEFAULT_TZ): Date {
  const nowUtc = new Date()
  const offsetMinutes = getOffsetMinutes(nowUtc, timeZone)
  return new Date(nowUtc.getTime() - offsetMinutes * 60_000)
}

export function getTodayStringInZone(timeZone = DEFAULT_TZ): string {
  const nowLocalUtc = nowInZoneUtc(timeZone)
  const yyyy = nowLocalUtc.getUTCFullYear()
  const mm = String(nowLocalUtc.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(nowLocalUtc.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function validateNotInPast(opts: ValidateOpts): ValidateResult {
  const timeZone = opts.timeZone ?? DEFAULT_TZ
  const slotStart = slotStartUtc({ ...opts, timeZone })
  if (!slotStart) {
    return { ok: false, reason: 'Ongeldige datum of tijd' }
  }

  const now = nowInZoneUtc(timeZone)
  if (slotStart.getTime() < now.getTime()) {
    return { ok: false, reason: 'Datum ligt in het verleden' }
  }

  return { ok: true, slotStart }
}

export function assertSlotNotInPast(opts: ValidateOpts): { slotStart: Date } {
  const result = validateNotInPast(opts)
  if (!result.ok) {
    throw new Error(result.reason)
  }
  return { slotStart: result.slotStart }
}
