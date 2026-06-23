import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { z } from "zod"

type RouteContext = { params: Promise<{ id: string }> }

const addImageSchema = z.object({
  url: z.string().url(),
  blurHash: z.string().optional(),
  alt: z.string().max(200).optional(),
})

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = addImageSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, _count: { select: { images: true } } },
  })
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
  }

  const isPrimary = product._count.images === 0

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: result.data.url,
      blurHash: result.data.blurHash ?? null,
      alt: result.data.alt ?? null,
      sortOrder: product._count.images,
      isPrimary,
    },
  })

  revalidateTag("products")
  revalidateTag(`product-${id}`)

  return NextResponse.json({ image }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params
  const { searchParams } = req.nextUrl
  const imageId = searchParams.get("imageId")

  if (!imageId) {
    return NextResponse.json({ error: "imageId requis" }, { status: 400 })
  }

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId: id },
  })
  if (!image) {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 })
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  // Si l'image supprimée était la principale, promouvoir la suivante
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    })
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } })
    }
  }

  revalidateTag("products")
  revalidateTag(`product-${id}`)

  return NextResponse.json({ ok: true })
}
