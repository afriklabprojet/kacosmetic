import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import HeaderClient, { type NavCategory } from "./HeaderClient"

const FALLBACK_FEATURED = { label: "Collection", name: "Découvrir", price: "" }

const getNavCategories = unstable_cache(
  async (): Promise<NavCategory[]> => {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, imageUrl: true, description: true },
    })
    return cats.map((cat) => ({
      label: cat.name,
      href: `/catalogue/${cat.slug}`,
      image: cat.imageUrl ?? "",
      subcategories: cat.description
        ? cat.description.split("|").map((s) => s.trim()).filter(Boolean)
        : [],
      featured: FALLBACK_FEATURED,
    }))
  },
  ["nav-categories"],
  { revalidate: 60, tags: ["categories"] }
)

export default async function Header() {
  const navItems = await getNavCategories()
  return <HeaderClient navItems={navItems} />
}
