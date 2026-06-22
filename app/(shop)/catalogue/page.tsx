import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getAllCategoriesCached, getProductsCached } from "@/lib/services/product.service"
import ProductCard from "@/components/Product/ProductCard"
import CatalogueSearch from "@/components/Catalogue/CatalogueSearch"
import { WHATSAPP_URL } from "@/lib/constants"

export const revalidate = 3600

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Recherche "${q}" — Ka Cosmetic` : "Boutique — Ka Cosmetic",
    description: "Découvrez toutes nos catégories de cosmétiques premium : soins visage, corps, maquillage et coffrets.",
  }
}

const CATEGORY_IMAGES: Record<string, string> = {
  "soins-visage": "https://images.unsplash.com/photo-1556228578-8d89b6acb68a?q=80&w=800&auto=format&fit=crop",
  "soins-corps": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop",
  "cheveux": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
  "coffrets": "https://images.unsplash.com/photo-1583241475880-083f84372725?q=80&w=800&auto=format&fit=crop",
  "maquillage": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800&auto=format&fit=crop",
  "corps-bain": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop",
  "parfums": "https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=800&auto=format&fit=crop",
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop"

export default async function CataloguePage({ searchParams }: Props) {
  const { q: search } = await searchParams
  const isSearching = !!search?.trim()

  const categories = await getAllCategoriesCached()
  const searchResults = isSearching && search
    ? await getProductsCached({ search: search.trim() })
    : null

  return (
    <div className="min-h-screen bg-ivoire">
      <div className="mx-auto max-w-[1400px] px-4 pt-28 pb-16 md:px-8 md:pt-32 md:pb-20">

      {/* En-tête */}
      <div className="mb-10 border-b border-or/20 pb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">
          Ka Cosmetic
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-light text-ebene md:text-5xl lg:text-6xl">
              {isSearching ? (
                <>
                  Résultats pour<br />
                  <em className="text-brun not-italic">&ldquo;{search}&rdquo;</em>
                </>
              ) : (
                <>
                  Notre<br />
                  <em className="text-brun not-italic">Boutique</em>
                </>
              )}
            </h1>
            {isSearching && searchResults && (
              <p className="mt-3 text-sm text-taupe">
                {searchResults.total} produit{searchResults.total !== 1 ? "s" : ""} trouvé{searchResults.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Barre de recherche */}
          <CatalogueSearch defaultValue={search ?? ""} />
        </div>
      </div>

      {/* Mode recherche : grille produits */}
      {isSearching && searchResults ? (
        <>
          {searchResults.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {searchResults.products.map((product) => {
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

              {/* Retour aux catégories */}
              <div className="mt-12 text-center">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-2 text-sm text-taupe underline-offset-2 hover:text-brun hover:underline"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Voir toutes les catégories
                </Link>
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-creme">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-taupe" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p className="font-display text-xl text-ebene mb-2">Aucun résultat</p>
              <p className="text-sm text-taupe mb-6">
                Aucun produit ne correspond à &ldquo;{search}&rdquo;. Essayez un autre mot-clé.
              </p>
              <Link href="/catalogue" className="btn-primary inline-flex">
                Voir toute la boutique
              </Link>
            </div>
          )}
        </>
      ) : (
        /* Mode normal : grille catégories */
        <>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, i) => {
                const image = CATEGORY_IMAGES[category.slug] ?? FALLBACK_IMAGE
                return (
                  <Link
                    key={category.id}
                    href={`/catalogue/${category.slug}`}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-creme">
                      <Image
                        src={image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority={i < 3}
                      />
                      <div
                        className="absolute inset-0 transition-opacity duration-300"
                        style={{ background: "linear-gradient(to top, rgba(31,31,31,0.65) 0%, transparent 50%)" }}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="block text-[10px] uppercase tracking-[0.3em] text-or/80 mb-1">
                            0{i + 1}
                          </span>
                          <h2 className="font-display text-2xl text-white">{category.name}</h2>
                          {category.description && (
                            <p className="mt-1 text-xs text-white/60 line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-or text-or transition-all duration-300 group-hover:bg-or group-hover:text-ebene">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M7 17L17 7M7 7h10v10" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-display text-xl text-taupe">Boutique en cours de mise à jour.</p>
            </div>
          )}

          {/* CTA bas de page */}
          <div className="mt-16 rounded-2xl bg-creme border border-or/20 px-8 py-12 text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-or">Besoin d&apos;aide ?</p>
            <h2 className="font-display text-2xl text-ebene mb-3">Notre équipe est disponible</h2>
            <p className="text-sm text-taupe mb-6 max-w-sm mx-auto">
              Conseils beauté personnalisés, recommandations produits, assistance commande.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-or px-6 py-3 text-xs font-medium uppercase tracking-widest text-ebene transition-colors hover:bg-brun hover:text-white"
            >
              WhatsApp
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
