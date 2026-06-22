"use client"

import { useState } from "react"
import { ShoppingBag, Check, Loader } from "lucide-react"

interface AddToCartButtonProps {
  variantId: string
  productName: string
  quantity?: number
  disabled?: boolean
}

export default function AddToCartButton({
  variantId,
  productName,
  quantity = 1,
  disabled = false,
}: Readonly<AddToCartButtonProps>) {
  const [state, setState] = useState<"idle" | "loading" | "added">("idle")

  async function handleAddToCart() {
    if (disabled || state !== "idle") return

    setState("loading")
    try {
      // Panier localStorage (guest) — synchronisé avec DB à la connexion
      const cart: Record<string, number> = JSON.parse(
        localStorage.getItem("ka_cart") ?? "{}"
      )
      cart[variantId] = (cart[variantId] ?? 0) + quantity
      localStorage.setItem("ka_cart", JSON.stringify(cart))

      // Dispatcher un event pour mettre à jour le compteur dans le Header
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart } }))

      setState("added")
      setTimeout(() => setState("idle"), 2000)
    } catch {
      setState("idle")
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || state === "loading"}
      className="btn-primary w-full gap-2 py-3"
      aria-label={`Ajouter ${productName} au panier`}
    >
      {state === "loading" && <Loader size={18} className="animate-spin" />}
      {state === "added" && <Check size={18} />}
      {state === "idle" && <ShoppingBag size={18} />}
      {state === "added" ? "Ajouté !" : state === "loading" ? "Ajout..." : "Ajouter au panier"}
    </button>
  )
}
