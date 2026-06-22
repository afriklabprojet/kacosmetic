"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Loader } from "lucide-react"
import Image from "next/image"
import Stepper from "@/components/Checkout/Stepper"

interface CartItem {
  variantId: string
  quantity: number
  price: number
  name: string
  variantName: string
  imageUrl: string
}

interface CheckoutInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  commune: string
  address: string
  notes: string
}

interface CheckoutDelivery {
  zoneId: string
  price: number
  type: "J0" | "J1"
}

type PaymentMethod = "ORANGE_MONEY" | "MTN_MONEY" | "WAVE" | "MOOV_MONEY" | "DJAMO" | "VISA" | "MASTERCARD"

interface PaymentOption {
  id: PaymentMethod
  label: string
  logo: string
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "ORANGE_MONEY", label: "Orange Money", logo: "/payment/orange-money.svg" },
  { id: "MTN_MONEY", label: "MTN MoMo", logo: "/payment/mtn-money.svg" },
  { id: "WAVE", label: "Wave", logo: "/payment/wave.svg" },
  { id: "MOOV_MONEY", label: "Moov Money", logo: "/payment/moov-money.svg" },
  { id: "DJAMO", label: "Djamo", logo: "/payment/djamo.svg" },
  { id: "VISA", label: "Visa", logo: "/payment/visa.svg" },
  { id: "MASTERCARD", label: "Mastercard", logo: "/payment/mastercard.svg" },
]

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default function CheckoutPaiementPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [info, setInfo] = useState<CheckoutInfo | null>(null)
  const [delivery, setDelivery] = useState<CheckoutDelivery | null>(null)
  const [method, setMethod] = useState<PaymentMethod>("WAVE")
  const [discount, setDiscount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const rawInfo = sessionStorage.getItem("ka_checkout_info")
    const rawDelivery = sessionStorage.getItem("ka_checkout_delivery")
    if (!rawInfo || !rawDelivery) { router.replace("/checkout/informations"); return }

    const parsedInfo = JSON.parse(rawInfo) as CheckoutInfo
    const parsedDelivery = JSON.parse(rawDelivery) as CheckoutDelivery
    setInfo(parsedInfo)
    setDelivery(parsedDelivery)

    const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
    const entries = Object.entries(raw)
    if (!entries.length) { router.replace("/panier"); return }

    const discountStr = sessionStorage.getItem("ka_checkout_discount")
    if (discountStr) setDiscount(Number(discountStr))

    async function fetchCart() {
      const params = new URLSearchParams(entries.map(([id, qty]) => ["ids", `${id}:${qty}`]))
      const res = await fetch(`/api/cart?${params}`)
      if (res.ok) {
        const data = await res.json() as { items: CartItem[] }
        setItems(data.items)
      }
    }
    void fetchCart()
  }, [router])

  async function handlePlaceOrder() {
    if (!info || !delivery || !items.length) return
    setSubmitting(true)
    setError(null)

    try {
      const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
      const body = {
        customerInfo: info,
        deliveryZoneId: delivery.zoneId,
        paymentMethod: method,
        items: Object.entries(raw).map(([variantId, quantity]) => ({ variantId, quantity })),
        couponCode: sessionStorage.getItem("ka_checkout_coupon") ?? undefined,
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json() as { orderId?: string; paymentUrl?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.")
        return
      }

      // Nettoyer le panier uniquement après confirmation du serveur
      if (data.paymentUrl || data.orderId) {
        localStorage.removeItem("ka_cart")
        window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart: {} } }))
        sessionStorage.removeItem("ka_checkout_info")
        sessionStorage.removeItem("ka_checkout_delivery")
        sessionStorage.removeItem("ka_checkout_discount")
        sessionStorage.removeItem("ka_checkout_coupon")
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (data.orderId) {
        router.push(`/confirmation/${data.orderId}`)
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = delivery?.price ?? 0
  const total = subtotal + deliveryFee - discount

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Stepper currentStep={3} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ebene">Mode de paiement</h2>
            <Link href="/checkout/livraison" className="text-xs text-or hover:underline">
              ← Modifier
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {PAYMENT_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <label
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border p-3 transition-colors ${
                    method === opt.id
                      ? "border-or bg-ivoire"
                      : "border-or-light hover:border-or/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={method === opt.id}
                    onChange={() => setMethod(opt.id)}
                    className="sr-only"
                  />
                  <div className="relative h-8 w-16">
                    <Image
                      src={opt.logo}
                      alt={opt.label}
                      fill
                      className="object-contain"
                      sizes="64px"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-ebene text-center">{opt.label}</span>
                </label>
              </li>
            ))}
          </ul>

          {/* Récap livraison */}
          {info && (
            <div className="rounded-md border border-or-light p-4 text-sm text-taupe space-y-1">
              <p className="font-medium text-ebene">{info.firstName} {info.lastName}</p>
              <p>{info.address}, {info.commune}</p>
              <p>{info.phone}</p>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-erreur/30 bg-erreur/5 p-4 text-sm text-erreur">
              {error}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || !items.length}
            aria-busy={submitting}
            className="btn-primary w-full py-3 gap-2 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <Loader size={18} className="animate-spin" />
                Traitement en cours...
              </>
            ) : (
              `Confirmer la commande — ${formatPrice(total)}`
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-taupe">
            <ShieldCheck size={14} className="text-succes" />
            Paiement sécurisé via Jeko Africa. Vos données sont protégées.
          </div>
        </div>

        {/* Récapitulatif commande */}
        <div className="rounded-md border border-or-light bg-ivoire p-5 h-fit">
          <h3 className="font-display mb-3 text-base font-semibold text-ebene">Votre commande</h3>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3">
                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-creme">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-ebene">{item.name}</p>
                  <p className="text-xs text-taupe">{item.variantName} × {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-ebene">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-or-light pt-3 text-sm text-taupe">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-succes">
                <span>Réduction</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-or-light pt-2 font-semibold text-ebene">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
