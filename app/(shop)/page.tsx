import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/Product/ProductCard"
import MarqueeDivider from "@/components/Home/MarqueeDivider"
import HeroScrollInit from "@/components/Home/HeroScrollInit"
import HeroVideo from "@/components/Home/HeroVideo"
import TestimonialsSection from "@/components/Home/TestimonialsSection"
import NewsletterSection from "@/components/Home/NewsletterSection"
import PromoSection from "@/components/Home/PromoSection"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Ka Cosmetic — Cosmétiques Luxe pour Peaux Noires & Métissées | Abidjan",
  description:
    "Découvrez Ka Cosmetic, la boutique de cosmétiques premium à Abidjan. Soins visage, corps, maquillage et parfums pensés pour les peaux noires et métissées. Livraison J0 & J+1 dans tout Abidjan. Wave, Orange Money, Visa acceptés.",
}

// ── Fallback content ──────────────────────────────────────────────────────────

const HERO_DEFAULTS = {
  tagline: "La Fée de la Perfection",
  heading: "Sublime,|Par Nature.",
  description:
    "L'art de révéler votre lumière intérieure. Des rituels de beauté pensés pour l'excellence et la diversité des peaux noires et métissées.",
}

const RITUEL_DEFAULTS = {
  title: "Le Rituel de la|Fée",
  description:
    "Fondée sur les secrets ancestraux de beauté africaine et sublimée par la science botanique moderne. Ka Cosmetic ne se contente pas de corriger — nous révélons l'éclat originel de chaque carnation avec une précision d'orfèvre.",
}

interface Engagement { title: string; description: string }
interface Review {
  id: number
  name: string
  location: string
  rating: number
  text: string
  product: string
  date: string
  initials: string
}

const DEFAULT_ENGAGEMENTS: Engagement[] = [
  {
    title: "Formules Clean",
    description:
      "Cruelty-free, sans parabènes ni sulfates. Certifiées adaptées aux peaux noires et métissées.",
  },
  {
    title: "Livraison J0 & J+1",
    description: "Emballage éco-luxe, livraison J0 & J+1 dans tout Abidjan.",
  },
  {
    title: "Paiement 100% Sécurisé",
    description:
      "Wave, Orange Money, MTN, Djamo, Visa & Mastercard — cryptage bancaire de bout en bout.",
  },
]

const DEFAULT_TESTIMONIALS: Review[] = [
  {
    id: 1,
    name: "Aminata K.",
    location: "Cocody, Abidjan",
    rating: 5,
    text: "La crème éclat a totalement transformé mon teint en 2 semaines. Mon visage est lumineux comme jamais. Je recommande à toutes mes amies !",
    product: "Crème Éclat Botanique",
    date: "Juin 2026",
    initials: "AK",
  },
  {
    id: 2,
    name: "Fatou D.",
    location: "Plateau, Abidjan",
    rating: 5,
    text: "J'utilise Ka Cosmetic depuis 6 mois. La livraison est toujours rapide, les produits sont authentiques et l'emballage est luxueux. Je suis une cliente fidèle.",
    product: "Sérum Vitamine C",
    date: "Mai 2026",
    initials: "FD",
  },
  {
    id: 3,
    name: "Mariame T.",
    location: "Yopougon, Abidjan",
    rating: 5,
    text: "Enfin des produits pensés pour nos peaux noires ! Résultats visibles dès la première semaine. Le service client est exceptionnel.",
    product: "Huile Corps Karité",
    date: "Juin 2026",
    initials: "MT",
  },
  {
    id: 4,
    name: "Kadiatou B.",
    location: "Marcory, Abidjan",
    rating: 5,
    text: "Le coffret cadeau que j'ai offert à ma mère était magnifiquement emballé. Elle a adoré chaque produit. Ka Cosmetic c'est du luxe accessible !",
    product: "Coffret Prestige",
    date: "Mai 2026",
    initials: "KB",
  },
]

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "soins-visage":
    "https://images.unsplash.com/photo-1556228578-8d89b6acb68a?q=80&w=1200&auto=format&fit=crop",
  "corps-bain":
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop",
}
const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?q=80&w=800&auto=format&fit=crop"

const ENGAGEMENT_ICONS = [
  <svg key="clean" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
    <path d="M9 12l2 2 4-4" />
  </svg>,
  <svg key="delivery" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
    <rect x="9" y="11" width="14" height="10" rx="2" />
    <circle cx="12" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
  </svg>,
  <svg key="secure" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>,
]

