import { NextRequest, NextResponse } from "next/server"
import { validateCoupon } from "@/lib/services/coupon.service"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "coupon", LIMITS.coupon)
  if (rl) return rl

  try {
    const body = await req.json() as { code?: string; subtotal?: number }
    const { code, subtotal } = body

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ valid: false, error: "Paramètres invalides" }, { status: 400 })
    }

    const result = await validateCoupon(code.trim().toUpperCase(), subtotal)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, error: "Erreur serveur" }, { status: 500 })
  }
}
