import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import Link from "next/link"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 25
const MAX_QUERY_LENGTH = 100

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:     "En attente",
  CONFIRMED:   "Confirmée",
  PREPARING:   "En préparation",
  IN_DELIVERY: "En livraison",
  DELIVERED:   "Livrée",
  CANCELLED:   "Annulée",
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:     "bg-yellow-100 text-yellow-800",
  CONFIRMED:   "bg-blue-100 text-blue-800",
  PREPARING:   "bg-purple-100 text-purple-800",
  IN_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED:   "bg-green-100 text-green-800",
  CANCELLED:   "bg-red-100 text-red-800",
}

const ALL_STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const rawQ = params.q ?? ""
  const rawStatus = params.status ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)

  const query = rawQ.slice(0, MAX_QUERY_LENGTH).trim()
  const statusFilter = ALL_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" as const } },
            { guestEmail: { contains: query, mode: "insensitive" as const } },
            { guestFirstName: { contains: query, mode: "insensitive" as const } },
            { guestLastName: { contains: query, mode: "insensitive" as const } },
            { user: { email: { contains: query, mode: "insensitive" as const } } },
            { user: { name: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  }

  let orders: Awaited<ReturnType<typeof fetchOrders>> = []
  let total = 0
  try {
    ;[orders, total] = await Promise.all([
      fetchOrders(where, page),
      prisma.order.count({ where }),
    ])
  } catch (err) {
    console.error("[admin/orders] prisma error", err)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged: Record<string, string | undefined> = {
      q: query || undefined,
      status: statusFilter,
      page: page > 1 ? String(page) : undefined,
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const qs = p.toString()
    return `/admin/orders${qs ? `?${qs}` : ""}`
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ebene">Commandes</h1>
        <span className="text-sm text-taupe">{total.toLocaleString("fr-CI")} commande{total > 1 ? "s" : ""}</span>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form action="/admin/orders" className="min-w-0 flex-1">
          <div className="relative max-w-xs">
            <input
              name="q"
              defaultValue={query}
              placeholder="Numéro, client, email…"
              maxLength={MAX_QUERY_LENGTH}
              className="w-full rounded-md border border-or-light bg-white py-1.5 pl-3 pr-8 text-sm text-ebene placeholder-taupe/50 focus:border-or focus:outline-none"
            />
            <button type="submit" aria-label="Rechercher" className="absolute inset-y-0 right-0 flex items-center px-2 text-taupe">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          </div>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <Link
            href={buildUrl({ status: undefined, page: undefined })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !statusFilter ? "bg-brun text-white" : "bg-creme text-taupe hover:bg-or/10"
            }`}
          >
            Tous
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s, page: undefined })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-brun text-white" : "bg-creme text-taupe hover:bg-or/10"
              }`}
            >
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-or-light bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-or-light bg-ivoire">
            <tr>
              {["Numéro", "Client", "Articles", "Total", "Statut", "Date", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-taupe"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-creme">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-ivoire/50">
                <td className="px-4 py-3 font-mono text-xs text-ebene">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ebene">
                    {order.user?.name ?? order.guestFirstName ?? "Invité"}
                  </p>
                  <p className="text-xs text-taupe">{order.user?.email ?? order.guestEmail ?? ""}</p>
                </td>
                <td className="px-4 py-3 text-center text-ebene">{order._count.items}</td>
                <td className="px-4 py-3 font-medium text-ebene">
                  {order.total.toLocaleString("fr-CI")} FCFA
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                  >
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
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs font-medium text-or hover:underline"
                  >
                    Détail →
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-taupe">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-xs text-taupe">
            Page {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="rounded-md border border-or-light px-3 py-1.5 text-xs text-brun hover:bg-creme"
              >
                ← Précédente
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="rounded-md border border-or-light px-3 py-1.5 text-xs text-brun hover:bg-creme"
              >
                Suivante →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

async function fetchOrders(where: object, page: number) {
  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  })
}