// ── Data fetchers ─────────────────────────────────────────────────────────────

const getBestSellersCached = unstable_cache(
  () =>
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        isFeatured: true,
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, blurHash: true } },
        variants: {
          where: { isActive: true },
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true, comparePrice: true, stock: true, reservedStock: true },
        },
      },
      orderBy: [{ popularityScore: "desc" }, { isFeatured: "desc" }],
      take: 4,
    }),
  ["home-bestsellers"],
  { revalidate: 3600, tags: ["products"] }
)

const getPromoProductsCached = unstable_cache(
  () =>
    prisma.product.findMany({
      where: {
        isActive: true,
        variants: { some: { isActive: true, comparePrice: { not: null } } },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        variants: {
          where: { isActive: true, comparePrice: { not: null } },
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true, comparePrice: true },
        },
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
  ["home-promos"],
  { revalidate: 3600, tags: ["products"] }
)

const getRituelConfigCached = unstable_cache(
  async () => {
    try {
      const row = await prisma.siteSetting.findUnique({ where: { key: "rituel_section" } })
      if (!row) return { mediaType: "video" as const, url: "/videos/aaa.mp4" }
      const parsed = JSON.parse(row.value) as { mediaType: "image" | "video"; url: string }
      if (!parsed.mediaType || !parsed.url) return { mediaType: "video" as const, url: "/videos/aaa.mp4" }
      return parsed
    } catch {
      return { mediaType: "video" as const, url: "/videos/aaa.mp4" }
    }
  },
  ["home-rituel-config"],
  { revalidate: 3600, tags: ["site-settings"] }
)

const getHomeCategoriesCached = unstable_cache(
  () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
      select: { name: true, slug: true, imageUrl: true },
    }),
  ["home-categories"],
  { revalidate: 3600, tags: ["categories"] }
)

const HOME_SETTING_KEYS = [
  "hero_tagline",
  "hero_heading",
  "hero_description",
  "rituel_title",
  "rituel_description",
  "engagements",
  "testimonials",
  "newsletter_description",
] as const

