import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const dynamic = "force-dynamic"

// Public keys readable without auth (marketing content only, no sensitive data)
const PUBLIC_KEYS = new Set([
  "announcements",
  "marquee_items",
  "social_links",
  "testimonials",
  "engagements",
  "hero_tagline",
  "hero_heading",
  "hero_description",
  "rituel_title",
  "rituel_description",
  "newsletter_description",
  "brand_tagline",
])

const getPublicSettings = unstable_cache(
  async (keys: string[]) => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
    const result: Record<string, string> = {}
    for (const row of rows) result[row.key] = row.value
    return result
  },
  ["public-site-settings"],
  { revalidate: 60, tags: ["site-settings"] }
)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const keysParam = searchParams.get("keys")
  const requestedKeys = keysParam ? keysParam.split(",").map(k => k.trim()) : []
  const allowedKeys = requestedKeys.filter(k => PUBLIC_KEYS.has(k))

  if (allowedKeys.length === 0) {
    return NextResponse.json({})
  }

  const data = await getPublicSettings(allowedKeys)
  return NextResponse.json(data)
}
