import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { validateCoupon } from "@/lib/services/coupon.service"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  subtotal: z.number().int().min(0),
})

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "coupon", LIMITS.coupon)
  if (rl) return rl

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ valid: false, error: "Corps JSON invalide" }, { status: 400 })
  }

  const parsed = validateCouponSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Paramètres invalides" }, { status: 400 })
  }

  try {
    const result = await validateCoupon(parsed.data.code.trim().toUpperCase(), parsed.data.subtotal)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, error: "Erreur serveur" }, { status: 500 })
  }
}
