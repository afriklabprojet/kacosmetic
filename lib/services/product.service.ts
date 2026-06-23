import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular"

export interface ProductFilters {
  categorySlug?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  page?: number
  limit?: number
  sort?: SortOption
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":  return [{ minPrice: "asc" }]
    case "price-desc": return [{ maxPrice: "desc" }]
    case "popular":    return [{ popularityScore: "desc" }, { isFeatured: "desc" }]
    default:           return [{ isFeatured: "desc" }, { createdAt: "desc" }]
  }
}

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const { categorySlug, search, minPrice, maxPrice, inStockOnly } = filters

  return {
    isActive: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(inStockOnly && {
      variants: { some: { isActive: true, stock: { gt: 0 } } },
    }),
    // Filtre prix sur colonne dénormalisée — index utilisé, pas de subquery coûteuse
    ...(minPrice !== undefined && { minPrice: { gte: minPrice } }),
    ...(maxPrice !== undefined && { maxPrice: { lte: maxPrice } }),
  }
}

// ─── Requête core ─────────────────────────────────────────────────────────────

async function getProducts(filters: ProductFilters = {}) {
  const { page = 1, limit = 20, sort } = filters
  const where = buildWhere(filters)

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        isFeatured: true,
        minPrice: true,
        maxPrice: true,
        category: { select: { name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          select: { url: true, blurHash: true },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          select: { id: true, price: true, comparePrice: true, stock: true, reservedStock: true },
          orderBy: { price: "asc" },
          take: 1,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: buildOrderBy(sort),
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, pages: Math.ceil(total / limit), page }
}

// ─── API publique avec cache ──────────────────────────────────────────────────

export async function getProductsCached(filters: ProductFilters = {}) {
  const key = [
    "products",
    filters.categorySlug ?? "all",
    filters.search ?? "",
    String(filters.page ?? 1),
    String(filters.limit ?? 20),
    filters.sort ?? "newest",
    filters.inStockOnly ? "1" : "0",
    String(filters.minPrice ?? ""),
    String(filters.maxPrice ?? ""),
  ]

  const tags = ["products"]
  if (filters.categorySlug) tags.push(`cat-${filters.categorySlug}`)

  return unstable_cache(
    () => getProducts(filters),
    key,
    { revalidate: 3600, tags }
  )()
}

// ─── Produit unique ──────────────────────────────────────────────────────────

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      category: { select: { name: true, slug: true } },
    },
  })
}

export function getProductBySlugCached(slug: string) {
  return unstable_cache(
    () => getProductBySlug(slug),
    ["product", slug],
    { revalidate: 3600, tags: ["products", `product-${slug}`] }
  )()
}

// ─── Produits liés ───────────────────────────────────────────────────────────

async function getRelatedProducts(categoryId: string, excludeSlug: string, limit: number) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, slug: { not: excludeSlug } },
    select: {
      id: true,
      slug: true,
      name: true,
      isFeatured: true,
      category: { select: { name: true } },
      images: {
        where: { isPrimary: true },
        select: { url: true, blurHash: true },
        take: 1,
      },
      variants: {
        where: { isActive: true },
        select: { id: true, price: true, comparePrice: true, stock: true, reservedStock: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { popularityScore: "desc" }],
  })
}

export function getRelatedProductsCached(categoryId: string, excludeSlug: string, limit = 4) {
  return unstable_cache(
    () => getRelatedProducts(categoryId, excludeSlug, limit),
    ["related", categoryId, excludeSlug],
    { revalidate: 3600, tags: ["products", `cat-related-${categoryId}`] }
  )()
}

// ─── Catégories ──────────────────────────────────────────────────────────────

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug, isActive: true } })
}

export function getCategoryBySlugCached(slug: string) {
  return unstable_cache(
    () => getCategoryBySlug(slug),
    ["category", slug],
    { revalidate: 86400, tags: ["categories", `cat-${slug}`] }
  )()
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
}

export function getAllCategoriesCached() {
  return unstable_cache(
    getAllCategories,
    ["categories-all"],
    { revalidate: 86400, tags: ["categories"] }
  )()
}

// ─── Slugs pour sitemap (paginé) ─────────────────────────────────────────────

export async function getProductSlugPage(page: number, pageSize = 5000) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    skip: page * pageSize,
    take: pageSize,
    orderBy: { updatedAt: "desc" },
  })
  return products
}

export async function countActiveProducts() {
  return prisma.product.count({ where: { isActive: true } })
}

// Gardé pour generateStaticParams — limité aux produits featured
export async function getFeaturedProductSlugs() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: { slug: true },
    take: 200,
    orderBy: { popularityScore: "desc" },
  })
  return products.map((p) => p.slug)
}

// ─── Sync prix dénormalisés (appelé après mutation de variant) ───────────────

export async function syncProductPrices(productId: string) {
  const agg = await prisma.productVariant.aggregate({
    where: { productId, isActive: true },
    _min: { price: true },
    _max: { price: true },
  })
  await prisma.product.update({
    where: { id: productId },
    data: {
      minPrice: agg._min.price ?? 0,
      maxPrice: agg._max.price ?? 0,
    },
  })
}
