import { prisma } from "@/lib/prisma"
import type { PaymentMethod } from "@prisma/client"
import { validateCoupon, claimCouponUse } from "./coupon.service"
import { initiatePayment } from "./payment.service"

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  commune: string
  address: string
  notes?: string
}

interface CreateOrderInput {
  customerInfo: CustomerInfo
  deliveryZoneId: string
  paymentMethod: string
  deliveryType?: "J0" | "J1"
  items: { variantId: string; quantity: number }[]
  couponCode?: string
  userId?: string
}

const RESERVATION_TTL_MINUTES = 10

// Génère un orderNumber collision-free via séquence PostgreSQL atomique.
// nextval('order_number_seq') est garanti unique et croissant, même sous concurrence élevée.
// Format: KA-YYYY-000001 (zéro-padé à 6 chiffres, max ~999 999 commandes par an).
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await prisma.$queryRaw<[{ n: bigint }]>`
    SELECT nextval('order_number_seq') AS n
  `
  const seq = String(result[0].n).padStart(6, "0")
  return `KA-${year}-${seq}`
}

export async function createOrder(input: CreateOrderInput) {
  const { customerInfo, deliveryZoneId, paymentMethod, deliveryType = "J1", items, couponCode, userId } = input

  // 1. Valider le coupon si présent (avant la transaction pour éviter d'y entrer inutilement)
  let discount = 0
  let couponId: string | undefined
  let couponMaxUses: number | null | undefined
  let validatedCode: string | undefined

  // 2. Récupérer la zone de livraison
  const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } })
  if (!zone) throw new Error("Zone de livraison introuvable")

  const deliveryFee = deliveryType === "J0" ? zone.priceJ0 : zone.priceJ1
  const reservedUntil = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000)

  // 3. Créer la commande en transaction — vérification du stock à l'intérieur pour éviter le TOCTOU
  const order = await prisma.$transaction(async (tx) => {
    // Vérification stock et calcul sous-total dans la transaction
    const variantIds = items.map((i) => i.variantId)
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: { product: { select: { id: true, name: true, slug: true } } },
    })

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)
      if (!variant) throw new Error(`Produit introuvable`)
      const available = variant.stock - variant.reservedStock
      if (available < item.quantity) {
        throw new Error(`Stock insuffisant pour "${variant.product.name}" (${variant.name})`)
      }
    }

    let subtotal = 0
    for (const item of items) {
      subtotal += variants.find((v) => v.id === item.variantId)!.price * item.quantity
    }

    // Valider le coupon dans la transaction pour cohérence
    if (couponCode) {
      const result = await validateCoupon(couponCode, subtotal, userId)
      if (!result.valid) throw new Error(result.error)
      discount = result.discount
      couponId = result.couponId
      couponMaxUses = result.maxUses
      validatedCode = result.code
    }

    const total = subtotal - discount + deliveryFee
    const orderNumber = await generateOrderNumber()

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        zoneId:          zone.id,
        deliveryType,
        guestFirstName:  customerInfo.firstName,
        guestLastName:   customerInfo.lastName,
        guestEmail:      customerInfo.email,
        guestPhone:      customerInfo.phone,
        deliveryAddress: customerInfo.address,
        deliveryCommune: customerInfo.commune,
        notes:           customerInfo.notes,
        subtotal,
        deliveryFee,
        discount,
        total,
        couponCode:      validatedCode,
        reservedUntil,
        items: {
          create: items.map((item) => {
            const v = variants.find((v) => v.id === item.variantId)!
            return {
              productId:   v.product.id,
              variantId:   v.id,
              productName: v.product.name,
              variantName: v.name,
              sku:         v.sku,
              unitPrice:   v.price,
              quantity:    item.quantity,
              total:       v.price * item.quantity,
            }
          }),
        },
        payments: {
          create: {
            provider: "jeko-africa",
            method:   paymentMethod as PaymentMethod,
            amount:   total,
          },
        },
      },
    })

    // Réserver le stock
    await Promise.all([
      ...items.map((item) =>
        tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { increment: item.quantity } },
        })
      ),
      ...items.map((item) =>
        tx.stockReservation.create({
          data: {
            variantId: item.variantId,
            orderId:   newOrder.id,
            quantity:  item.quantity,
            expiresAt: reservedUntil,
          },
        })
      ),
    ])

    // Enregistrer l'usage du coupon — incrément atomique avec guard sur maxUses (#06)
    if (couponId) {
      const claimed = couponMaxUses != null
        ? await tx.coupon.updateMany({
            where: { id: couponId, usedCount: { lt: couponMaxUses } },
            data:  { usedCount: { increment: 1 } },
          })
        : await tx.coupon.updateMany({
            where: { id: couponId },
            data:  { usedCount: { increment: 1 } },
          })

      if (couponMaxUses != null && claimed.count === 0) {
        throw new Error("Ce code promo a atteint sa limite d'utilisation.")
      }

      // CouponUsage uniquement pour les utilisateurs authentifiés (contrainte @@unique)
      if (userId) {
        await tx.couponUsage.create({
          data: { couponId, userId, orderId: newOrder.id },
        })
      }
    }

    return newOrder
  })

  // 4. Initier le paiement Jeko Africa
  const jekoPayment = await initiatePayment({
    orderId:      order.id,
    orderNumber:  order.orderNumber,
    amountCents:  order.total,         // XOF = centimes (1 FCFA = 1 centime Jeko)
    method:       paymentMethod as PaymentMethod,
    successUrl:   `${process.env.NEXTAUTH_URL}/confirmation/${order.id}`,
    errorUrl:     `${process.env.NEXTAUTH_URL}/checkout/paiement?orderId=${order.id}&erreur=1`,
  })

  await prisma.payment.updateMany({
    where: { orderId: order.id, status: "PENDING" },
    data:  { transactionId: jekoPayment.id },
  })

  return { orderId: order.id, paymentUrl: jekoPayment.redirectUrl }
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })
}
