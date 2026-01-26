const memoryBuckets = new Map<string, number[]>()

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function upstashCmd<T = any>(cmd: any[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Upstash not configured')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Upstash error ${res.status}`)
  const data = await res.json()
  return data?.result as T
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  if (hasUpstash()) {
    try {
      const windowSeconds = Math.ceil(windowMs / 1000)
      const count = await upstashCmd<number>(['INCR', key])
      if (count === 1) {
        await upstashCmd(['EXPIRE', key, windowSeconds])
      }
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
    } catch (err) {
      // If Upstash is misconfigured/unavailable, we must not break critical flows
      // like registration/login. Fall back to the in-memory limiter.
      try {
        console.error('[rate-limit] Upstash unavailable, falling back to memory', {
          key,
          message: (err as any)?.message ?? String(err),
        })
      } catch {
        // ignore
      }
    }
  }

  const now = Date.now()
  const bucket = memoryBuckets.get(key) ?? []
  const recent = bucket.filter((ts) => now - ts < windowMs)
  if (recent.length >= limit) {
    memoryBuckets.set(key, recent)
    return { allowed: false, remaining: 0 }
  }
  recent.push(now)
  memoryBuckets.set(key, recent)
  return { allowed: true, remaining: Math.max(0, limit - recent.length) }
}
