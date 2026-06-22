import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserOrders } from "@/lib/services/order.service"
import { Package } from "lucide-react"

export const metadata: Metadata = {
  title: "Mes commandes — Ka Cosmetic",
  robots: { index: false },
}

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  IN_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-or bg-or/10",
  CONFIRMED: "text-succes bg-succes/10",
  PREPARING: "text-blue-600 bg-blue-50",
  IN_DELIVERY: "text-purple-600 bg-purple-50",
  DELIVERED: "text-succes bg-succes/10",
  CANCELLED: "text-erreur bg-erreur/10",
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-CI", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d))
}

export default async function CompteCommandesPage() {
  const session = await auth()
  if (!session?.user) redirect("/connexion?next=/compte/commandes")

  const orders = await getUserOrders(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display mb-8 text-2xl font-semibold text-ebene">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={48} className="mx-auto mb-4 text-or-light" />
          <p className="font-display text-lg text-taupe">Aucune commande pour l&apos;instant</p>
          <Link href="/catalogue" className="btn-primary mt-4 inline-flex">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-md border border-or-light bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ebene">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-taupe">{formatDate(order.createdAt)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? "text-[#6B5744] bg-[#F0E8DC]"}`}
                >
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-3 border-t border-or-light pt-3">
                <ul className="space-y-1 text-sm text-taupe">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.variant.product.name} × {item.quantity}</span>
                      <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between font-semibold text-ebene">
                  <span className="text-sm">Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="mt-3">
                <Link
                  href={`/compte/commandes/${order.id}`}
                  className="text-xs text-or hover:underline"
                >
                  Voir le détail →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
