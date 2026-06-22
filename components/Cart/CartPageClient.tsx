"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, Tag } from "lucide-react"

interface CartEntry {
  variantId: string
  quantity: number
  name: string
  variantName: string
  price: number
  imageUrl: string
  slug: string
  maxStock: number
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default function CartPageClient() {
  const [items, setItems] = useState<CartEntry[]>([])
  const [coupon, setCoupon] = useState("")
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    async function loadCart() {
      const raw: Record<string, number> = JSON.parse(
        localStorage.getItem("ka_cart") ?? "{}"
      )
      if (!Object.keys(raw).length) { setLoading(false); return }

      try {
        const res = await fetch("/api/cart?" + new URLSearchParams(
          Object.entries(raw).map(([id, qty]) => [`ids`, `${id}:${qty}`])
        ))
        if (res.ok) {
          const data = await res.json() as { items: CartEntry[] }
          setItems(data.items)
        }
      } finally {
        setLoading(false)
      }
    }
    void loadCart()
  }, [])

  function updateQuantity(variantId: string, delta: number) {
    setItems((prev) => {
      const next = prev
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: Math.min(item.quantity + delta, item.maxStock) }
            : item
        )
        .filter((item) => item.quantity > 0)

      const cart: Record<string, number> = {}
      next.forEach((i) => { cart[i.variantId] = i.quantity })
      localStorage.setItem("ka_cart", JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart } }))
      return next
    })
  }

  function removeItem(variantId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.variantId !== variantId)
      const cart: Record<string, number> = {}
      next.forEach((i) => { cart[i.variantId] = i.quantity })
      localStorage.setItem("ka_cart", JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart } }))
      return next
    })
  }

  async function applyCoupon() {
    if (!coupon.trim()) return
    setCouponLoading(true)
    try {
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim(), subtotal }),
      })
      const data = await res.json() as { valid: boolean; discount?: number; error?: string }
      if (data.valid && data.discount) {
        setDiscount(data.discount)
        setCouponMsg({ text: `Code appliqué — ${formatPrice(data.discount)} de réduction`, ok: true })
      } else {
        setCouponMsg({ text: data.error ?? "Code invalide", ok: false })
      }
    } finally {
      setCouponLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-md" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display mb-4 text-xl text-taupe">Votre panier est vide</p>
        <Link href="/catalogue" className="btn-primary inline-flex">
          Découvrir la boutique
        </Link>
      </div>
    )
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = subtotal - discount

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Liste articles */}
      <div className="lg:col-span-2">
        <ul className="divide-y divide-[#E5D5C5]">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-4">
              <Link href={`/produit/${item.slug}`} className="flex-shrink-0">
                <div className="relative h-20 w-16 overflow-hidden rounded-sm bg-creme">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/produit/${item.slug}`} className="font-medium text-ebene hover:text-[#C9A84C]">
                      {item.name}
                    </Link>
                    <p className="text-sm text-taupe">{item.variantName}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-taupe hover:text-erreur"
                    aria-label={`Supprimer ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-sm border border-or-light">
                    <button
                      onClick={() => updateQuantity(item.variantId, -1)}
                      className="flex h-8 w-8 items-center justify-center text-ebene hover:bg-creme"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="flex h-8 w-8 items-center justify-center text-ebene hover:bg-creme disabled:opacity-40"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-ebene">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Récapitulatif */}
      <div className="rounded-md border border-or-light bg-ivoire p-6 h-fit">
        <h2 className="font-display mb-4 text-lg font-semibold text-ebene">Récapitulatif</h2>

        {/* Code promo */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-ebene">
            Code promo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="BIENVENUE10"
              className="flex-1 rounded-sm border border-or-light px-3 py-2 text-sm text-ebene placeholder:text-taupe/50 focus:border-or focus:outline-none"
              maxLength={20}
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading || !coupon.trim()}
              className="btn-secondary py-2 px-3 text-xs"
            >
              <Tag size={14} />
            </button>
          </div>
          {couponMsg && (
            <p className={`mt-1.5 text-xs ${couponMsg.ok ? "text-succes" : "text-erreur"}`}>
              {couponMsg.text}
            </p>
          )}
        </div>

        {/* Totaux */}
        <div className="space-y-2 border-t border-or-light pt-4 text-sm">
          <div className="flex justify-between text-taupe">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-succes">
              <span>Réduction</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-taupe">
            <span>Livraison</span>
            <span>Calculée au checkout</span>
          </div>
          <div className="flex justify-between border-t border-or-light pt-2 text-base font-semibold text-ebene">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Link href="/checkout/informations" className="btn-primary mt-6 block w-full text-center">
          Passer la commande
        </Link>
      </div>
    </div>
  )
}
