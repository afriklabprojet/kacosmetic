import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { transitionOrder } from "@/lib/order-state-machine"

function verifyCronSecret(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const expected = `Bearer ${secret}`
  const actual = authHeader ?? ""
  if (actual.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  } catch {
    return false
  }
}

// Vercel Cron : */5 * * * *
// Header Authorization: Bearer $CRON_SECRET
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  // Trouver les réservations expirées non libérées
  const expired = await prisma.stockReservation.findMany({
    where: { expiresAt: { lt: now }, released: false },
    include: { variant: true },
  })

  if (!expired.length) {
    return NextResponse.json({ released: 0 })
  }

  const orderIds = [...new Set(expired.map((r) => r.orderId))]

  let released = 0
  for (const orderId of orderIds) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.status !== "PENDING") continue

    await transitionOrder(orderId, "CANCELLED", "Délai de paiement expiré (TTL 10min)")

    const orderReservations = expired.filter((r) => r.orderId === orderId)
    await Promise.all([
      prisma.stockReservation.updateMany({
        where: { orderId, released: false },
        data: { released: true },
      }),
      ...orderReservations.map((r) =>
        prisma.productVariant.update({
          where: { id: r.variantId },
          data: { reservedStock: { decrement: r.quantity } },
        })
      ),
    ])
    released++
  }

  return NextResponse.json({ released, ordersCancelled: released })
}
