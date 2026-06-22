import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getOrderById } from "@/lib/services/order.service"
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft } from "lucide-react"
import { WHATSAPP_URL } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Suivi de commande — Ka Cosmetic",
  robots: { index: false },
}

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ orderId: string }>
}

const STATUS_STEPS = [
  { key: "PENDING",     label: "En attente",      icon: Clock,        description: "Commande reçue, en attente de confirmation" },
  { key: "CONFIRMED",   label: "Confirmée",        icon: CheckCircle,  description: "Votre commande a été confirmée" },
  { key: "PREPARING",   label: "En préparation",   icon: Package,      description: "Votre colis est en cours de préparation" },
  { key: "IN_DELIVERY", label: "En livraison",     icon: Truck,        description: "Votre colis est en route" },
  { key: "DELIVERED",   label: "Livrée",           icon: CheckCircle,  description: "Commande livrée avec succès" },
] as const

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  IN_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-CI", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

export default async function OrderTrackingPage({ params }: Props) {
  const { orderId } = await params
  const session = await auth()
  if (!session?.user) redirect(`/connexion?next=/compte/commandes/${orderId}`)

  const order = await getOrderById(orderId)
  // IDOR guard: ensure the order belongs to the authenticated user
  if (!order || order.userId !== session.user.id) notFound()

  const currentStepIndex = STATUS_ORDER[order.status] ?? 0
  const isCancelled = order.status === "CANCELLED"

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">

      {/* Retour */}
      <Link
        href="/compte/commandes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-taupe transition-colors hover:text-or"
      >
        <ChevronLeft size={16} />
        Mes commandes
      </Link>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ebene">
          Commande #{order.id.slice(-8).toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-taupe">{formatDate(order.createdAt)}</p>
      </div>

      {/* Timeline de suivi */}
      {!isCancelled ? (
        <div className="mb-8 rounded-md border border-or-light bg-white p-6">
          <h2 className="font-display mb-6 text-base font-semibold text-ebene">Suivi de votre commande</h2>
          <ol className="space-y-0">
            {STATUS_STEPS.map((step, i) => {
              const isCompleted = i <= currentStepIndex
              const isCurrent = i === currentStepIndex
              const Icon = step.icon
              return (
                <li key={step.key} className="relative flex gap-4">
                  {/* Ligne verticale */}
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`absolute left-[18px] top-9 h-full w-px ${isCompleted ? "bg-or" : "bg-or-light"}`}
                      aria-hidden="true"
                    />
                  )}

                  {/* Icône */}
                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? "border-or bg-or text-ebene"
                        : "border-or-light bg-white text-taupe"
                    }`}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Texte */}
                  <div className="pb-8">
                    <p className={`font-medium ${isCurrent ? "text-or" : isCompleted ? "text-ebene" : "text-taupe"}`}>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-or/10 px-2 py-0.5 text-[10px] font-medium text-or">
                          Statut actuel
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-taupe">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      ) : (
        <div className="mb-8 flex items-center gap-3 rounded-md border border-erreur/20 bg-erreur/5 p-4">
          <XCircle size={20} className="shrink-0 text-erreur" />
          <p className="text-sm text-erreur">Cette commande a été annulée.</p>
        </div>
      )}

      {/* Détails commande */}
      <div className="space-y-4">
        <div className="rounded-md border border-or-light bg-white p-5">
          <h2 className="font-display mb-4 text-base font-semibold text-ebene">Articles commandés</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ebene">
                  {item.variant.product.name}{" "}
                  <span className="text-taupe">× {item.quantity}</span>
                </span>
                <span className="font-medium text-ebene">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-or-light pt-3 font-semibold text-ebene">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.deliveryAddress && (
          <div className="rounded-md border border-or-light bg-white p-5">
            <h2 className="font-display mb-2 text-base font-semibold text-ebene">Adresse de livraison</h2>
            <p className="text-sm text-taupe">{order.deliveryAddress}</p>
            {order.deliveryCommune && <p className="text-sm text-taupe">{order.deliveryCommune}</p>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/catalogue" className="btn-primary flex-1 text-center py-3">
          Continuer mes achats
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex-1 text-center py-3"
        >
          Contacter le support
        </a>
      </div>
    </div>
  )
}
