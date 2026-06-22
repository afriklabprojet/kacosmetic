import { prisma } from "@/lib/prisma"

interface GuestCartItem {
  variantId: string
  quantity: number
}

/**
 * Fusionne le panier guest (localStorage) vers le panier DB de l'utilisateur.
 * Les items existants voient leur quantité augmentée (plafonné au stock disponible).
 */
export async function mergeGuestCart(
  userId: string,
  guestItems: GuestCartItem[]
): Promise<void> {
  if (!guestItems.length) return

  const variantIds = guestItems.map((i) => i.variantId)

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    select: { id: true, stock: true, reservedStock: true },
  })

  const availableById = new Map(
    variants.map((v) => [v.id, v.stock - v.reservedStock])
  )

  await prisma.$transaction(
    guestItems
      .filter((item) => (availableById.get(item.variantId) ?? 0) > 0)
      .map((item) => {
        const maxQty = availableById.get(item.variantId) ?? 0
        const qty = Math.min(item.quantity, maxQty)

        return prisma.cartItem.upsert({
          where: { userId_variantId: { userId, variantId: item.variantId } },
          update: {
            quantity: {
              // incrémente, mais plafonne au stock dispo
              increment: qty,
            },
          },
          create: { userId, variantId: item.variantId, quantity: qty },
        })
      })
  )
}
