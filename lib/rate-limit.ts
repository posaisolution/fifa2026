type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

interface RateLimitOptions {
  max: number
  windowMs: number
}

export function checkRateLimit(key: string, { max, windowMs }: RateLimitOptions): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= max) return true

  entry.count++
  return false
}
