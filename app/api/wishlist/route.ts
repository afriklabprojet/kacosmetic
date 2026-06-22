import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

const toggleSchema = z.object({
  productId: z.string().cuid(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] })
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    })
    return NextResponse.json({ items: items.map((i) => i.productId) })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "cart", LIMITS.cart)
  if (rl) return rl

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = toggleSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "productId invalide" }, { status: 422 })
  }

  const { productId } = result.data
  const userId = session.user.id

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { userId_productId: { userId, productId } },
      })
      return NextResponse.json({ added: false, productId })
    }

    await prisma.wishlistItem.create({ data: { userId, productId } })
    return NextResponse.json({ added: true, productId })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 })
  }

  const productId = req.nextUrl.searchParams.get("productId")
  const result = toggleSchema.safeParse({ productId })
  if (!result.success) {
    return NextResponse.json({ error: "productId invalide" }, { status: 422 })
  }

  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id, productId: result.data.productId },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
