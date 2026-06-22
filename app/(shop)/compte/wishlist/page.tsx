import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Ma liste de souhaits — Ka Cosmetic",
  robots: { index: false },
}

export const dynamic = "force-dynamic"

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default async function CompteWishlistPage() {
  const session = await auth()
  if (!session?.user) redirect("/connexion?next=/compte/wishlist")

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1, select: { url: true, blurHash: true } },
          variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="font-display mb-8 text-2xl font-semibold text-ebene">
        Ma liste de souhaits
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-or-light" />
          <p className="font-display text-lg text-taupe">Votre liste est vide</p>
          <p className="mt-1 text-sm text-taupe">
            Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter à vos favoris.
          </p>
          <Link href="/catalogue" className="btn-primary mt-4 inline-flex">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-6">
          {wishlistItems.map(({ product }) => {
            const variant = product.variants[0]
            const image = product.images[0]
            const inStock = (variant?.stock ?? 0) - (variant?.reservedStock ?? 0) > 0
            return (
              <Link key={product.id} href={`/produit/${product.slug}`} className="group card-product">
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-creme">
                  <Image
                    src={image?.url ?? "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    placeholder={image?.blurHash ? "blur" : "empty"}
                    blurDataURL={image?.blurHash ?? undefined}
                  />
                  {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <span className="text-xs font-medium text-[#C0392B]">Épuisé</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 px-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-or">
                    {product.category.name}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ebene line-clamp-2">
                    {product.name}
                  </p>
                  {variant && (
                    <p className="mt-1 text-sm font-semibold text-ebene">
                      {formatPrice(variant.price)}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
