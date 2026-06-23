import Link from "next/link"
import Image from "next/image"
import WishlistButton from "./WishlistButton"
import AddToCartButton from "./AddToCartButton"

export interface ProductCardProps {
  id: string
  slug: string
  name: string
  categoryName: string
  price: number
  comparePrice?: number | null
  imageUrl: string
  blurDataUrl?: string | null
  isFeatured?: boolean
  inStock?: boolean
  variantId?: string
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-CI") + " FCFA"
}

export default function ProductCard({
  id,
  slug,
  name,
  categoryName,
  price,
  comparePrice,
  imageUrl,
  blurDataUrl,
  isFeatured = false,
  inStock = true,
  variantId,
}: Readonly<ProductCardProps>) {
  const discount =
    comparePrice && comparePrice > price
      ? Math.round((1 - price / comparePrice) * 100)
      : null

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#EDE8E1] bg-white shadow-[0_2px_12px_rgba(31,31,31,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#C9A227]/30 hover:shadow-[0_12px_32px_rgba(201,162,39,0.14)]">

      {/* ── Zone image ── */}
      <Link
        href={`/produit/${slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-[#F5F0EA]"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          placeholder={blurDataUrl ? "blur" : "empty"}
          blurDataURL={blurDataUrl ?? undefined}
        />

        {/* Dégradé bas — améliore lisibilité du CTA hover */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges — top-left */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount && (
            <span className="inline-flex items-center rounded-full bg-[#C9A227] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              –{discount}%
            </span>
          )}
          {isFeatured && !discount && (
            <span className="inline-flex items-center rounded-full bg-[#1F1F1F] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A227] shadow-sm">
              Nouveau
            </span>
          )}
          {!inStock && (
            <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#6B5744] backdrop-blur-sm">
              Épuisé
            </span>
          )}
        </div>

        {/* Wishlist — top-right */}
        <WishlistButton
          productId={id}
          productName={name}
          size={14}
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#6B5744] opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 ease-out group-hover:opacity-100 hover:bg-white hover:text-[#C9A227] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
        />

        {/* CTA slide-up — desktop (visible au hover ET au focus clavier) */}
        {inStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 max-md:hidden">
            <div className="bg-[#1F1F1F]/92 py-3.5 text-center backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F8F5F1]">
                Ajouter au panier
              </span>
            </div>
          </div>
        )}
      </Link>

      {/* ── Infos produit ── */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        {/* Catégorie */}
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
          {categoryName}
        </p>

        {/* Nom */}
        <Link
          href={`/produit/${slug}`}
          className="block font-display text-[14px] font-semibold leading-snug text-[#1F1F1F] transition-colors duration-150 hover:text-[#C9A227] md:text-[15px]"
        >
          {name}
        </Link>

        {/* Séparateur doré fin */}
        <div className="my-2.5 h-px w-6 bg-[#C9A227]/30 transition-all duration-300 group-hover:w-full group-hover:bg-[#C9A227]/20" />

        {/* Prix */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold text-[#1F1F1F]">
            {formatPrice(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="font-mono text-xs text-[#6B5744]/60 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* CTA mobile */}
        <div className="mt-3 md:hidden">
          {variantId ? (
            <AddToCartButton
              variantId={variantId}
              productName={name}
              disabled={!inStock}
            />
          ) : (
            <Link
              href={`/produit/${slug}`}
              className="block w-full rounded-lg border border-[#C9A227]/40 bg-[#1F1F1F] py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F8F5F1] transition-all duration-200 ease-out active:scale-[0.98] hover:bg-[#C9A227] hover:border-[#C9A227] hover:text-[#1F1F1F]"
            >
              {inStock ? "Voir le produit" : "Épuisé"}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
