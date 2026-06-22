import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { transitionOrder } from "@/lib/order-state-machine"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.JEKO_WEBHOOK_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    )
  } catch {
    return false
  }
}

interface JekoWebhookPayload {
  event: string
  data: {
    id: string
    amount: { amount: number; currency: string }
    fees: { amount: number; currency: string }
    status: "success" | "error"
    counterpartLabel: string
    counterpartIdentifier: string
    paymentMethod: string
    transactionType: "payment" | "transfer"
    businessName: string
    storeName: string
    transactionDetails?: {
      id: string           // payment_request id
      reference: string    // notre orderNumber (KA-XXXX-XXXX)
      paymentLinkId?: string
    }
  }
  timestamp: string
}

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "webhook", LIMITS.webhook)
  if (rl) return rl

  const rawBody = await req.text()
  const signature = req.headers.get("jeko-signature") ?? ""

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: JekoWebhookPayload
  try {
    payload = JSON.parse(rawBody) as JekoWebhookPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (payload.event !== "transaction.completed") {
    return NextResponse.json({ received: true })
  }

  const { data } = payload
  if (data.transactionType !== "payment") {
    return NextResponse.json({ received: true })
  }

  const paymentRequestId = data.transactionDetails?.id
  const orderNumber      = data.transactionDetails?.reference

  if (!paymentRequestId && !orderNumber) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 })
  }

  // Retrouver le paiement par transactionId (payment_request id) ou reference (orderNumber)
  const payment = await prisma.payment.findFirst({
    where: paymentRequestId
      ? { transactionId: paymentRequestId }
      : { order: { orderNumber } },
    include: { order: true },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  const { order } = payment
  const isSuccess = data.status === "success"

  // Vérifier que le montant payé correspond au montant attendu (tolérance 1 FCFA arrondi)
  if (isSuccess) {
    const paidAmount = data.amount?.amount ?? 0
    if (Math.abs(paidAmount - payment.amount) > 1) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 422 })
    }
  }

  // Idempotence atomique — UPDATE WHERE status='PENDING' garantit qu'un seul worker traite le webhook
  const claimed = await prisma.payment.updateMany({
    where: { id: payment.id, status: "PENDING" },
    data: {
      status:         isSuccess ? "SUCCESS" : "FAILED",
      webhookPayload: payload as object,
    },
  })
  if (claimed.count === 0) {
    return NextResponse.json({ received: true })
  }

  if (isSuccess && order.status === "PENDING") {
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })

    // Décrémentation stock + libération réservation en transaction atomique
    await prisma.$transaction([
      ...items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock:         { decrement: item.quantity },
            reservedStock: { decrement: item.quantity },
          },
        })
      ),
      prisma.stockReservation.updateMany({
        where: { orderId: order.id },
        data: { released: true },
      }),
    ])

    // Transition de statut (inclut sa propre transaction interne)
    await transitionOrder(order.id, "CONFIRMED", "Paiement confirmé par Jeko Africa")

    // Mise à jour popularityScore hors transaction critique (best-effort)
    const scoresByProduct = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity
      return acc
    }, {})
    await Promise.allSettled(
      Object.entries(scoresByProduct).map(([productId, qty]) =>
        prisma.product.update({
          where: { id: productId },
          data: { popularityScore: { increment: qty } },
        })
      )
    )
  }

  if (!isSuccess && order.status === "PENDING") {
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })

    await prisma.$transaction([
      prisma.stockReservation.updateMany({
        where: { orderId: order.id },
        data: { released: true },
      }),
      ...items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { decrement: item.quantity } },
        })
      ),
    ])

    await transitionOrder(order.id, "CANCELLED", "Paiement échoué via Jeko Africa")
  }

  return NextResponse.json({ received: true })
}
