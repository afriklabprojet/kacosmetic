import { describe, it, expect, vi } from "vitest"

// canTransition is pure — mock heavy side-effect modules so the test stays unit-level
vi.mock("@/lib/prisma", () => ({ prisma: {} }))
vi.mock("@/lib/services/invoice.service", () => ({ generateInvoice: vi.fn() }))
vi.mock("@/lib/services/notification.service", () => ({
  notifyOrderConfirmed: vi.fn(),
  notifyOrderInDelivery: vi.fn(),
  notifyOrderDelivered: vi.fn(),
}))

import { canTransition } from "@/lib/order-state-machine"

describe("canTransition", () => {
  it("allows PENDING → CONFIRMED", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true)
  })

  it("allows PENDING → CANCELLED", () => {
    expect(canTransition("PENDING", "CANCELLED")).toBe(true)
  })

  it("allows CONFIRMED → PREPARING", () => {
    expect(canTransition("CONFIRMED", "PREPARING")).toBe(true)
  })

  it("allows PREPARING → IN_DELIVERY", () => {
    expect(canTransition("PREPARING", "IN_DELIVERY")).toBe(true)
  })

  it("allows IN_DELIVERY → DELIVERED", () => {
    expect(canTransition("IN_DELIVERY", "DELIVERED")).toBe(true)
  })

  it("blocks DELIVERED → any state", () => {
    expect(canTransition("DELIVERED", "CANCELLED")).toBe(false)
    expect(canTransition("DELIVERED", "CONFIRMED")).toBe(false)
    expect(canTransition("DELIVERED", "PENDING")).toBe(false)
  })

  it("blocks CANCELLED → any state", () => {
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false)
    expect(canTransition("CANCELLED", "DELIVERED")).toBe(false)
    expect(canTransition("CANCELLED", "PENDING")).toBe(false)
  })

  it("blocks PENDING → DELIVERED (skipping steps)", () => {
    expect(canTransition("PENDING", "DELIVERED")).toBe(false)
  })

  it("blocks PENDING → IN_DELIVERY (skipping steps)", () => {
    expect(canTransition("PENDING", "IN_DELIVERY")).toBe(false)
  })

  it("blocks CONFIRMED → DELIVERED (skipping PREPARING)", () => {
    expect(canTransition("CONFIRMED", "DELIVERED")).toBe(false)
  })

  it("blocks IN_DELIVERY → CANCELLED", () => {
    expect(canTransition("IN_DELIVERY", "CANCELLED")).toBe(false)
  })
})
