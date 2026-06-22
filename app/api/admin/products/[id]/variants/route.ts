import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { syncProductPrices } from "@/lib/services/product.service"
import { revalidateTag } from "next/cache"

const updateVariantSchema = z.object({
  variantId: z.string().cuid(),
  stock: z.number().int().min(0).optional(),
  price: z.number().int().positive().optional(),
  comparePrice: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id: productId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = updateVariantSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { variantId, ...updateData } = result.data

  try {
    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Variante introuvable pour ce produit" },
        { status: 404 }
      )
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
    })

    // Resynchronise minPrice/maxPrice dénormalisés si le prix a changé
    if (updateData.price !== undefined || updateData.isActive !== undefined) {
      await syncProductPrices(productId)
      revalidateTag("products")
      revalidateTag(`product-${productId}`)
    }

    return NextResponse.json({ success: true, variant })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la variante" },
      { status: 500 }
    )
  }
}
