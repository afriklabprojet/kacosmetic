import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductBySlugCached, getRelatedProductsCached, getFeaturedProductSlugs } from "@/lib/services/product.service"
import ProductCard from "@/components/Product/ProductCard"
import PhotoGallery from "@/components/Product/PhotoGallery"
import ProductVariantPicker from "@/components/Product/ProductVariantPicker"

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

// Pre-render uniquement les produits featured (max 200)
// Les autres pages sont servies en ISR à la première visite
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getFeaturedProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlugCached(slug)
  if (!product) return {}
  const firstSentence = product.description.split(".")[0]
  const canonicalUrl = `https://kacosmetic.ci/produit/${slug}`
  const ogImage = product.images[0]?.url
  return {
    title: `${product.name} — Ka Cosmetic`,
    description: firstSentence,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${product.name} — Ka Cosmetic`,
      description: firstSentence,
      images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Ka Cosmetic`,
      description: firstSentence,
      images: ogImage ? [ogImage] : [],
    },
  }
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-CI") + " FCFA"
}

function BreadcrumbJsonLd({ categorySlug, categoryName, productName, slug }: Readonly<{
  categorySlug: string
  categoryName: string
  productName: string
  slug: string
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://kacosmetic.ci" },
      { "@type": "ListItem", position: 2, name: "Boutique", item: "https://kacosmetic.ci/catalogue" },
      { "@type": "ListItem", position: 3, name: categoryName, item: `https://kacosmetic.ci/catalogue/${categorySlug}` },
      { "@type": "ListItem", position: 4, name: productName, item: `https://kacosmetic.ci/produit/${slug}` },
    ],
  }
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify encodes all special chars; no user input reaches this
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// JSON-LD est construit côté serveur à partir de données DB — pas d'input utilisateur
// Le contenu est sérialisé via JSON.stringify, pas rendu comme HTML brut
function ProductJsonLd({ product, defaultVariant, isInStock, slug }: Readonly<{
  product: { name: string; description: string; images: { url: string }[] }
  defaultVariant: { price: number } | undefined
  isInStock: boolean
  slug: string
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description,
    brand: { "@type": "Brand", name: "Ka Cosmetic" },
    offers: {
      "@type": "Offer",
      price: defaultVariant?.price ?? 0,
      priceCurrency: "XOF",
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://kacosmetic.ci/produit/${slug}`,
    },
  }
  // JSON.stringify encode caractères spéciaux — safe pour inclusion dans <script type="application/ld+json">
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify encodes all special chars; no user input reaches this
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function ProductPage({ params }: Readonly<Props>) {
  const { slug } = await params
  const product = await getProductBySlugCached(slug)
  if (!product) notFound()

  const related = await getRelatedProductsCached(product.categoryId, slug)

  const defaultVariant = product.variants[0]

  const isInStock = product.variants.some((v) => v.stock - v.reservedStock > 0)

  return (
    <>
      <ProductJsonLd
        product={product}
        defaultVariant={defaultVariant}
        isInStock={isInStock}
        slug={slug}
      />
      <BreadcrumbJsonLd
        categorySlug={product.category.slug}
        categoryName={product.category.name}
        productName={product.name}
        slug={slug}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
          <Link href="/" className="hover:text-or">Accueil</Link>
          <span>/</span>
          <Link href={`/catalogue/${product.category.slug}`} className="hover:text-or">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-ebene">{product.name}</span>
        </nav>

        {/* Produit principal */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Galerie images */}
          <PhotoGallery images={product.images} productName={product.name} />

          {/* Infos produit */}
          <div className="flex flex-col">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-or">
              {product.category.name}
            </p>
            <h1 className="font-display text-2xl font-semibold text-ebene md:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <ProductVariantPicker
              productId={product.id}
              productName={product.name}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                comparePrice: v.comparePrice ?? null,
                stock: v.stock,
                reservedStock: v.reservedStock,
              }))}
            />

            <div className="mt-8 space-y-4 border-t border-or-light pt-6">
              <div>
                <h2 className="font-display text-lg font-semibold text-ebene">Description</h2>
                <p className="mt-2 leading-relaxed text-taupe">{product.description}</p>
              </div>
              {product.ingredients && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-ebene">Ingrédients</h2>
                  <p className="mt-2 text-sm leading-relaxed text-taupe">{product.ingredients}</p>
                </div>
              )}
              {product.howToUse && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-ebene">Comment l&apos;utiliser</h2>
                  <p className="mt-2 leading-relaxed text-taupe">{product.howToUse}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display mb-6 text-2xl font-semibold text-ebene">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-6">
              {related.map((p) => {
                const v = p.variants[0]
                const img = p.images[0]
                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    categoryName={p.category.name}
                    price={v?.price ?? 0}
                    comparePrice={v?.comparePrice}
                    imageUrl={img?.url ?? "/placeholder-product.jpg"}
                    blurDataUrl={img?.blurHash}
                    isFeatured={p.isFeatured}
                    inStock={(v?.stock ?? 0) - (v?.reservedStock ?? 0) > 0}
                  />
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
