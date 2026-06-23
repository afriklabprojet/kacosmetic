import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

const DEFAULT_ITEMS = [
  "La Fée de la Perfection",
  "Skincare Visage",
  "Rituels Corps & Bain",
  "Coffrets Exclusifs",
]

const SEPARATOR = " ✦ "

const getMarqueeItems = unstable_cache(
  async (): Promise<string[]> => {
    const row = await prisma.siteSetting.findUnique({ where: { key: "marquee_items" } })
    if (!row) return DEFAULT_ITEMS
    try {
      const parsed = JSON.parse(row.value) as string[]
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ITEMS
    } catch { return DEFAULT_ITEMS }
  },
  ["marquee-items"],
  { revalidate: 60, tags: ["site-settings"] }
)

export default async function MarqueeDivider() {
  const items = await getMarqueeItems()
  const text = items.join(SEPARATOR) + SEPARATOR

  return (
    <div className="w-full overflow-hidden border-y border-ebene bg-or py-3" aria-hidden="true">
      <div className="flex whitespace-nowrap">
        <span className="animate-marquee inline-block font-sans text-sm font-medium uppercase tracking-[0.2em] text-ebene">
          {text.repeat(4)}
        </span>
        <span className="animate-marquee inline-block font-sans text-sm font-medium uppercase tracking-[0.2em] text-ebene" aria-hidden="true">
          {text.repeat(4)}
        </span>
      </div>
    </div>
  )
}
