import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const adjustStockSchema = z.object({
  variantId: z.string().cuid(),
  adjustment: z.number().int(),
  reason: z.string().max(200).optional(),
})

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 })
  }

  const parsed = adjustStockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { variantId, adjustment } = parsed.data

  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, stock: true },
    })

    if (!variant) {
      return NextResponse.json({ error: "Variante introuvable" }, { status: 404 })
    }

    if (variant.stock + adjustment < 0) {
      return NextResponse.json(
        {
          error: `Ajustement invalide : le stock résultant serait négatif (${variant.stock} + ${adjustment} = ${variant.stock + adjustment})`,
        },
        { status: 422 }
      )
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: adjustment } },
      select: { id: true, stock: true },
    })

    return NextResponse.json({ success: true, newStock: updatedVariant.stock })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
