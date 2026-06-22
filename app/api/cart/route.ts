import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

// GET /api/cart?ids=variantId:qty&ids=...
export async function GET(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "cart", LIMITS.cart)
  if (rl) return rl

  const MAX_CART_ITEMS = 50

  const url = new URL(req.url)
  const entries = url.searchParams.getAll("ids").slice(0, MAX_CART_ITEMS)

  const parsed = entries
    .map((e) => {
      const [id, qty] = e.split(":")
      return { variantId: id, quantity: parseInt(qty, 10) || 1 }
    })
    .filter((e) => e.variantId)

  if (!parsed.length) {
    return NextResponse.json({ items: [] })
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: parsed.map((p) => p.variantId) }, isActive: true },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
    },
  })

  const items = parsed
    .map((entry) => {
      const v = variants.find((va) => va.id === entry.variantId)
      if (!v) return null
      const maxStock = v.stock - v.reservedStock
      return {
        variantId:   v.id,
        quantity:    Math.min(entry.quantity, Math.max(maxStock, 0)),
        name:        v.product.name,
        variantName: v.name,
        price:       v.price,
        imageUrl:    v.product.images[0]?.url ?? "/placeholder-product.jpg",
        slug:        v.product.slug,
        maxStock:    Math.max(maxStock, 0),
      }
    })
    .filter(Boolean)

  return NextResponse.json({ items })
}
