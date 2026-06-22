import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getCategoryBySlugCached,
  getAllCategoriesCached,
  getProductsCached,
  type SortOption,
} from "@/lib/services/product.service"
import ProductCard from "@/components/Product/ProductCard"
import CatalogueFilters from "@/components/Catalogue/CatalogueFilters"

export const revalidate = 3600

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}

export async function generateStaticParams() {
  const categories = await getAllCategoriesCached()
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlugCached(slug)
  if (!category) return {}
  const canonicalUrl = `https://kacosmetic.ci/catalogue/${slug}`
  const description = `Découvrez notre sélection de ${category.name.toLowerCase()} premium. Livraison J0/J+1 à Abidjan.`
  return {
    title: `${category.name} — Ka Cosmetic`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${category.name} — Ka Cosmetic`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} — Ka Cosmetic`,
      description,
    },
  }
}

function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const delta = 2
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)
  const range: (number | "...")[] = [1]
  if (left > 2) range.push("...")
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push("...")
  range.push(total)
  return range
}

export default async function CataloguePage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const { q: search, page: pageParam, sort } = await searchParams

  const currentPage = pageParam ? Math.max(1, Number(pageParam)) : 1

  // getCategoryBySlugCached est appelé ici ET dans generateMetadata :
  // unstable_cache déduplique la requête DB dans le même request
  const [category, { products, total, pages, page }] = await Promise.all([
    getCategoryBySlugCached(slug),
    getProductsCached({
      categorySlug: slug,
      search,
      page: currentPage,
      sort: sort as SortOption | undefined,
    }),
  ])

  if (!category) notFound()

  const qs = (p: number) =>
    `?page=${p}${search ? `&q=${encodeURIComponent(search)}` : ""}${sort ? `&sort=${sort}` : ""}`

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://kacosmetic.ci" },
      { "@type": "ListItem", position: 2, name: "Boutique", item: "https://kacosmetic.ci/catalogue" },
      { "@type": "ListItem", position: 3, name: category.name, item: `https://kacosmetic.ci/catalogue/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-ivoire">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify encodes all special chars; no user input reaches this
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-28 pb-12 md:px-6 md:pt-32 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
          <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href="/catalogue" className="hover:text-or transition-colors">Boutique</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ebene">{category.name}</span>
        </nav>

        <div className="mb-6 h-px w-full bg-or/15" aria-hidden="true" />

        {/* Filtres + tri */}
        <CatalogueFilters total={total} categoryName={category.name} />

        {/* Description */}
        {category.description && (
          <p className="mb-8 max-w-xl text-sm font-light leading-relaxed text-taupe">
            {category.description}
          </p>
        )}

        {/* Grille produits */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => {
                const variant = product.variants[0]
                const image = product.images[0]
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    categoryName={product.category.name}
                    price={variant?.price ?? 0}
                    comparePrice={variant?.comparePrice}
                    imageUrl={image?.url ?? "/placeholder-product.jpg"}
                    blurDataUrl={image?.blurHash}
                    isFeatured={product.isFeatured}
                    inStock={(variant?.stock ?? 0) - (variant?.reservedStock ?? 0) > 0}
                  />
                )
              })}
            </div>

            {/* Pagination fenêtrée — max 7 éléments affichés */}
            {pages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
                {page > 1 && (
                  <a
                    href={qs(page - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-or-light text-ebene transition-colors hover:border-or hover:bg-ivoire"
                    aria-label="Page précédente"
                  >
                    ‹
                  </a>
                )}
                {getPageRange(page, pages).map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-taupe">
                      …
                    </span>
                  ) : (
                    <a
                      key={p}
                      href={qs(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-ebene text-ivoire"
                          : "border border-or-light text-ebene hover:border-or hover:bg-ivoire"
                      }`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </a>
                  )
                )}
                {page < pages && (
                  <a
                    href={qs(page + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-or-light text-ebene transition-colors hover:border-or hover:bg-ivoire"
                    aria-label="Page suivante"
                  >
                    ›
                  </a>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-taupe">
              {search ? `Aucun résultat pour "${search}"` : "Aucun produit disponible pour l'instant."}
            </p>
            <Link href="/catalogue" className="btn-primary mt-4 inline-flex">
              Toute la boutique
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
