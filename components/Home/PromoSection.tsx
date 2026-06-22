import Image from "next/image"
import Link from "next/link"

interface PromoProduct {
  id: string
  slug: string
  name: string
  categoryName: string
  price: number
  comparePrice: number
  imageUrl: string
}

interface PromoSectionProps {
  products: PromoProduct[]
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

function calcDiscount(price: number, comparePrice: number) {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round((1 - price / comparePrice) * 100)
}

export default function PromoSection({ products }: Readonly<PromoSectionProps>) {
  if (!products.length) return null

  const [featured, ...rest] = products

  return (
    <section className="fade-in-section relative overflow-hidden bg-creme py-16 md:py-20">

      {/* Lueur dorée coin haut droit */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #C9A227 0%, transparent 65%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">

        {/* ── En-tête ─────────────────────────────────────────── */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            {/* Badge OFFRES LIMITÉES animé */}
            <span className="promo-badge-live mb-3 inline-flex items-center gap-2 rounded-full border border-or/40 bg-or/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-or animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
                Offres limitées
              </span>
            </span>
            <h2 className="font-display text-3xl font-light text-ebene md:text-5xl">
              Promotions<br />
              <em className="text-brun not-italic">Exclusives</em>
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brun transition-colors hover:text-brun-dark md:flex"
          >
            Voir tout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── Layout éditorial ─────────────────────────────────── */}
        {featured && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">

            {/* Carte vedette grande */}
            <Link
              href={`/produit/${featured.slug}`}
              className="group relative col-span-1 overflow-hidden rounded-2xl md:col-span-5"
              style={{ minHeight: "460px" }}
            >
              <Image
                src={featured.imageUrl}
                alt={featured.name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dégradé bas */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(31,10,0,0.92) 0%, rgba(31,10,0,0.2) 50%, transparent 100%)" }}
                aria-hidden="true"
              />

              {/* Badge discount */}
              <div className="absolute left-4 top-4">
                <span className="promo-badge-live inline-flex h-12 w-12 items-center justify-center rounded-full bg-or text-center font-mono text-sm font-black text-ebene leading-tight">
                  –{calcDiscount(featured.price, featured.comparePrice)}%
                </span>
              </div>

              {/* Contenu bas */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-or/80">
                  {featured.categoryName}
                </p>
                <h3 className="font-display text-2xl text-white leading-tight mb-3">
                  {featured.name}
                </h3>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-xl font-bold text-or">
                    {formatPrice(featured.price)}
                  </span>
                  <span className="font-mono text-sm text-white/50 line-through">
                    {formatPrice(featured.comparePrice)}
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-or/50 bg-or/10 px-4 py-2 text-xs font-medium uppercase tracking-widest text-or backdrop-blur-sm transition-all duration-300 group-hover:bg-or group-hover:text-ebene">
                  Profiter de l&apos;offre
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Colonne des cartes secondaires */}
            <div className="col-span-1 flex flex-col gap-4 md:col-span-7">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
                {rest.map((product, i) => (
                  <Link
                    key={product.id}
                    href={`/produit/${product.slug}`}
                    className="group relative overflow-hidden rounded-xl bg-white border border-or/15 shadow-sm transition-all duration-300 hover:shadow-[0_4px_20px_rgba(201,162,39,0.18)] hover:border-or/40"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden rounded-t-xl bg-creme">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 22vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                      {/* Badge */}
                      <span className="absolute right-2 top-2 rounded-full bg-or px-2 py-0.5 font-mono text-[10px] font-black text-ebene">
                        –{calcDiscount(product.price, product.comparePrice)}%
                      </span>
                    </div>

                    {/* Infos */}
                    <div className="p-3">
                      <p className="mb-0.5 text-[9px] uppercase tracking-[0.2em] text-taupe">
                        {product.categoryName}
                      </p>
                      <p className="font-display text-sm text-ebene leading-snug line-clamp-2 mb-2">
                        {product.name}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm font-bold text-brun">
                          {formatPrice(product.price)}
                        </span>
                        <span className="font-mono text-[11px] text-taupe/60 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bannière économies */}
              <div className="flex items-center justify-between rounded-xl border border-or/25 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 text-or" aria-hidden="true">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-or">Code promo</p>
                    <p className="text-sm text-taupe font-light">–10% supplémentaires avec <strong className="text-ebene font-mono">BIENVENUE10</strong></p>
                  </div>
                </div>
                <Link
                  href="/catalogue"
                  className="hidden flex-shrink-0 items-center gap-2 rounded-full bg-or px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ebene transition-colors hover:bg-brun hover:text-white sm:flex"
                >
                  Voir tout
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* CTA mobile */}
        <div className="mt-6 md:hidden">
          <Link
            href="/catalogue"
            className="flex items-center justify-center gap-2 rounded-full border border-brun/40 py-3 text-xs font-medium uppercase tracking-widest text-brun"
          >
            Voir toutes les promotions
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}
