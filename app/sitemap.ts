import type { MetadataRoute } from "next"
import {
  getProductSlugPage,
  countActiveProducts,
  getAllCategoriesCached,
} from "@/lib/services/product.service"

const BASE_URL = "https://kacosmetic.ci"
const SITEMAP_PAGE_SIZE = 5000

// Génère un sitemap index si > 5 000 produits
export async function generateSitemaps() {
  const total = await countActiveProducts()
  const pages = Math.max(1, Math.ceil(total / SITEMAP_PAGE_SIZE))
  return Array.from({ length: pages }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id = 0 }: { id?: number }): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProductSlugPage(id, SITEMAP_PAGE_SIZE),
    id === 0 ? getAllCategoriesCached() : Promise.resolve([]),
  ])

  const staticUrls: MetadataRoute.Sitemap = id === 0
    ? [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        { url: `${BASE_URL}/catalogue`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        ...categories.map((cat) => ({
          url: `${BASE_URL}/catalogue/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
      ]
    : []

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/produit/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticUrls, ...productUrls]
}
