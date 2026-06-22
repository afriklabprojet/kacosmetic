import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  brandName: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        variants: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            comparePrice: true,
            stock: true,
            reservedStock: true,
            weight: true,
            isActive: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            blurHash: true,
            alt: true,
            sortOrder: true,
            isPrimary: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }

    const orderCount = await prisma.orderItem.count({ where: { productId: id } })

    return NextResponse.json({ product, orderCount })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = updateProductSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json({ success: true, product })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params

  try {
    const orderCount = await prisma.orderItem.count({ where: { productId: id } })

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error:
            "Ce produit a des commandes associées, il ne peut pas être supprimé.",
        },
        { status: 409 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, product })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
