import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { z } from "zod"

export const dynamic = "force-dynamic"

// All editable text/JSON keys managed via this endpoint
export const TEXT_SETTING_KEYS = [
  "announcements",       // JSON: {text:string, highlight?:string}[]
  "marquee_items",       // JSON: string[]
  "social_links",        // JSON: {label:string, href:string, icon:string}[]
  "testimonials",        // JSON: {id:number, name:string, location:string, rating:number, text:string, product:string, date:string, initials:string}[]
  "engagements",         // JSON: {title:string, description:string, icon:string}[]
  "hero_tagline",        // string
  "hero_heading",        // string (supports \n for line breaks)
  "hero_description",    // string
  "rituel_title",        // string
  "rituel_description",  // string
  "newsletter_description", // string
  "brand_tagline",       // string (used in marquee eyebrow)
] as const

export type TextSettingKey = typeof TEXT_SETTING_KEYS[number]

const patchSchema = z.record(z.string().min(1), z.string())

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: TEXT_SETTING_KEYS as unknown as string[] } },
  })

  const result: Record<string, string> = {}
  for (const row of rows) result[row.key] = row.value
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  const updates = Object.entries(parsed.data).filter(([k]) =>
    (TEXT_SETTING_KEYS as readonly string[]).includes(k)
  )

  if (updates.length === 0) {
    return NextResponse.json({ error: "Aucune clé valide" }, { status: 422 })
  }

  await Promise.all(
    updates.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )

  revalidateTag("site-settings")
  revalidateTag("categories")

  return NextResponse.json({ ok: true, updated: updates.map(([k]) => k) })
}
