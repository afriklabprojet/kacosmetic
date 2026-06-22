import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ShoppingBag, TrendingUp, Clock, AlertTriangle, Package, Tag, Users, Truck } from "lucide-react"

export const dynamic = "force-dynamic"

async function getDashboardStats() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    totalOrders,
    ordersLast30Days,
    ordersLast7Days,
    revenueAggregate,
    revenueLast30,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    inDeliveryOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockVariants,
    outOfStockVariants,
    totalProducts,
    activeProducts,
    totalCustomers,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } } }),
    prisma.order.aggregate({
      where: { status: { in: ["CONFIRMED", "PREPARING", "IN_DELIVERY", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ["CONFIRMED", "PREPARING", "IN_DELIVERY", "DELIVERED"] },
      },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.order.count({ where: { status: "IN_DELIVERY" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.productVariant.count({ where: { isActive: true, stock: { gt: 0, lte: 5 } } }),
    prisma.productVariant.count({ where: { isActive: true, stock: { lte: 0 } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
  ])

  return {
    totalOrders,
    ordersLast30Days,
    ordersLast7Days,
    totalRevenue: revenueAggregate._sum.total ?? 0,
    revenueLast30: revenueLast30._sum.total ?? 0,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    inDeliveryOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockVariants,
    outOfStockVariants,
    totalProducts,
    activeProducts,
    totalCustomers,
    recentOrders,
  }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:     "bg-yellow-100 text-yellow-800",
  CONFIRMED:   "bg-blue-100 text-blue-800",
  PREPARING:   "bg-purple-100 text-purple-800",
  IN_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED:   "bg-green-100 text-green-800",
  CANCELLED:   "bg-red-100 text-red-800",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:     "En attente",
  CONFIRMED:   "Confirmée",
  PREPARING:   "En préparation",
  IN_DELIVERY: "En livraison",
  DELIVERED:   "Livrée",
  CANCELLED:   "Annulée",
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  href,
}: Readonly<{
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent?: string
  href?: string
}>) {
  const inner = (
    <div className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${accent ?? "border-or-light"}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-taupe">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-or/10" : "bg-creme"}`}>
          <Icon size={16} className={accent ? "text-or" : "text-brun"} />
        </span>
      </div>
      <p className="font-display text-2xl font-bold text-ebene">{value}</p>
      {sub && <p className="mt-1 text-xs text-taupe">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const inProgress = stats.confirmedOrders + stats.preparingOrders + stats.inDeliveryOrders

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ebene md:text-3xl">Dashboard</h1>
        <p className="text-xs text-taupe">
          {new Date().toLocaleDateString("fr-CI", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="CA total"
          value={`${stats.totalRevenue.toLocaleString("fr-CI")} FCFA`}
          sub={`${stats.revenueLast30.toLocaleString("fr-CI")} FCFA ce mois`}
          icon={TrendingUp}
          accent="border-or/30"
        />
        <KpiCard
          label="Commandes"
          value={stats.totalOrders.toLocaleString("fr-CI")}
          sub={`${stats.ordersLast7Days} cette semaine`}
          icon={ShoppingBag}
          href="/admin/orders"
        />
        <KpiCard
          label="En attente paiement"
          value={stats.pendingOrders.toString()}
          sub={stats.pendingOrders > 0 ? "À traiter rapidement" : "Rien en attente"}
          icon={Clock}
          accent={stats.pendingOrders > 0 ? "border-yellow-300" : "border-or-light"}
          href="/admin/orders?status=PENDING"
        />
        <KpiCard
          label="Stock faible"
          value={(stats.lowStockVariants + stats.outOfStockVariants).toString()}
          sub={`${stats.outOfStockVariants} rupture · ${stats.lowStockVariants} faible`}
          icon={AlertTriangle}
          accent={stats.outOfStockVariants > 0 ? "border-red-300" : "border-or-light"}
          href="/admin/products"
        />
      </div>

      {/* KPIs secondaires */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="En cours"
          value={inProgress.toString()}
          sub="Confirmées + Préparation + Livraison"
          icon={Truck}
          href="/admin/orders?status=IN_DELIVERY"
        />
        <KpiCard
          label="Livrées"
          value={stats.deliveredOrders.toLocaleString("fr-CI")}
          sub="Total commandes livrées"
          icon={Package}
          href="/admin/orders?status=DELIVERED"
        />
        <KpiCard
          label="Produits actifs"
          value={`${stats.activeProducts} / ${stats.totalProducts}`}
          sub="Dans le catalogue"
          icon={Tag}
          href="/admin/products"
        />
        <KpiCard
          label="Clients"
          value={stats.totalCustomers.toLocaleString("fr-CI")}
          sub="Comptes enregistrés"
          icon={Users}
        />
      </div>

      {/* Pipeline commandes */}
      <div className="mb-8 grid grid-cols-3 gap-3 md:grid-cols-6">
        {[
          { label: "En attente", count: stats.pendingOrders, color: "bg-yellow-50 border-yellow-200 text-yellow-800", status: "PENDING" },
          { label: "Confirmées", count: stats.confirmedOrders, color: "bg-blue-50 border-blue-200 text-blue-800", status: "CONFIRMED" },
          { label: "Préparation", count: stats.preparingOrders, color: "bg-purple-50 border-purple-200 text-purple-800", status: "PREPARING" },
          { label: "En livraison", count: stats.inDeliveryOrders, color: "bg-orange-50 border-orange-200 text-orange-800", status: "IN_DELIVERY" },
          { label: "Livrées", count: stats.deliveredOrders, color: "bg-green-50 border-green-200 text-green-800", status: "DELIVERED" },
          { label: "Annulées", count: stats.cancelledOrders, color: "bg-red-50 border-red-200 text-red-800", status: "CANCELLED" },
        ].map(({ label, count, color, status }) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={`rounded-lg border p-3 text-center transition-opacity hover:opacity-80 ${color}`}
          >
            <p className="font-display text-2xl font-bold">{count}</p>
            <p className="mt-0.5 text-xs font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* Commandes récentes */}
      <div className="rounded-xl border border-or-light bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-or-light px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ebene">Commandes récentes</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-or hover:underline">
            Voir toutes →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ivoire text-xs text-taupe">
            <tr>
              {["Numéro", "Client", "Articles", "Total", "Statut", "Date", ""].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-creme">
            {stats.recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-ivoire/50">
                <td className="px-4 py-3 font-mono text-xs text-ebene">{order.orderNumber}</td>
                <td className="px-4 py-3 text-sm text-ebene">
                  {order.user?.name ?? order.guestFirstName ?? "Invité"}
                </td>
                <td className="px-4 py-3 text-center text-ebene">{order._count.items}</td>
                <td className="px-4 py-3 text-sm font-medium text-ebene">
                  {order.total.toLocaleString("fr-CI")} FCFA
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-taupe">
                  {new Date(order.createdAt).toLocaleDateString("fr-CI", {
                    day: "2-digit", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-xs font-medium text-or hover:underline">
                    Détail →
                  </Link>
                </td>
              </tr>
            ))}
            {stats.recentOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-taupe">
                  Aucune commande pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
