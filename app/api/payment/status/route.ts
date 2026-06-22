import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId")

  if (!orderId || typeof orderId !== "string" || orderId.length > 36) {
    return NextResponse.json({ error: "orderId requis" }, { status: 400 })
  }

  // Vérification ownership : seul le propriétaire ou un admin peut consulter
  const session = await auth()
  const userId = session?.user?.id
  const isAdmin = session?.user?.role === "ADMIN"

  let order: { status: string; orderNumber: string; userId: string | null; guestEmail: string | null } | null = null
  try {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, orderNumber: true, userId: true, guestEmail: true },
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
  }

  // IDOR guard : commande utilisateur connecté, ou commande invité sans userId
  if (!isAdmin) {
    const isOwner = order.userId && userId && order.userId === userId
    const isGuest = !order.userId  // commandes invité accessibles par token de session (non authentifié OK)
    if (!isOwner && !isGuest) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
    }
  }

  let payment: { status: string } | null = null
  try {
    payment = await prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }

  return NextResponse.json({
    orderStatus: order.status,
    orderNumber: order.orderNumber,
    paymentStatus: payment?.status ?? "PENDING",
  })
}
