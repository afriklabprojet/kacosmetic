"use client"

import { useEffect, useState, useCallback } from "react"
import { Heart } from "lucide-react"

interface WishlistButtonProps {
  productId: string
  productName: string
  className?: string
  size?: number
}

export default function WishlistButton({ productId, productName, className = "", size = 14 }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.ok ? res.json() : null)
      .then((data: { items: string[] } | null) => {
        if (data?.items) setIsWishlisted(data.items.includes(productId))
      })
      .catch(() => {/* unauthenticated or network error — no-op */})
  }, [productId])

  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (res.status === 401) {
        window.location.href = `/connexion?next=${encodeURIComponent(window.location.pathname)}`
        return
      }
      if (res.ok) {
        const data = await res.json() as { added: boolean }
        setIsWishlisted(data.added)
      }
    } catch {
      // silent — no toast needed for wishlist failures
    } finally {
      setLoading(false)
    }
  }, [productId, loading])

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={isWishlisted ? `Retirer ${productName} de mes favoris` : `Ajouter ${productName} à mes favoris`}
      aria-pressed={isWishlisted}
      className={className}
    >
      <Heart
        size={size}
        strokeWidth={1.5}
        className={`transition-colors ${isWishlisted ? "fill-or stroke-or" : "fill-transparent stroke-current"}`}
      />
    </button>
  )
}
