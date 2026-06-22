import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

function verifyCronSecret(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const expected = `Bearer ${secret}`
  const actual = authHeader ?? ""
  if (actual.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  } catch {
    return false
  }
}

// Vercel Cron : 0 3 * * * (chaque nuit à 3h UTC)
// Recalcule popularityScore = SUM(quantités vendées, commandes CONFIRMED/DELIVERED)
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      order: { status: { in: ["CONFIRMED", "DELIVERED"] } },
    },
  })

  await Promise.all(
    rows.map((row) =>
      prisma.product.update({
        where: { id: row.productId },
        data: { popularityScore: row._sum.quantity ?? 0 },
      })
    )
  )

  revalidateTag("products")

  return NextResponse.json({ updated: rows.length })
}
