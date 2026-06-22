import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export interface RateLimitRule {
  max: number
  windowMs: number
}

export const LIMITS = {
  orders:     { max: 5,  windowMs: 60_000 } as RateLimitRule,
  coupon:     { max: 10, windowMs: 60_000 } as RateLimitRule,
  contact:    { max: 3,  windowMs: 60_000 } as RateLimitRule,
  newsletter: { max: 3,  windowMs: 60_000 } as RateLimitRule,
  cart:       { max: 60, windowMs: 60_000 } as RateLimitRule,
  webhook:    { max: 30, windowMs: 60_000 } as RateLimitRule,
} as const

// ─── In-memory fallback (dev / single instance) ───────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

let lastCleanup = Date.now()
function maybeCleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < 5 * 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export function checkRateLimit(
  key: string,
  rule: RateLimitRule
): { limited: boolean; remaining: number; resetIn: number } {
  maybeCleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + rule.windowMs })
    return { limited: false, remaining: rule.max - 1, resetIn: rule.windowMs }
  }

  entry.count++
  const remaining = Math.max(0, rule.max - entry.count)
  const resetIn = Math.ceil((entry.resetAt - now) / 1000)
  return { limited: entry.count > rule.max, remaining, resetIn }
}

// ─── Upstash Redis sliding window (production, multi-instance) ──

async function checkRateLimitRedis(
  key: string,
  rule: RateLimitRule
): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
  const { Redis } = await import("@upstash/redis")
  const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const windowSec = Math.ceil(rule.windowMs / 1000)
  const now = Date.now()
  const windowStart = now - rule.windowMs

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, windowStart)
  pipeline.zadd(key, { score: now, member: String(now) })
  pipeline.zcard(key)
  pipeline.expire(key, windowSec * 2)

  const results = await pipeline.exec()
  const count = (results[2] as number) ?? 1
  const remaining = Math.max(0, rule.max - count)

  return { limited: count > rule.max, remaining, resetIn: windowSec }
}

// ─── Unified entry point ─────────────────────────────────────

async function rateLimitCheck(
  key: string,
  rule: RateLimitRule
): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await checkRateLimitRedis(key, rule)
    } catch {
      // Redis unavailable — degrade gracefully to in-memory
    }
  }
  return checkRateLimit(key, rule)
}

// ─── Helpers ─────────────────────────────────────────────────

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown"
  )
}

export function rateLimitedResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
    {
      status: 429,
      headers: {
        "Retry-After":           String(resetIn),
        "X-RateLimit-Remaining": "0",
      },
    }
  )
}

export async function applyRateLimitAsync(
  req: NextRequest,
  keyPrefix: string,
  rule: RateLimitRule
): Promise<NextResponse | null> {
  const ip  = getClientIp(req)
  const key = `rl:${keyPrefix}:${ip}`
  const { limited, resetIn } = await rateLimitCheck(key, rule)
  return limited ? rateLimitedResponse(resetIn) : null
}

export function applyRateLimit(
  req: NextRequest,
  keyPrefix: string,
  rule: RateLimitRule
): NextResponse | null {
  const ip  = getClientIp(req)
  const key = `rl:${keyPrefix}:${ip}`
  const { limited, resetIn } = checkRateLimit(key, rule)
  return limited ? rateLimitedResponse(resetIn) : null
}
