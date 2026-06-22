import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { transitionOrder, canTransition } from "@/lib/order-state-machine"
import { OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ArrowLeft, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:     "En attente de paiement",
  CONFIRMED:   "Confirmée",
  PREPARING:   "En préparation",
  IN_DELIVERY: "En livraison",
  DELIVERED:   "Livrée",
  CANCELLED:   "Annulée",
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:     "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED:   "bg-blue-100 text-blue-800 border-blue-200",
  PREPARING:   "bg-purple-100 text-purple-800 border-purple-200",
  IN_DELIVERY: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED:   "bg-green-100 text-green-800 border-green-200",
  CANCELLED:   "bg-red-100 text-red-800 border-red-200",
}

const TRANSITION_LABELS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED:   "Confirmer la commande",
  PREPARING:   "Marquer En préparation",
  IN_DELIVERY: "Marquer En livraison",
  DELIVERED:   "Marquer Livrée",
  CANCELLED:   "Annuler",
}

const TRANSITION_STYLES: Partial<Record<OrderStatus, string>> = {
  CONFIRMED:   "bg-blue-600 hover:bg-blue-700 text-white",
  PREPARING:   "bg-purple-600 hover:bg-purple-700 text-white",
  IN_DELIVERY: "bg-orange-500 hover:bg-orange-600 text-white",
  DELIVERED:   "bg-green-600 hover:bg-green-700 text-white",
  CANCELLED:   "border border-red-300 text-red-600 hover:bg-red-50",
}

async function transitionAction(orderId: string, to: OrderStatus, _formData: FormData) {
  "use server"
  try {
    await transitionOrder(orderId, to)
  } catch (err: unknown) {
    console.error("[admin] transition échouée", err)
  }
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let order: Awaited<ReturnType<typeof fetchOrder>> = null
  try {
    order = await fetchOrder(id)
  } catch {
    notFound()
  }
  if (!order) notFound()

  const possibleTransitions = (
    ["CONFIRMED", "PREPARING", "IN_DELIVERY", "DELIVERED", "CANCELLED"] as OrderStatus[]
  ).filter((s) => canTransition(order!.status, s))

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-xs text-taupe hover:text-brun"
        >
          <ArrowLeft size={14} />
          Commandes
        </Link>
        <span className="text-xs text-taupe/50">/</span>
        <span className="font-mono text-sm text-ebene">{order.orderNumber}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">

          {/* En-tête statut */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-or-light bg-white p-5 shadow-sm">
            <div>
              <p className="mb-1 text-xs text-taupe">Numéro de commande</p>
              <p className="font-mono text-xl font-bold text-ebene">{order.orderNumber}</p>
              <p className="mt-1 text-xs text-taupe">
                {new Date(order.createdAt).toLocaleDateString("fr-CI", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${STATUS_COLOR[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          {/* Actions de transition */}
          {possibleTransitions.length > 0 && (
            <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">
                Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {possibleTransitions.map((status) => (
                  <form key={status} action={transitionAction.bind(null, order!.id, status)}>
                    <button
                      type="submit"
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${TRANSITION_STYLES[status]}`}
                    >
                      {TRANSITION_LABELS[status]}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          <div className="overflow-hidden rounded-lg border border-or-light bg-white shadow-sm">
            <div className="border-b border-or-light px-5 py-3">
              <p className="text-sm font-semibold text-ebene">Articles ({order.items.length})</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-ivoire text-xs text-taupe">
                <tr>
                  <th className="px-4 py-2 text-left">Produit</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-right">P.U.</th>
                  <th className="px-4 py-2 text-right">Qté</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-creme">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ebene">{item.productName}</p>
                      <p className="text-xs text-taupe">{item.variantName}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-taupe">{item.sku}</td>
                    <td className="px-4 py-3 text-right text-ebene">
                      {item.unitPrice.toLocaleString("fr-CI")} FCFA
                    </td>
                    <td className="px-4 py-3 text-right text-ebene">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ebene">
                      {item.total.toLocaleString("fr-CI")} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-or-light bg-ivoire text-sm">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-taupe">Sous-total</td>
                  <td className="px-4 py-2 text-right text-ebene">{order.subtotal.toLocaleString("fr-CI")} FCFA</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-taupe">
                      Réduction {order.couponCode ? `(${order.couponCode})` : ""}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      -{order.discount.toLocaleString("fr-CI")} FCFA
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-taupe">Livraison</td>
                  <td className="px-4 py-2 text-right text-ebene">{order.deliveryFee.toLocaleString("fr-CI")} FCFA</td>
                </tr>
                <tr className="font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-right text-ebene">Total</td>
                  <td className="px-4 py-2 text-right text-brun">
                    {order.total.toLocaleString("fr-CI")} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Historique statuts */}
          <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-ebene">Historique</p>
            <ol className="space-y-3">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[h.status]}`}>
                    {STATUS_LABEL[h.status]}
                  </span>
                  <div className="text-xs text-taupe">
                    <p>{new Date(h.createdAt).toLocaleDateString("fr-CI", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}</p>
                    {h.note && <p className="mt-0.5 italic">{h.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">

          {/* Client */}
          <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">Client</p>
            {order.user ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium text-ebene">{order.user.name}</p>
                <p className="text-taupe">{order.user.email}</p>
                {order.user.phone && <p className="text-taupe">{order.user.phone}</p>}
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="font-medium text-ebene">
                  {order.guestFirstName} {order.guestLastName}
                </p>
                {order.guestEmail && <p className="text-taupe">{order.guestEmail}</p>}
                {order.guestPhone && <p className="text-taupe">{order.guestPhone}</p>}
                <p className="text-xs text-taupe/70 italic">Commande invité</p>
              </div>
            )}
          </div>

          {/* Livraison */}
          <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">Livraison</p>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-ebene">
                {order.deliveryType === "J0" ? "Livraison J0 (même jour)" : "Livraison J+1"}
              </p>
              {order.deliveryCommune && (
                <p className="text-taupe">{order.deliveryCommune}</p>
              )}
              {order.deliveryAddress && (
                <p className="text-taupe">{order.deliveryAddress}</p>
              )}
              {order.zone && (
                <p className="text-xs text-taupe/70">Zone : {order.zone.name}</p>
              )}
            </div>
          </div>

          {/* Paiement */}
          <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">Paiement</p>
            {order.payments.length > 0 ? (
              <div className="space-y-2">
                {order.payments.map((p) => (
                  <div key={p.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-ebene">{p.method.replace("_", " ")}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "SUCCESS" ? "bg-green-100 text-green-700" :
                        p.status === "FAILED"  ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    {p.transactionId && (
                      <p className="mt-0.5 font-mono text-xs text-taupe">{p.transactionId}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-taupe">Aucun paiement enregistré</p>
            )}
          </div>

          {/* Facture */}
          {order.invoice && (
            <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">Facture</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-ebene">{order.invoice.invoiceNumber}</p>
                  <p className="text-xs text-taupe">
                    {new Date(order.invoice.issuedAt).toLocaleDateString("fr-CI")}
                  </p>
                </div>
                <a
                  href={order.invoice.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-or/40 px-3 py-1.5 text-xs font-medium text-brun hover:bg-or/10"
                >
                  <FileText size={12} />
                  PDF
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="rounded-lg border border-or-light bg-white p-5 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-taupe">Notes client</p>
              <p className="text-sm text-taupe italic">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

async function fetchOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      payments: true,
      invoice: true,
      zone: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  })
}
