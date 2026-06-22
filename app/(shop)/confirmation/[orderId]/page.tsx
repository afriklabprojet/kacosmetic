import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Package, MessageCircle } from "lucide-react"
import { getOrderById } from "@/lib/services/order.service"
import PaymentStatusPoller from "./PaymentStatusPoller"
import { WHATSAPP_URL } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Commande confirmée — Ka Cosmetic",
  robots: { index: false },
}

interface Props {
  params: Promise<{ orderId: string }>
}


function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default async function ConfirmationPage({ params }: Props) {
  const { orderId } = await params
  const order = await getOrderById(orderId)

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-taupe">Commande introuvable.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-succes/10">
          <CheckCircle size={36} className="text-succes" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ebene md:text-3xl">
          Merci pour votre commande !
        </h1>
        <p className="mt-2 text-taupe">
          Vous recevrez une confirmation par SMS et email.
        </p>
      </div>

      <div className="rounded-md border border-or-light bg-ivoire p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-taupe">Numéro de commande</span>
          <span className="font-mono text-sm font-semibold text-ebene">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-taupe">Statut</span>
          <PaymentStatusPoller orderId={order.id} initialStatus={order.status} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-taupe">Total</span>
          <span className="font-semibold text-ebene">{formatPrice(order.total)}</span>
        </div>

        {order.deliveryAddress && (
          <div className="border-t border-or-light pt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-taupe">
              Adresse de livraison
            </p>
            <p className="text-sm text-ebene">{order.deliveryAddress}</p>
            {order.deliveryCommune && (
              <p className="text-sm text-taupe">{order.deliveryCommune}</p>
            )}
          </div>
        )}

        <div className="border-t border-or-light pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">
            Articles commandés
          </p>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-ebene">
                  {item.variant.product.name}{" "}
                  <span className="text-taupe">× {item.quantity}</span>
                </span>
                <span className="text-ebene">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-md border border-or-light p-4">
          <Package size={20} className="mt-0.5 flex-shrink-0 text-or" />
          <div className="text-sm">
            <p className="font-medium text-ebene">Suivi de commande</p>
            <p className="text-taupe">Vous serez notifié par SMS à chaque étape.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-md border border-or-light p-4">
          <MessageCircle size={20} className="mt-0.5 flex-shrink-0 text-or" />
          <div className="text-sm">
            <p className="font-medium text-ebene">Une question ?</p>
            <p className="text-taupe">
              Contactez-nous sur{" "}
              <a href={WHATSAPP_URL} className="text-or hover:underline" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/catalogue" className="btn-primary flex-1 text-center py-3">
          Continuer mes achats
        </Link>
        <Link href="/compte/commandes" className="btn-secondary flex-1 text-center py-3">
          Mes commandes
        </Link>
      </div>
    </div>
  )
}
