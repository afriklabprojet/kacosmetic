import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn() },
    payment: { findFirst: vi.fn() },
  },
}))

import { GET } from "@/app/api/payment/status/route"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const mockAuth = vi.mocked(auth)
const mockOrderFindUnique = vi.mocked(prisma.order.findUnique)
const mockPaymentFindFirst = vi.mocked(prisma.payment.findFirst)

function makeRequest(orderId?: string) {
  const url = orderId
    ? `http://localhost/api/payment/status?orderId=${orderId}`
    : "http://localhost/api/payment/status"
  return new NextRequest(url)
}

describe("GET /api/payment/status — IDOR protection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPaymentFindFirst.mockResolvedValue({ status: "SUCCESS" } as never)
  })

  it("returns 400 when orderId is missing", async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(400)
  })

  it("returns 404 when order does not exist", async () => {
    mockAuth.mockResolvedValue(null as never)
    mockOrderFindUnique.mockResolvedValue(null)
    const res = await GET(makeRequest("non-existent-id"))
    expect(res.status).toBe(404)
  })

  it("allows guest to see guest order (no userId)", async () => {
    mockAuth.mockResolvedValue(null as never)
    mockOrderFindUnique.mockResolvedValue({
      status: "CONFIRMED",
      orderNumber: "KA-2026-ABC123",
      userId: null,
      guestEmail: "guest@example.com",
    } as never)
    const res = await GET(makeRequest("order-123"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.orderStatus).toBe("CONFIRMED")
  })

  it("allows order owner to see their order", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", role: "USER" } } as never)
    mockOrderFindUnique.mockResolvedValue({
      status: "PENDING",
      orderNumber: "KA-2026-XYZ",
      userId: "user-1",
      guestEmail: null,
    } as never)
    const res = await GET(makeRequest("order-456"))
    expect(res.status).toBe(200)
  })

  it("blocks authenticated user from seeing another user's order (IDOR)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "attacker-user", role: "USER" } } as never)
    mockOrderFindUnique.mockResolvedValue({
      status: "CONFIRMED",
      orderNumber: "KA-2026-VICTIM",
      userId: "victim-user",
      guestEmail: null,
    } as never)
    const res = await GET(makeRequest("victim-order-id"))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Commande introuvable")
  })

  it("allows admin to see any order", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } } as never)
    mockOrderFindUnique.mockResolvedValue({
      status: "DELIVERED",
      orderNumber: "KA-2026-ADMIN",
      userId: "some-user",
      guestEmail: null,
    } as never)
    const res = await GET(makeRequest("any-order-id"))
    expect(res.status).toBe(200)
  })
})
