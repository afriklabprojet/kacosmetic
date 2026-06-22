import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createOrder } from "@/lib/services/order.service"
import { auth } from "@/lib/auth"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

const customerInfoSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  email:     z.string().email().max(255),
  phone:     z.string().min(8).max(20),
  commune:   z.string().min(1).max(100),
  address:   z.string().min(1).max(300),
  notes:     z.string().max(500).optional(),
})

const orderBodySchema = z.object({
  customerInfo:   customerInfoSchema,
  deliveryZoneId: z.string().cuid(),
  paymentMethod:  z.string().min(1).max(50),
  deliveryType:   z.enum(["J0", "J1"]).optional(),
  items: z.array(
    z.object({
      variantId: z.string().cuid(),
      quantity:  z.number().int().min(1).max(99),
    })
  ).min(1).max(20),
  couponCode: z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "orders", LIMITS.orders)
  if (rl) return rl

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const parsed = orderBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { customerInfo, deliveryZoneId, paymentMethod, deliveryType, items, couponCode } = parsed.data

  try {
    const session = await auth()
    const userId = session?.user?.id

    const result = await createOrder({
      customerInfo,
      deliveryZoneId,
      paymentMethod,
      deliveryType,
      items,
      couponCode,
      userId,
    })

    return NextResponse.json({
      orderId: result.orderId,
      paymentUrl: result.paymentUrl,
    })
  } catch (err) {
    const isUserError = err instanceof Error &&
      (err.message.startsWith("Stock insuffisant") ||
       err.message.startsWith("Produit introuvable") ||
       err.message.startsWith("Zone de livraison") ||
       err.message.startsWith("Code promo") ||
       err.message.startsWith("Ce code promo") ||
       err.message.startsWith("Montant minimum"))
    const status = isUserError ? 422 : 500
    const message = isUserError && err instanceof Error
      ? err.message
      : "Erreur lors de la création de la commande"
    if (!isUserError) {
      console.error("[orders] createOrder error:", err)
    }
    return NextResponse.json({ error: message }, { status })
  }
}
