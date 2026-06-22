import { describe, it, expect, beforeEach } from "vitest"
import { checkRateLimit, type RateLimitRule } from "@/lib/rate-limit"

// Reset the module store between tests by using a unique key prefix each run
let counter = 0
function freshKey() {
  return `test:${Date.now()}:${++counter}`
}

const rule: RateLimitRule = { max: 3, windowMs: 60_000 }

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit(freshKey(), rule)
    expect(result.limited).toBe(false)
    expect(result.remaining).toBe(2)
  })

  it("allows requests up to the limit", () => {
    const key = freshKey()
    checkRateLimit(key, rule) // 1
    checkRateLimit(key, rule) // 2
    const result = checkRateLimit(key, rule) // 3
    expect(result.limited).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("blocks requests over the limit", () => {
    const key = freshKey()
    checkRateLimit(key, rule) // 1
    checkRateLimit(key, rule) // 2
    checkRateLimit(key, rule) // 3
    const result = checkRateLimit(key, rule) // 4 — over limit
    expect(result.limited).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it("resets after window expires", () => {
    const key = freshKey()
    // Use a tiny windowMs so the entry is guaranteed expired after 1ms passes
    const shortRule: RateLimitRule = { max: 1, windowMs: 1 }
    checkRateLimit(key, shortRule) // 1 — fills window
    checkRateLimit(key, shortRule) // 2 — limited

    // Spin-wait 5ms to ensure the 1ms window has passed
    const until = Date.now() + 5
    while (Date.now() < until) { /* busy wait */ }

    const result = checkRateLimit(key, shortRule)
    expect(result.limited).toBe(false)
  })

  it("returns positive resetIn for active window", () => {
    const key = freshKey()
    checkRateLimit(key, rule)
    checkRateLimit(key, rule)
    checkRateLimit(key, rule)
    const result = checkRateLimit(key, rule)
    expect(result.resetIn).toBeGreaterThan(0)
  })

  it("independent keys don't affect each other", () => {
    const keyA = freshKey()
    const keyB = freshKey()
    checkRateLimit(keyA, rule)
    checkRateLimit(keyA, rule)
    checkRateLimit(keyA, rule)
    checkRateLimit(keyA, rule) // A is limited

    const result = checkRateLimit(keyB, rule) // B is untouched
    expect(result.limited).toBe(false)
    expect(result.remaining).toBe(2)
  })
})
