export function parseJsonArray(raw: unknown, fallback: string[] = []): string[] {
  if (raw === null || raw === undefined) return fallback
  if (Array.isArray(raw)) return raw.map((v) => String(v))
  if (typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return fallback
    return parsed.map((v) => String(v))
  } catch {
    return fallback
  }
}

export function parseJsonObject<T extends Record<string, any>>(
  raw: unknown,
  fallback: T
): T {
  if (raw === null || raw === undefined) return fallback
  if (typeof raw === 'object') return (raw as T) ?? fallback
  if (typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  try {
    const parsed = JSON.parse(trimmed)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

