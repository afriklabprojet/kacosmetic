"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Truck, Zap } from "lucide-react"
import Stepper from "@/components/Checkout/Stepper"

interface DeliveryZone {
  id: string
  name: string
  price: number
  deliveryType: "J0" | "J1"
  communes: string[]
}

interface CartItem {
  variantId: string
  quantity: number
  price: number
  name: string
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default function CheckoutLivraisonPage() {
  const router = useRouter()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string>("")
  const [items, setItems] = useState<CartItem[]>([])
  const [commune, setCommune] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const info = sessionStorage.getItem("ka_checkout_info")
    if (!info) { router.replace("/checkout/informations"); return }

    const parsed = JSON.parse(info) as { commune: string }
    setCommune(parsed.commune)

    const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
    const entries = Object.entries(raw)
    if (!entries.length) { router.replace("/panier"); return }

    async function fetchAll() {
      try {
        const [cartRes, zonesRes] = await Promise.all([
          fetch(`/api/cart?${new URLSearchParams(entries.map(([id, qty]) => ["ids", `${id}:${qty}`]))}`),
          fetch("/api/delivery/zones"),
        ])
        if (cartRes.ok) {
          const data = await cartRes.json() as { items: CartItem[] }
          setItems(data.items)
        }
        if (zonesRes.ok) {
          const data = await zonesRes.json() as { zones: DeliveryZone[] }
          setZones(data.zones)
          // Pre-select matching zone based on commune
          if (parsed.commune) {
            const match = data.zones.find((z) =>
              z.communes.some((c) =>
                c.toLowerCase().includes(parsed.commune.toLowerCase()) ||
                parsed.commune.toLowerCase().includes(c.toLowerCase())
              )
            )
            if (match) setSelectedZoneId(match.id)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    void fetchAll()
  }, [router])

  function handleContinue() {
    if (!selectedZoneId) return
    const zone = zones.find((z) => z.id === selectedZoneId)
    if (!zone) return
    sessionStorage.setItem("ka_checkout_delivery", JSON.stringify({ zoneId: zone.id, price: zone.price, type: zone.deliveryType }))
    router.push("/checkout/paiement")
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const selectedZone = zones.find((z) => z.id === selectedZoneId)
  const total = subtotal + (selectedZone?.price ?? 0)

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Stepper currentStep={2} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-md" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Stepper currentStep={2} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ebene">Mode de livraison</h2>
            <Link href="/checkout/informations" className="text-xs text-or hover:underline">
              ← Modifier
            </Link>
          </div>

          {commune && (
            <p className="text-sm text-taupe">
              Livraison vers <span className="font-medium text-ebene">{commune}</span>
            </p>
          )}

          {zones.length === 0 ? (
            <div className="rounded-md border border-or-light bg-ivoire p-6 text-center">
              <p className="text-sm text-taupe">
                Aucune zone de livraison trouvée pour votre commune. Contactez-nous au WhatsApp pour une livraison personnalisée.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {zones.map((zone) => (
                <li key={zone.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-md border p-4 transition-colors ${
                      selectedZoneId === zone.id
                        ? "border-or bg-ivoire"
                        : "border-or-light hover:border-or/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="zone"
                      value={zone.id}
                      checked={selectedZoneId === zone.id}
                      onChange={() => setSelectedZoneId(zone.id)}
                      className="mt-0.5 accent-[#C9A84C]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {zone.deliveryType === "J0" ? (
                          <Zap size={15} className="text-or" />
                        ) : (
                          <Truck size={15} className="text-taupe" />
                        )}
                        <span className="font-medium text-ebene">{zone.name}</span>
                        {zone.deliveryType === "J0" && (
                          <span className="rounded-full bg-or/10 px-2 py-0.5 text-xs font-medium text-or">
                            Aujourd&apos;hui
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-taupe">
                        {zone.deliveryType === "J0" ? "Livraison le jour même" : "Livraison J+1"}
                      </p>
                    </div>
                    <span className="font-semibold text-ebene">{formatPrice(zone.price)}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedZoneId}
            className="btn-primary w-full py-3 disabled:opacity-40"
          >
            Continuer vers le paiement
          </button>
        </div>

        {/* Résumé */}
        <div className="rounded-md border border-or-light bg-ivoire p-5 h-fit">
          <h3 className="font-display mb-3 text-base font-semibold text-ebene">Récapitulatif</h3>
          <div className="space-y-2 text-sm text-taupe">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{selectedZone ? formatPrice(selectedZone.price) : "—"}</span>
            </div>
          </div>
          <div className="mt-3 border-t border-or-light pt-3 flex justify-between font-semibold text-ebene">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
