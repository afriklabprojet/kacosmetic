import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import FooterClient from "./FooterClient"

export interface SocialLink { label: string; href: string }
export interface FooterCategory { label: string; href: string }

const DEFAULT_SOCIALS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/kacosmetic.ci" },
  { label: "TikTok",    href: "https://tiktok.com/@kacosmetic.ci" },
  { label: "WhatsApp",  href: "https://wa.me/2250000000000" },
]

const getFooterData = unstable_cache(
  async () => {
    const [cats, socialRow] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true, slug: true },
      }),
      prisma.siteSetting.findUnique({ where: { key: "social_links" } }),
    ])

    const categories: FooterCategory[] = cats.map(c => ({
      label: c.name,
      href: `/catalogue/${c.slug}`,
    }))

    let socials: SocialLink[] = DEFAULT_SOCIALS
    if (socialRow) {
      try {
        const parsed = JSON.parse(socialRow.value) as SocialLink[]
        if (Array.isArray(parsed) && parsed.length > 0) socials = parsed
      } catch { /* keep default */ }
    }

    return { categories, socials }
  },
  ["footer-data"],
  { revalidate: 60, tags: ["categories", "site-settings"] }
)

export default async function Footer() {
  const { categories, socials } = await getFooterData()
  return <FooterClient categories={categories} socials={socials} />
}
