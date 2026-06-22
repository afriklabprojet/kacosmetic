"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"

interface CartItem {
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

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

// Module-level cache: skip API fetch when cart contents haven't changed
let cachedCartKey = ""
let cachedItems: CartItem[] = []

export default function CartDrawer({ open, onClose }: Readonly<CartDrawerProps>) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadCart = useCallback(async ({ force = false } = {}) => {
    const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
    const entries = Object.entries(raw)
    if (!entries.length) {
      cachedCartKey = ""
      cachedItems = []
      setItems([])
      return
    }

    const currentKey = JSON.stringify(raw)
    if (!force && currentKey === cachedCartKey) {
      setItems(cachedItems)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams(entries.map(([id, qty]) => ["ids", `${id}:${qty}`]))
      const res = await fetch(`/api/cart?${params}`)
      if (res.ok) {
        const data = await res.json() as { items: CartItem[] }
        cachedCartKey = currentKey
        cachedItems = data.items
        setItems(data.items)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) void loadCart()
  }, [open, loadCart])

  useEffect(() => {
    function handleCartUpdate() {
      void loadCart({ force: true })
    }
    window.addEventListener("cart:updated", handleCartUpdate)
    return () => window.removeEventListener("cart:updated", handleCartUpdate)
  }, [loadCart])

  // Trap focus and close on Escape
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

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
      cachedCartKey = JSON.stringify(cart)
      cachedItems = next
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
      cachedCartKey = JSON.stringify(cart)
      cachedItems = next
      localStorage.setItem("ka_cart", JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart } }))
      return next
    })
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="drawer-overlay"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Panier"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5D5C5] px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-[#1A0A00]">Mon panier</h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 text-[#6B5744] hover:bg-[#F0E8DC]"
            aria-label="Fermer le panier"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-sm" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <ShoppingBag size={48} className="mb-4 text-[#E5D5C5]" />
              <p className="font-display text-lg text-[#6B5744]">Votre panier est vide</p>
              <button
                onClick={onClose}
                className="btn-primary mt-4"
              >
                Découvrir la boutique
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5D5C5]">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <Link href={`/produit/${item.slug}`} onClick={onClose} className="flex-shrink-0">
                    <div className="relative h-16 w-14 overflow-hidden rounded-sm bg-[#F0E8DC]">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/produit/${item.slug}`}
                          onClick={onClose}
                          className="text-sm font-medium text-[#1A0A00] hover:text-[#C9A84C] leading-tight"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[#6B5744]">{item.variantName}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-[#6B5744] hover:text-[#C0392B]"
                        aria-label={`Supprimer ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-sm border border-[#E5D5C5]">
                        <button
                          onClick={() => updateQuantity(item.variantId, -1)}
                          className="flex h-7 w-7 items-center justify-center text-[#1A0A00] hover:bg-[#F0E8DC]"
                          aria-label="Diminuer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="flex h-7 w-7 items-center justify-center text-[#1A0A00] hover:bg-[#F0E8DC] disabled:opacity-40"
                          aria-label="Augmenter"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-[#1A0A00]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E5D5C5] bg-[#FAF6F1] px-5 py-5 pb-safe">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#6B5744]">Sous-total</span>
              <span className="font-semibold text-[#1A0A00]">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/checkout/informations"
              onClick={onClose}
              className="btn-primary block w-full text-center py-3"
            >
              Commander
            </Link>
            <Link
              href="/panier"
              onClick={onClose}
              className="mt-2 block text-center text-xs text-[#6B5744] hover:text-[#C9A84C]"
            >
              Voir le panier complet
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
