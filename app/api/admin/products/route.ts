import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const variantSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(50),
  price: z.number().int().positive(),
  comparePrice: z.number().int().positive().optional(),
  stock: z.number().int().min(0),
  weight: z.number().int().positive().optional(),
})

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  description: z.string().min(1),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  categoryId: z.string().cuid(),
  brandName: z.string().max(100).default("Ka Cosmetic"),
  isFeatured: z.boolean().default(false),
  variants: z.array(variantSchema).min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = productSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { variants, ...productData } = result.data

  // Vérifier que le slug n'existe pas déjà
  const existing = await prisma.product.findUnique({
    where: { slug: productData.slug },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 })
  }

  // Vérifier que les SKUs n'existent pas déjà
  const skus = variants.map((v) => v.sku.toUpperCase())
  const existingSkus = await prisma.productVariant.findMany({
    where: { sku: { in: skus } },
    select: { sku: true },
  })
  if (existingSkus.length > 0) {
    return NextResponse.json(
      { error: `SKU déjà utilisé : ${existingSkus.map((s) => s.sku).join(", ")}` },
      { status: 409 }
    )
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            ...v,
            sku: v.sku.toUpperCase(),
          })),
        },
      },
      select: { id: true, slug: true },
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