const getHomeSettingsCached = unstable_cache(
  async () => {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [...HOME_SETTING_KEYS] } },
    })
    const result: Record<string, string> = {}
    for (const row of rows) result[row.key] = row.value
    return result
  },
  ["home-settings"],
  { revalidate: 3600, tags: ["site-settings"] }
)

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [bestSellers, promos, rituelConfig, categories, settings] = await Promise.all([
    getBestSellersCached(),
    getPromoProductsCached(),
    getRituelConfigCached(),
    getHomeCategoriesCached(),
    getHomeSettingsCached(),
  ])

  const heroTagline = settings.hero_tagline ?? HERO_DEFAULTS.tagline
  const heroHeadingRaw = settings.hero_heading ?? HERO_DEFAULTS.heading
  const [heroLine1, heroLine2] = heroHeadingRaw.split("|")
  const heroDesc = settings.hero_description ?? HERO_DEFAULTS.description

  const rituelTitleRaw = settings.rituel_title ?? RITUEL_DEFAULTS.title
  const [rituelLine1, rituelLine2] = rituelTitleRaw.split("|")
  const rituelDesc = settings.rituel_description ?? RITUEL_DEFAULTS.description

  let engagements: Engagement[] = DEFAULT_ENGAGEMENTS
  if (settings.engagements) {
    try {
      const parsed = JSON.parse(settings.engagements) as Engagement[]
      if (Array.isArray(parsed) && parsed.length > 0) engagements = parsed
    } catch { /* use default */ }
  }

  let testimonials: Review[] = DEFAULT_TESTIMONIALS
  if (settings.testimonials) {
    try {
      const parsed = JSON.parse(settings.testimonials) as Review[]
      if (Array.isArray(parsed) && parsed.length > 0) testimonials = parsed
    } catch { /* use default */ }
  }

  const newsletterDesc = settings.newsletter_description ??
    "Rituels inédits, offres privées et avant-premières réservées aux membres."

  // JSON-LD uses only hardcoded static data — no user input
  const orgJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Ka Cosmetic",
    description: "Boutique de cosmétiques luxe à Abidjan. Livraison même jour.",
    url: "https://kacosmetic.ci",
    logo: "https://kacosmetic.ci/logo.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abidjan",
      addressCountry: "CI",
    },
    priceRange: "$$",
    currenciesAccepted: "XOF",
    paymentAccepted: "Wave, Orange Money, MTN MoMo, Visa, Mastercard",
  })

  return (
    <>
      {/* eslint-disable-next-line react/no-danger -- JSON-LD, static data only, no XSS risk */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgJsonLd }} />

      {/* ── Hero plein écran ─────────────────────────────────── */}
      <section className="relative flex min-h-[100dvh] w-full items-end overflow-hidden bg-brun-dark pb-12 pt-32 md:pb-24">
        <div className="absolute inset-0 z-0">
          <HeroVideo
            videoSrc="/videos/hero.mp4"
            posterSrc="https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=85&w=2574&auto=format&fit=crop"
            alt="Femme africaine au teint lumineux"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(31,31,31,0.92) 0%, rgba(31,31,31,0.18) 50%, transparent 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-8">
          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">

            <div className="col-span-1 flex flex-col gap-6 md:col-span-8 md:gap-8">
              <p
                className="hero-reveal text-[10px] font-semibold uppercase tracking-[0.32em]"
                style={{ animationDelay: "80ms", color: "rgba(201,162,39,0.75)" }}
              >
                {heroTagline}
              </p>

              <h1
                className="hero-reveal font-display text-fluid-hero text-or italic"
                style={{ animationDelay: "200ms" }}
              >
                {heroLine1}
                {heroLine2 && (
                  <>
                    <br />
                    <span className="text-ivoire not-italic">{heroLine2}</span>
                  </>
                )}
              </h1>

              <p
                className="hero-reveal max-w-md text-base font-light leading-relaxed md:text-lg"
                style={{ animationDelay: "400ms", color: "rgba(248,245,241,0.80)" }}
              >
                {heroDesc}
              </p>

              <div
                className="hero-reveal flex flex-col gap-3 pt-2 sm:flex-row sm:items-center"
                style={{ animationDelay: "600ms" }}
              >
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-4 rounded-full bg-brun px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-or hover:text-ebene hover:scale-[1.02] shadow-[0_0_40px_rgba(143,89,34,0.3)] hover:shadow-[0_0_50px_rgba(201,162,39,0.5)]"
                >
                  Explorer La Collection
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#bestsellers"
                  className="hero-cta-secondary inline-flex items-center gap-2 px-4 py-4 text-xs uppercase tracking-[0.2em] transition-colors"
                >
                  Nos meilleures ventes
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </a>
              </div>
            </div>

            <div
              className="hero-reveal hidden flex-col items-end gap-8 pb-4 md:col-span-4 md:flex"
              style={{ animationDelay: "700ms" }}
            >
              <div className="text-right">
                <p className="font-mono text-2xl" style={{ color: "#C9A227" }}>100%</p>
                <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: "rgba(248,245,241,0.75)" }}>Ingrédients Nobles</p>
                <p className="mt-1 text-[10px] font-light" style={{ color: "rgba(248,245,241,0.40)" }}>Certifié Cruelty-Free</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl" style={{ color: "#C9A227" }}>+4 800</p>
                <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: "rgba(248,245,241,0.75)" }}>Clientes Satisfaites</p>
                <div className="mt-1 flex justify-end gap-0.5" aria-label="4.9 étoiles sur 5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#C9A227" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden="true">
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(248,245,241,0.60)" }}>Défiler</span>
          <div className="h-10 w-px" style={{ background: "linear-gradient(to bottom, rgba(248,245,241,0.30), transparent)" }} />
        </div>
      </section>

      {/* ── Marquee divider gold ──────────────────────────────── */}
      <MarqueeDivider />

      {/* ── Catégories bento ─────────────────────────────────── */}
      <section className="fade-in-section px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <h2 className="font-display text-4xl font-light text-ebene md:text-5xl lg:text-6xl leading-none">
              L&apos;Essence de<br />
              <em className="text-brun not-italic">la Beauté</em>
            </h2>
            <Link
              href="/catalogue"
              className="text-xs uppercase tracking-[0.2em] text-ebene border-b border-or pb-1 transition-colors hover:text-brun"
            >
              Tout Voir
            </Link>
          </div>

          <div className="flex h-[60vh] overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar md:grid md:grid-cols-3 md:grid-rows-2 md:h-[620px] md:overflow-visible md:pb-0">
            {categories.map((cat, i) => {
              const imgSrc =
                cat.imageUrl ??
                CATEGORY_FALLBACK_IMAGES[cat.slug] ??
                DEFAULT_CATEGORY_IMAGE
              const colSpan =
                i === 0
                  ? "md:col-span-2 md:row-span-2"
                  : "md:col-span-1 md:row-span-1"
              return (
                <Link
                  key={cat.slug}
                  href={`/catalogue/${cat.slug}`}
                  className={`image-zoom-container group relative flex-shrink-0 w-[80vw] snap-center overflow-hidden rounded-2xl cursor-pointer ${colSpan} md:w-auto`}
                >
                  <Image
                    src={imgSrc}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(31,31,31,0.82) 0%, transparent 60%)" }}
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <span className="block font-sans text-[10px] uppercase tracking-[0.3em] text-or mb-1.5">
                        0{i + 1}
                      </span>
                      <h3 className="font-display text-2xl text-white md:text-3xl">{cat.name}</h3>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-or text-or transition-all duration-300 group-hover:bg-or group-hover:text-ebene">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section id="bestsellers" className="fade-in-section px-4 py-20 md:px-8 md:py-24 bg-creme">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">
                  Bestsellers
                </p>
                <h2 className="font-display text-3xl font-light text-ebene md:text-5xl">
                  Nos Incontournables
                </h2>
              </div>
              <Link href="/catalogue" className="text-xs uppercase tracking-[0.2em] text-ebene border-b border-or pb-1 transition-colors hover:text-brun">
                Tout voir
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:gap-8">
              {bestSellers.map((product) => {
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
                    inStock={(variant?.stock ?? 0) - (variant?.reservedStock ?? 0) > 0}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand story split screen ──────────────────────────── */}
      <section className="fade-in-section overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
          <div className="relative h-[50vh] md:h-auto order-2 md:order-1">
            {rituelConfig.mediaType === "video" ? (
              <video
                src={rituelConfig.url}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={rituelConfig.url}
                alt="Ingrédients botaniques Ka Cosmetic"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="bg-ivoire flex flex-col justify-center items-start px-8 py-16 md:px-16 lg:px-24 order-1 md:order-2">
            <span className="text-3xl text-or mb-6" aria-hidden="true">✦</span>
            <h2 className="font-display text-3xl text-ebene mb-5 md:text-5xl">
              {rituelLine1}
              {rituelLine2 && (
                <>
                  {" "}
                  <em className="text-brun not-italic">{rituelLine2}</em>
                </>
              )}
            </h2>
            <p className="text-sm leading-loose text-taupe max-w-md mb-8 md:text-base">
              {rituelDesc}
            </p>
            <Link
              href="/a-propos"
              className="group flex items-center gap-3 text-sm uppercase tracking-widest text-brun transition-colors hover:text-brun-dark"
            >
              Notre Histoire
              <span className="block h-px w-8 bg-brun transition-all duration-300 group-hover:w-12 group-hover:bg-brun-dark" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promotions ───────────────────────────────────────── */}
      <PromoSection
        products={promos
          .filter((p) => p.variants[0]?.comparePrice)
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            categoryName: p.category.name,
            price: p.variants[0]?.price ?? 0,
            comparePrice: p.variants[0]?.comparePrice ?? 0,
            imageUrl: p.images[0]?.url ?? "/placeholder-product.jpg",
          }))}
      />

      {/* ── Avis clients ─────────────────────────────────────── */}
      <TestimonialsSection reviews={testimonials} />

      {/* ── Newsletter ───────────────────────────────────────── */}
      <NewsletterSection description={newsletterDesc} />

      {/* ── Nos engagements ──────────────────────────────────── */}
      <section className="fade-in-section px-4 py-20 md:px-8 md:py-24" style={{ background: "linear-gradient(160deg, #1F1F1F 0%, #2d1a09 100%)" }}>
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 text-center">
            <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
              Notre ADN
            </span>
            <h2 className="font-display text-3xl font-light md:text-5xl" style={{ color: "#F8F5F1" }}>
              Nos{" "}
              <em className="not-italic" style={{ color: "#C9A227" }}>Engagements</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {engagements.map((item, i) => (
              <div
                key={item.title || i}
                className="flex flex-col items-center text-center rounded-2xl px-8 py-10"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)" }}
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(201,162,39,0.12)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.3)" }}
                >
                  {ENGAGEMENT_ICONS[i % ENGAGEMENT_ICONS.length]}
                </div>
                <h3 className="font-display text-xl mb-3" style={{ color: "#F8F5F1" }}>{item.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(248,245,241,0.55)" }}>{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/a-propos"
              className="engagement-cta inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-xs uppercase tracking-widest transition-all duration-300"
            >
              En savoir plus
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <HeroScrollInit />
    </>
  )
}
