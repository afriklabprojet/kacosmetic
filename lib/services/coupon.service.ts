import { prisma } from "@/lib/prisma"

type ApplyCouponResult =
  | { valid: true; discount: number; couponId: string; code: string; maxUses: number | null }
  | { valid: false; error: string }

export async function validateCoupon(
  code: string,
  orderSubtotal: number,
  userId?: string
): Promise<ApplyCouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
    include: userId ? { usages: { where: { userId } } } : { usages: false },
  })

  if (!coupon?.isActive) {
    return { valid: false, error: "Code promo invalide ou expiré." }
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "Ce code promo a expiré." }
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Ce code promo a atteint sa limite d'utilisation." }
  }

  const usages = Array.isArray(coupon.usages) ? coupon.usages : []
  if (coupon.singleUsePerCustomer && userId && usages.length > 0) {
    return { valid: false, error: "Vous avez déjà utilisé ce code promo." }
  }

  if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Montant minimum requis : ${coupon.minOrderAmount.toLocaleString("fr-CI")} FCFA.`,
    }
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.round(orderSubtotal * (coupon.value / 100))
      : Math.min(coupon.value, orderSubtotal)

  return { valid: true, discount, couponId: coupon.id, code: coupon.code, maxUses: coupon.maxUses }
}

// Incrémente usedCount de manière atomique uniquement si maxUses n'est pas atteint.
// Retourne false si le coupon est épuisé (race condition gagnée par un concurrent).
export async function claimCouponUse(
  couponId: string,
  maxUses: number | null
): Promise<boolean> {
  if (maxUses === null) {
    await prisma.coupon.update({
      where: { id: couponId },
      data:  { usedCount: { increment: 1 } },
    })
    return true
  }

  const result = await prisma.coupon.updateMany({
    where: { id: couponId, usedCount: { lt: maxUses } },
    data:  { usedCount: { increment: 1 } },
  })

  return result.count > 0
}

export async function seedBienvenue10Coupon(): Promise<void> {
  await prisma.coupon.upsert({
    where: { code: "BIENVENUE10" },
    update: {},
    create: {
      code:                 "BIENVENUE10",
      type:                 "PERCENTAGE",
      value:                10,
      singleUsePerCustomer: true,
      isActive:             true,
    },
  })
}
