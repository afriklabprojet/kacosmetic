import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserOrders } from "@/lib/services/order.service"
import { prisma } from "@/lib/prisma"
import { Package, Heart, MapPin, User, ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Mon compte — Ka Cosmetic",
  robots: { index: false },
}

export const dynamic = "force-dynamic"

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-CI", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d))
}

const ACCOUNT_LINKS = [
  {
    href: "/compte/commandes",
    icon: Package,
    label: "Mes commandes",
    description: "Suivre vos commandes en cours",
  },
  {
    href: "/compte/wishlist",
    icon: Heart,
    label: "Mes favoris",
    description: "Produits sauvegardés",
  },
  {
    href: "/compte/adresses",
    icon: MapPin,
    label: "Mes adresses",
    description: "Gérer vos adresses de livraison",
  },
]

export default async function ComptePage() {
  const session = await auth()
  if (!session?.user) redirect("/connexion?next=/compte")

  const [orders, wishlistCount] = await Promise.all([
    getUserOrders(session.user.id),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
  ])

  const recentOrders = orders.slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">

      {/* Profil */}
      <div className="mb-10 flex items-center gap-4">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "Profil"}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-or/30"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-creme ring-2 ring-or/30">
            <User size={24} className="text-taupe" />
          </div>
        )}
        <div>
          <h1 className="font-display text-xl font-semibold text-ebene">
            {session.user.name ?? "Mon compte"}
          </h1>
          <p className="text-sm text-taupe">{session.user.email}</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-or-light bg-white p-4 text-center">
          <p className="font-display text-2xl font-semibold text-ebene">{orders.length}</p>
          <p className="mt-0.5 text-xs text-taupe">Commandes</p>
        </div>
        <div className="rounded-md border border-or-light bg-white p-4 text-center">
          <p className="font-display text-2xl font-semibold text-ebene">{wishlistCount}</p>
          <p className="mt-0.5 text-xs text-taupe">Favoris</p>
        </div>
        <div className="hidden rounded-md border border-or-light bg-white p-4 text-center sm:block">
          <p className="font-display text-2xl font-semibold text-ebene">
            {orders.filter((o) => o.status === "DELIVERED").length}
          </p>
          <p className="mt-0.5 text-xs text-taupe">Livrées</p>
        </div>
      </div>

      {/* Navigation compte */}
      <nav className="mb-10 space-y-2" aria-label="Mon compte">
        {ACCOUNT_LINKS.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-md border border-or-light bg-white px-4 py-4 transition-colors hover:border-or hover:bg-ivoire"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-creme text-or">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ebene">{label}</p>
              <p className="text-xs text-taupe">{description}</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-taupe" />
          </Link>
        ))}
      </nav>

      {/* Commandes récentes */}
      {recentOrders.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ebene">Commandes récentes</h2>
            <Link href="/compte/commandes" className="text-xs text-or hover:underline">
              Tout voir →
            </Link>
          </div>
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/confirmation/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-or-light bg-white px-4 py-3 text-sm transition-colors hover:border-or"
                >
                  <div>
                    <p className="font-mono font-semibold text-ebene">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-taupe">{formatDate(order.createdAt)}</p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-taupe" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
